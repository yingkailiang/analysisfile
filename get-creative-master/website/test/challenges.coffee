challenges = require '../app/challenges'
users = require '../app/users'
should = require 'should'

describe "Adding New Challenges", ->
    challenge_prompt = "This is a text challenge"
    text_challenge =
        prompt  : challenge_prompt
        type    : "text"

    before (done) ->
        # Give DB Fetcher time to set up
        setTimeout done, 500

    after (done) ->
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list done

    it "adds a challenge to the hopper", (done) ->
        challenges.add_challenge_to_hopper text_challenge, (result) ->
            result.should.be.true
            done()
    it "gets the correct challenge hopper", (done) ->
        challenges.get_challenge_hopper (hopper) ->
            hopper.length.should.equal 1
            hopper[0].prompt.should.equal challenge_prompt
            done()
    it "adds a challenge from the hopper to the challenges list", (done) ->
        challenges.add_challenge_from_hopper (result) ->
            result.should.be.true
            done()
    it "gets the challenge we added from list", (done) ->
        challenges.get_last_x_challenges 1, (results) ->
            results.length.should.equal 1
            result = results[0]
            result.prompt.should.equal challenge_prompt
            done()
    it "removed the challenge from the hopper when adding it to the list", (done) ->
        challenges.get_challenge_hopper (hopper) ->
            hopper.should.be.empty
            done()
    it "removes a challenge from the hopper", (done) ->
        challenges.add_challenge_to_hopper text_challenge, (result) ->
            done new Error "Didn't properly add the challenge to hopper" unless result
            challenges.remove_challenge_from_hopper 0, (result) ->
                result.should.be.true
                challenges.get_challenge_hopper (hopper) ->
                    hopper.should.be.empty
                    done()

describe "Challenge Object", ->
    challenge = null

    before (done) ->
        challenges.add_challenge_to_hopper {prompt : "Test", type : "text"}, (result) ->
            challenges.add_challenge_from_hopper ->
                challenges.get_last_x_challenges 1, (results) ->
                    challenge = results[0]
                    done()

    after (done) ->
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list done

    it "has a proper uuid", (done) ->
        challenge._id.length.should.equal 36
        done()
    it "gets empty responses when there are no replies", (done) ->
        challenge.get_responses null, (results) ->
            results.should.be.empty
            done()
    it "gets a string for a url", ->
        challenge.get_url().should.be.a 'string'
    it "gets a number for a page count", ->
        challenge.get_page_count().should.be.a 'number'
    it "can remove itself from the list", (done) ->
        challenge.remove (result) ->
            challenges.get_last_x_challenges 1, (results) ->
                should.not.exist results
                done()

describe "Responses", ->
    response = null
    parent_challenge = null
    author = null
    other_user = null
    challenge_prompt = "Parent challenge prompt"
    response_text = "Replying to the post"

    before (done) ->
        challenges.add_challenge_to_hopper {prompt : challenge_prompt, type : "text"}, (result) ->
            challenges.add_challenge_from_hopper ->
                challenges.get_last_x_challenges 1, (results) ->
                    parent_challenge = results[0]
                    users.helpers.generate_new_user (err, new_user) ->
                        author = new_user
                        done()
    after (done) ->
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list (err) ->
                done err if err
                challenges.testing.clear_responses_list (err) ->
                    done err if err
                    author.remove ->
                        other_user.remove ->
                            done()

    it "adds a response to a challenge", (done) ->
        new_response =
            text        : response_text
            author_id   : author._id
        challenges.add_response_to_challenge parent_challenge._id, new_response, (result) ->
            should.exist result
            response = result
            done()
    it "gets a challenge from id", (done) ->
        challenges.get_challenge parent_challenge._id, (result) ->
            result._id.should.equal parent_challenge._id
            done()
    it "gets challenges from x to y", (done) ->
        challenges.get_challenges_x_to_y 0, 1, (results) ->
            results.length.should.equal 1
            done()
    it "gets responses authored by a user", (done) ->
        challenges.get_responses_for_user author._id, null, (results) ->
            results.length.should.equal 1
            results[0]._id.should.equal response._id
            done()
    it "does not allow a user to like their own response", (done) ->
        challenges.like_response response._id, author._id, (result) ->
            result.should.be.an.instanceof Error
            done()
    it "allows another user to like the response", (done) ->
        users.helpers.generate_new_user (err, new_user) ->
            other_user = new_user
            challenges.like_response response._id, other_user._id, (result) ->
                should.not.exist result
                done()
    it "gets parent challenge of response", (done) ->
        response.get_parent_challenge (result) ->
            result._id.should.equal parent_challenge._id
            done()
    it "can hide a challenge", (done) ->
        response.hide false, (response) ->
            response.is_hidden.should.be.true
            done()
    it "can get the author data", (done) ->
        response.get_author_data (data) ->
            data._id.should.equal author._id
            done()
    it "gets a string for the text", ->
        response.get_text().should.be.a 'string'
    it "can be removed from self", (done) ->
        response.remove true, (response) ->
            challenges.get_responses_for_user author._id, null, (results) ->
                results.should.be.empty
                done()

describe "Admin Functions", ->
    challenge = null
    response = null
    challenge_name = "Testing Challenge"

    before (done) ->
        challenges.add_challenge_to_hopper {prompt : challenge_name, type : "text"}, (result) ->
            challenges.add_challenge_from_hopper ->
                challenges.get_last_x_challenges 1, (results) ->
                    challenge = results[0]
                    new_response =
                        text        : "Testing"
                    challenges.add_response_to_challenge challenge._id, new_response, (result) ->
                        response = result
                        done()
    after (done) ->
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list (err) ->
                done err if err
                challenges.testing.clear_responses_list done

    it "can rename a challenge", (done) ->
        challenges.rename_challenge challenge._id, "New Name", (result) ->
            result.should.be.true
            challenges.get_last_x_challenges 1, (results) ->
                results[0].prompt.should.equal "New Name"
                done()
    it "can remove a response", (done) ->
        challenges.remove_response response._id, (result) ->
            result.should.be.true
            done()
    it "can remove a challenge", (done) ->
        challenges.remove_challenge challenge._id, (result) ->
            result.should.be.true
            challenges.get_last_x_challenges 1, (results) ->
                should.not.exist results
                done()

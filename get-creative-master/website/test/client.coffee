Zombie = require 'zombie'
assert = require 'assert'
should = require 'should'
challenges = require '../app/challenges'
users = require '../app/users'

BASE_URL = "http://127.0.0.1:7002"

# Wait for DB Fetchers to be ready
describe "Client Base Tests", ->
    browser = null

    before (done) ->
        # Set up challenges
        setTimeout ->
            challenges.add_challenge_to_hopper {prompt : "Text challenge", type : "text"}, (response) ->
                challenges.add_challenge_from_hopper ->
                    done()
        , 500
        return
    after (done) ->
        # Clean out challenges and responses
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list (err) ->
                done err if err
                challenges.testing.clear_responses_list (err) ->
                    done err if err
                    users.testing.clear_users (err) ->
                        done err if err
                        done()

    beforeEach ->
        browser = new Zombie()

    it "should have actually saved the challenges to the list", (done) ->
        challenges.get_last_x_challenges 7, (results) ->
            results.length.should.equal 1
            done()
    it "root page loads with link to extension", (done) ->
        browser.visit("#{BASE_URL}/").then(->
            browser.location.pathname.should.equal "/"
            browser.queryAll("a.install_link").should.not.be.empty
            return
        ).then done, done
    it "loads the extension base and gets the challenges and default challenge", (done) ->
        browser.visit("#{BASE_URL}/local_extension_base").then(->
            assert.equal browser.queryAll("ul.challenges li").length, 1, "Correct number of challenges"
            assert.equal browser.text("ul.challenges p.prompt"), "Text challenge", "Correct challenge list prompt"
            assert.equal browser.text(".challenge p.challenge_prompt"), "Text challenge", "Opened the only challenge"
            return
        ).then done, done
    it "can post a reply", (done) ->
        reply_text = "This is a reply"
        browser.visit("#{BASE_URL}/local_extension_base").then(->
            browser.fill "textarea", reply_text
            browser.wait 200, ->
                browser.pressButton("Submit").then(->
                    assert.equal browser.queryAll("ul.responses li").length, 1, "Reply appears after submit"
                    assert.equal browser.text("ul.responses li p"), reply_text, "Reply text is what it should be"
                ).then done, done
        ).fail((err) ->
            done err
        )
    it "can get to a challenge from the navigation sidebar", (done) ->
        prompt = "Testing nav sidebar"
        challenges.add_challenge_to_hopper {prompt : prompt, type : "text"}, ->
            challenges.add_challenge_from_hopper ->
                browser.visit("#{BASE_URL}/local_extension_base").then(->
                    assert.equal browser.text(".challenge p.challenge_prompt"), prompt, "Make sure we start on most recent challenge"
                    browser.clickLink("ul.challenges li:nth-child(2) a.js_link").then(->
                        assert.equal browser.text(".challenge p.challenge_prompt"), "Text challenge", "And the challenge has updated after clicking the link"
                    ).then done, done
                ).fail((err) ->
                    done err
                )
    it "saves challenge to local storage and opens to that page", (done) ->
        challenge_prompt = null
        reply_text = "This should get saved in local storage"
        browser.visit("#{BASE_URL}/local_extension_base").then ->
            browser.clickLink("ul.challenges li:nth-child(2) a").then(->
                challenge_prompt = browser.text ".challenge p.challenge_prompt"
                assert.equal challenge_prompt, "Text challenge", "Opened the first challenge"
                browser.fill "textarea", reply_text
                browser.wait 200, ->
                    # Key events don't fire so manually save state here
                    browser.window.get_creative.current_page.save_tool_state "textarea", ->
                        browser.window.get_creative.init()
                        browser.wait 200, ->
                            assert.equal browser.text(".challenge p.challenge_prompt"), challenge_prompt, "We get taken back to the in progress challenge"
                            actual_text = browser.window.get_creative.current_page.tools.textarea.get_state_data()
                            assert.equal actual_text, reply_text, "And the textarea is already filled with what we started writing"
                            done()
            ).fail((err) ->
                done err
            )

describe "Storage", ->
    browser = null

    before (done) ->
        challenges.add_challenge_to_hopper {prompt : "Text challenge", type : "text"}, (response) ->
            challenges.add_challenge_from_hopper ->
                browser = new Zombie()
                browser.visit("#{BASE_URL}/local_extension_base").then(->
                    return
                ).then done, done

    after (done) ->
        # Clean out challenges and responses
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list (err) ->
                done err if err
                challenges.testing.clear_responses_list (err) ->
                    done err if err
                    done()

    it "can set a property with a string", (done) ->
        browser.window.storage.set "foo", "bar", ->
            done()

    it "can get that property", (done) ->
        browser.window.storage.get "foo", (value) ->
            value.should.equal "bar"
            done()

    it "can remove a property", (done) ->
        browser.window.storage.remove "foo", ->
            browser.window.storage.get "foo", (value) ->
                should.not.exist value
                done()

    it "can set multiple properties", (done) ->
        browser.window.storage.set_many {foo: "bar", baz: "qux"}, ->
            done()

    it "can get multiple properties", (done) ->
        browser.window.storage.get_many ["foo", "baz"], (items) ->
            items.foo.should.equal "bar"
            items.baz.should.equal "qux"
            done()

    it "can remove multiple properties", (done) ->
        browser.window.storage.remove_many ["foo", "baz"], ->
            browser.window.storage.get_many ["foo", "baz"], (items) ->
                should.not.exist items.foo
                should.not.exist items.baz
                done()

describe "Registration", ->
    browser = null

    before (done) ->
        challenges.add_challenge_to_hopper {prompt : "Text challenge", type : "text"}, (response) ->
            challenges.add_challenge_from_hopper ->
                done()
    after (done) ->
        # Clean out challenges and responses
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list (err) ->
                done err if err
                challenges.testing.clear_responses_list (err) ->
                    done err if err
                    users.testing.clear_users (err) ->
                        done err if err
                        done()

    beforeEach (done) ->
        browser = new Zombie()
        browser.visit("#{BASE_URL}/local_extension_base").then(->
            return browser.clickLink "Save your progress"
        ).then done, done

    it "gets an error for an invalid username", (done) ->
        browser.fill "Username", "invalid-username"
        browser.fill "Password", "validpass"
        browser.pressButton "Register", ->
            browser.text(".register .form_feedback").indexOf("Username can only contain").should.not.equal -1
            done()
    it "gets an error for a blank username", (done) ->
        browser.fill "Password", "validpass"
        browser.pressButton "Register", ->
            browser.text(".register .form_feedback").indexOf("No username supplied").should.not.equal -1
            done()
    it "gets an error for an invalid password", (done) ->
        browser.fill "Username", "validusername"
        browser.fill "Password", "p"
        browser.pressButton "Register", ->
            browser.text(".register .form_feedback").indexOf("Password must be").should.not.equal -1
            done()
    it "gets an error for a blank password", (done) ->
        browser.fill "Username", "validusername"
        browser.pressButton "Register", ->
            browser.text(".register .form_feedback").indexOf("No password supplied").should.not.equal -1
            done()

    registered_browser = null
    it "can successfully register a user", (done) ->
        browser.fill "Username", "validusername"
        browser.fill "Password", "validpass"
        browser.pressButton "Register", ->
            browser.queryAll(".profile .add_email").length.should.equal 1
            registered_browser = browser
            done()
    it "gets an error for an invalid email", (done) ->
        registered_browser.fill "#js_add_email", "e"
        registered_browser.pressButton "Add Email", ->
            registered_browser.text(".add_email .form_feedback").indexOf("Not a valid email").should.not.equal -1
            done()
    it "can add a valid email", (done) ->
        browser.fill "Username", "anothervalidname"
        browser.fill "Password", "validpass"
        browser.pressButton "Register", ->
            browser.queryAll(".profile .add_email").length.should.equal 1
            browser.fill "#js_add_email", "email@dmauro.com"
            browser.query("#js_add_email").disabled = false
            browser.pressButton "Add Email", ->
                browser.queryAll(".add_email .form_feedback").length.should.equal 0
                registered_browser = browser
                done()
    it "should show empty profile after adding email", ->
        registered_browser.queryAll(".profile .empty_profile").length.should.equal 1

describe "Login", ->
    browser = null

    before (done) ->
        challenges.add_challenge_to_hopper {prompt : "Text challenge", type : "text"}, (response) ->
            challenges.add_challenge_from_hopper ->
                done()
    after (done) ->
        # Clean out challenges and responses
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list (err) ->
                done err if err
                challenges.testing.clear_responses_list (err) ->
                    done err if err
                    users.testing.clear_users (err) ->
                        done err if err
                        done()

    beforeEach (done) ->
        browser = new Zombie()
        browser.visit("#{BASE_URL}/local_extension_base").then(->
            return browser.clickLink "Save your progress"
        ).then(->
            return browser.clickLink "login"
        ).then done, done

    it "gets an error for an invalid username", (done) ->
        browser.fill "Username", "invalid-username"
        browser.fill "Password", "validpass"
        browser.pressButton "Log In", ->
            browser.text(".login .form_feedback").indexOf("Username can only contain").should.not.equal -1
            done()
    it "gets an error for a blank username", (done) ->
        browser.fill "Password", "validpass"
        browser.pressButton "Log In", ->
            browser.text(".login .form_feedback").indexOf("No username supplied").should.not.equal -1
            done()
    it "gets an error for an invalid password", (done) ->
        browser.fill "Username", "validusername"
        browser.fill "Password", "p"
        browser.pressButton "Log In", ->
            browser.text(".login .form_feedback").indexOf("Password must be").should.not.equal -1
            done()
    it "gets an error for a blank password", (done) ->
        browser.fill "Username", "validusername"
        browser.pressButton "Log In", ->
            browser.text(".login .form_feedback").indexOf("No password supplied").should.not.equal -1
            done()
    it "can successfully log in", (done) ->
        browser.fill "Username", "validusername"
        browser.fill "Password", "validpass"
        browser.pressButton "Log In", ->
            browser.queryAll(".profile .login").length.should.equal 0
            done()

describe "Textarea Tool", ->
    browser = null
    current_id = null
    textarea_tool = null

    before (done) ->
        challenges.add_challenge_to_hopper {prompt : "Text challenge", type : "text"}, (response) ->
            challenges.add_challenge_from_hopper ->
                browser = new Zombie()
                browser.visit("#{BASE_URL}/local_extension_base").then(->
                    textarea_tool = browser.window.get_creative.current_page.tools.textarea
                    return
                ).then done, done
    after (done) ->
        # Clean out challenges and responses
        challenges.testing.clear_hopper (err) ->
            done err if err
            challenges.testing.clear_challenges_list (err) ->
                done err if err
                challenges.testing.clear_responses_list (err) ->
                    done err if err
                    done()

    it "can get the global var", ->
        assert.equal browser.window.TextArea?, true, "Make sure we have the TextArea object"
    it "focuses the textarea by default", ->
        assert browser.document._focused == browser.query("textarea")
    it "button is only enabled when there is text", (done) ->
        assert.equal browser.queryAll(".challenge button[disabled]").length, 1, "Buttons starts as disabled"
        browser.fill "textarea", "some text"
        browser.wait 200, ->
            assert.equal browser.queryAll(".challenge button[disabled]").length, 0, "Button is enabled after adding text"
            browser.fill "textarea", ""
            browser.wait 200, ->
                assert.equal browser.queryAll(".challenge button[disabled]").length, 1, "Buttons back to disabled after removing text"
                done()
    it "can get the state data and restore from it", ->
        reply_text = "Fake reply text"
        browser.fill "textarea", reply_text
        state_data = textarea_tool.get_state_data()
        assert.equal state_data, reply_text, "Gets the correct state data"
        textarea_tool.set_state_data ""
        textarea_tool.set_state_data state_data
        assert.equal browser.text("textarea"), reply_text, "Sets the data correctly"
        submit_data = textarea_tool.get_submit_data()
        assert.equal submit_data, reply_text, "Submit data matches as well"

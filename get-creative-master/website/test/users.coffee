users = require '../app/users'
should = require 'should'

describe "Username validation", ->
    it "allows simple usernames", ->
        users.helpers.validate_username("david").should.be.true
    it "allows capital letters", ->
        users.helpers.validate_username("David").should.be.true
    it "allows underscores", ->
        users.helpers.validate_username("David_Mauro").should.be.true
    it "allows international characters", ->
        users.helpers.validate_username("dãvid").should.be.true
    it "allows numbers", ->
        users.helpers.validate_username("8675309").should.be.true

    it "doesn't allow usernames with spaces", ->
        users.helpers.validate_username("david mauro").should.not.be.true
    it "doesn't allow usernames with hyphens", ->
        users.helpers.validate_username("david-mauro").should.not.be.true
    it "doesn't allow strange unicode characters", ->
        users.helpers.validate_username("༼༎ຶ෴༎ຶ༽").should.not.be.true
    it "doesn't allow usernames with punctuation", ->
        users.helpers.validate_username(":)").should.not.be.true
    it "doesn't allow blank usernames", ->
        users.helpers.validate_username("").should.not.be.true
    it "doesn't allow fewer than 4 characters", ->
        users.helpers.validate_username("dav").should.not.be.true

describe "Password validation", ->
    it "allows a simple password", ->
        users.helpers.validate_password("badpassword").should.be.true
    it "allows long passwords", ->
        users.helpers.validate_password("veSP2juqutayeT?n-8apRerEm=zArUp!Va!E!@ubr#p#u6Ewej$nUSW?f3nA$ru_").should.be.true

    it "doesn't allow an empty password", ->
        users.helpers.validate_password("").should.not.be.true
    it "doesn't allow less than 6 characters", ->
        users.helpers.validate_password("david").should.not.be.true

describe "Email validation", ->
    it "allows a normal email", ->
        users.helpers.validate_email("email@dmauro.com").should.be.true
    it "allows a minimally short email", ->
        users.helpers.validate_email("d@m.c").should.be.true
    it "allows dots in email", ->
        users.helpers.validate_email("david.mauro@gmail.com").should.be.true
    it "allows hyphens in emails", ->
        users.helpers.validate_email("david-mauro@gmail.com").should.be.true

    it "doesn't allow blank emails", ->
        users.helpers.validate_email("").should.not.be.true
    it "doesn't allow something without an @ symbol", ->
        users.helpers.validate_email("fake").should.not.be.true

describe "User Registration and methods", ->
    user = null
    before (done) ->
        # Give DB Fetcher time to set up
        setTimeout ->
            users.helpers.generate_new_user (err, new_user) ->
                user = new_user
                done()
        , 500

    after (done) ->
        user.remove ->
            done()

    it "has added the user to the database", (done) ->
        users.get_user user._id, (db_user) ->
            db_user.should.be.a 'object'
            db_user._id.should.equal user._id
            done()
    it "registers the user", (done) ->
        users.register_user user, "db_test_username", "badpassword", (err, reg_user) ->
            reg_user._id.should.equal user._id
            reg_user.username.should.not.be.empty
            reg_user.password.should.not.be.empty
            reg_user.is_registered.should.be.true
            done()
    it "properly adds an email", (done) ->
        users.add_email_to_account user, "test@db.com", (err, user) ->
            user.email.should.equal "test@db.com"
            done()
    it "properly saves a session", (done) ->
        user.save_session "12345", ->
            user.session.should.equal "12345"
            done()
    it "authors a response", (done) ->
        fake_response =
            _id     : "12345"
            parent  : null
        user.author_response fake_response, ->
            user.responses_authored.length.should.equal 1
            user.responses_authored[0].should.equal "12345"
            done()
    it "removes the response", (done) ->
        user.remove_response "12345", (result) ->
            should.exist result
            user.responses_authored.should.be.empty
            done()
    it "adds challnges to completed list", (done) ->
        user.add_challenge_to_completed "12345", (result) ->
            should.exist result
            user.completed_challenges.length.should.equal 1
            user.completed_challenges[0].should.equal "12345"
            done()
    it "adds liked responses to list", (done) ->
        user.like_response "12345", (result) ->
            user.liked_responses.length.should.equal 1
            user.liked_responses[0].should.equal "12345"
            done()
    it "adds ip to list", (done) ->
        user.track_ip "123.456.1.1", (result) ->
            user.ip_addresses.length.should.equal 1
            user.ip_addresses[0].should.equal "123.456.1.1"
            done()
    it "bans user", (done) ->
        user.ban ->
            user.is_banned.should.be.true
            done()
    it "unbans the user", (done) ->
        user.unban ->
            user.is_banned.should.not.be.true
            done()
    it "should get user url", ->
        user.get_url().should.be.a "string"

describe "User Uniqueness", ->
    user = null
    before (done) ->
        # Give DB Fetcher time to set up
        setTimeout ->
            users.helpers.generate_new_user (err, new_user) ->
                users.register_user new_user, "test_username", "password", (err, reg_user) ->
                    users.add_email_to_account reg_user, "test@db.com", (err, email_user) ->
                        user = email_user
                        user.save_session "12345", done()
        , 500

    after (done) ->
        user.remove ->
            done()

    it "ensures username uniqueness", (done) ->
        users.helpers.ensure_username_uniqueness "test_username", (result) ->
            result.should.not.be.true
            done()
    it "allows other usernames", (done) ->
        users.helpers.ensure_username_uniqueness "other_username", (result) ->
            result.should.be.true
            done()
    it "ensures email uniqueness", (done) ->
        users.helpers.ensure_email_uniqueness "test@db.com", (result) ->
            result.should.not.be.true
            done()
    it "allows other emails", (done) ->
        users.helpers.ensure_email_uniqueness "other_account@db.com", (result) ->
            result.should.be.true
            done()
    it "can get the user from username", (done) ->
        users.helpers.get_user_from_username "test_username", (result) ->
            result.username.should.equal user.username
            done()
    it "can get the user from email", (done) ->
        users.helpers.get_user_from_email "test@db.com", (result) ->
            result._id.should.equal user._id
            done()
    it "can get the user from the session id", (done) ->
        users.helpers.get_user_from_session "12345", (err, result) ->
            result._id.should.equal user._id
            done()

describe "Passive Login", ->
    user = null
    before (done) ->
        # Give DB Fetcher Time
        setTimeout done, 500
    beforeEach (done) ->
        users.helpers.generate_new_user (err, new_user) ->
            user = new_user
            done()
    afterEach (done) ->
        user.remove ->
            done()

    it "logs in with just a guid", (done) ->
        # (session_id, guid, username, password_hash, callback)
        users.get_user_passive null, user._id, null, null, (err, login_user) ->
            return done err if err
            login_user._id.should.equal user._id
            done()
    it "does NOT allow registered login with just guid", (done) ->
        users.register_user user, "test_user", "test_pass", (err, reg_user) ->
            users.get_user_passive null, user._id, null, null, (err, login_user) ->
                err.should.be.an.instanceof Error
                done()
    it "logs in account with just session", (done) ->
        session_id = Math.round Math.random() * 1000
        user.save_session session_id, ->
            users.get_user_passive session_id, null, null, null, (err, login_user) ->
                return done err if err
                login_user._id.should.equal user._id
                done()
    it "logs in registered account with password hash", (done) ->
        users.register_user user, "test_user", "test_pass", (err, reg_user) ->
            users.get_user_passive null, user._id, "test_user", reg_user.password, (err, login_user) ->
                return done err if err
                login_user._id.should.equal user._id
                done()
    it "does NOT allow login with incorrect password hash", (done) ->
        users.register_user user, "test_user", "test_pass", (err, reg_user) ->
            users.get_user_passive null, user._id, "test_user", "bad_pass_hash", (err, login_user) ->
                err.should.be.an.instanceof Error
                done()

describe "Explicit Login", ->
    user = null
    username = "dmauro"
    password = "fake_PASS"
    before (done) ->
        # Give DB Fetcher Time
        setTimeout done, 500
    beforeEach (done) ->
        users.helpers.generate_new_user (err, new_user) ->
            users.register_user new_user, username, password, (err, registered_user) ->
                return done err if err
                user = registered_user
                done()
    afterEach (done) ->
        user.remove ->
            done()

    it "logs in with username and password", (done) ->
        users.get_user_explicit username, password, (err, login_user) ->
            return done err if err
            login_user._id.should.equal user._id
            done()

describe "User cleanup", ->
    user_accounts = {}
    usernames = ["registered", "responding", "recent", "old"]
    for username in usernames
        user_accounts[username] = null

    before (done) ->
        accounts_ready = ->
            users.register_user user_accounts.registered, "registering", "password", (err, user) ->
                return done err if err
                user_accounts.responding.author_response {_id : "fake_id", parent : null}, ->
                    thirty_one_days_ago = new Date().getTime() - (31*24*60*60*1000)
                    user_accounts.old.set_last_login thirty_one_days_ago, ->
                        # Now cull users
                        users.remove_inactive_accounts done

        count = usernames.length
        for username in usernames
            ((username) ->
                users.helpers.generate_new_user (err, new_user) ->
                    count -= 1
                    return done err if err
                    user_accounts[username] = new_user
                    accounts_ready() if count is 0
            )(username)

    after (done) ->
        count = usernames.length
        for _, user_account of user_accounts
            decr = ->
                count -= 1
                done() if count is 0
            if user_account
                user_account.remove decr
            else
                decr()

    it "does NOT remove registered accounts", (done) ->
        users.get_user user_accounts.registered._id, (user) ->
            should.exist user
            done()
    it "does NOT remove accounts with any responses", (done) ->
        users.get_user user_accounts.responding._id, (user) ->
            should.exist user
            done()
    it "does NOT remove an account that has logged in recently", (done) ->
        users.get_user user_accounts.recent._id, (user) ->
            should.exist user
            done()
    it "removes old unregistered accounts with no responses", (done) ->
        users.get_user user_accounts.old._id, (user) ->
            should.not.exist user
            done()

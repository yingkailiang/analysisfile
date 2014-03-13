bcrypt = require 'bcrypt'
salt = bcrypt.gen_salt_sync 10
config = require './config'
DBFetcher = require './db_fetcher'
DBObject = require './db_object'
responses_col_name = require('./challenges').responses_collection

db_fetcher = new DBFetcher config.db_settings

module.exports.users_collection = collection_name = "users"

class User extends DBObject
    schema: ->
        @_id = @generate_guid() unless @_id?
        @is_registered = false unless @is_registered?
        @completed_challenges = [] unless @completed_challenges?
        @responses_authored = [] unless @responses_authored?
        @last_login = new Date().getTime() unless @last_login?
        @liked_responses = [] unless @liked_responses?
        @ip_addresses = [] unless @ip_addresses?
        @is_banned = false unless @is_banned?
        super()

    save_session: (session, callback=->) ->
        @last_login = new Date().getTime()
        if session isnt @session
            @session = session
            db_fetcher.modify @_id, collection_name, {$set: { session : session, last_login : @last_login }}, ->
                callback()
        else
            callback()

    generate_guid: ->
        # Fake GUID to identify this user
        s4 = ->
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
        return (s4()+s4()+"-"+s4()+"-"+s4()+"-"+s4()+"-"+s4()+s4()+s4())

    author_response: (response, callback=->) ->
        # May receive a generic object instead of actual Response
        return callback() unless response._id
        @responses_authored.push response._id
        db_fetcher.modify @_id, collection_name, {$push: { responses_authored : response._id }}, =>
            @add_challenge_to_completed response.parent, ->
                callback()

    remove_response: (id, callback=->) ->
        index = @responses_authored.indexOf id
        return callback() unless index > -1
        @responses_authored.splice index, 1
        db_fetcher.modify @_id, collection_name, {$set : {responses_authored : @responses_authored}}, callback

    add_challenge_to_completed: (challenge_id, callback=->) ->
        return callback() if challenge_id in @completed_challenges or !challenge_id
        @completed_challenges.push challenge_id
        db_fetcher.modify @_id, collection_name, {$push: { completed_challenges : challenge_id }}, callback

    remove: (callback=->) ->
        db_fetcher.remove @_id, collection_name, callback

    like_response: (response_id, callback) ->
        # Assume we've verified response exists
        if response_id in @liked_responses
            return callback new Error "You've already liked this response"
        @liked_responses.push response_id
        db_fetcher.modify @_id, collection_name, {$push : { liked_responses : response_id }}, ->
            callback()

    track_ip: (ip, callback) ->
        # Add this IP to the user's history
        return callback() if ip in @ip_addresses
        @ip_addresses.push ip
        db_fetcher.modify @_id, collection_name, {$push : {ip_addresses : ip}}, ->
            callback()

    ban: (callback) ->
        return callback new Error "User is already banned" if @is_banned
        @is_banned = true
        db_fetcher.modify @_id, collection_name, {$set : {is_banned : @is_banned}}, ->
            callback()

    unban: (callback) ->
        return callback new Error "User is not banned" unless @is_banned
        @is_banned = false
        db_fetcher.modify @_id, collection_name, {$set : {is_banned : @is_banned}}, ->
            callback()

    get_url: (is_admin=false) ->
        admin = if is_admin then "/admin" else ""
        return "#{admin}/user/#{@_id}"

    get_page_count: ->
        return Math.ceil @responses_authored.length/config.pagination_size

    set_last_login: (timestamp, callback) ->
        # For testing only
        @last_login = timestamp
        db_fetcher.modify @_id, collection_name, {$set : {last_login : @last_login}}, ->
            callback()

class RegisteredUser extends User
    schema: ->
        @is_registered = true unless @is_registered?
        super()

    add_account: (user) ->
        return console.log "ERROR: Trying to merge two registered users" if user instanceof RegisteredUser
        # Add this users history to our history
        @completed_challenges.push user.completed_challenges...
        @responses_authored.push user.responses_authored...
        for liked_response in user.liked_responses
            @liked_responses.push liked_response unless liked_response in @liked_responses
        db_fetcher.modify @_id, collection_name, {$set : { completed_challenges : @completed_challenges, responses_authored : @responses_authored}}
        # Now update the author id in all these posts
        db_fetcher.modify_many { author_id : user._id }, responses_col_name, { $set : { author_id : @_id } }, (results) ->\
            # Now we can remove the old user
            user.remove()

##################
# Helper Functions
##################
module.exports.helpers = {}
module.exports.helpers.validate_email = validate_email = (email) ->
    return new Error "Not a valid email" unless email.length > 4 and email.indexOf "@" > -1
    return true

module.exports.helpers.validate_username = validate_username = (username) ->
    # Digits, letters, hyphen, underscore, and international characters
    username_regex = /^[\w\d\u00C0-\u024F]+$/
    return new Error "No username supplied" unless username
    return new Error "Username must be at least 4 characters" unless username.length >= 4
    return new Error "Username can only contain letters, numbers, and underscore" unless username_regex.test username
    return true

module.exports.helpers.validate_password = validate_password = (password) ->
    return new Error "No password supplied" unless password
    return new Error "Password must be at least 6 characters" unless password.length >= 6
    return true

module.exports.helpers.ensure_username_uniqueness = ensure_username_uniqueness = (username, callback) ->
    db_fetcher.find { username : username }, collection_name, (results) ->
        return callback new Error "Sorry, that username is taken" if results.length
        return callback true

module.exports.helpers.ensure_email_uniqueness = ensure_email_uniqueness = (email, callback) ->
    db_fetcher.find { email : email }, collection_name, (results) ->
        return callback new Error "That email is already in use" if results.length
        return callback true

module.exports.helpers.get_user_from_email = get_user_from_email = (email, callback) ->
    # Deprecated for now?
    db_fetcher.find_one_complex { email : email }, collection_name, (result) ->
        return callback null unless result
        user = convert_dbobject_to_user result
        callback user

module.exports.helpers.get_user_from_username = get_user_from_username = (username, callback) ->
    db_fetcher.find_one_complex { username : username }, collection_name, (result) ->
        return callback null unless result
        user = convert_dbobject_to_user result
        callback user

module.exports.helpers.get_user_from_session = get_user_from_session = (session, callback) ->
    db_fetcher.find_one_complex { session : session }, collection_name, (result) ->
        return callback new Error "No user with that session" unless result
        user = convert_dbobject_to_user result
        callback null, user

module.exports.helpers.generate_new_user = generate_new_user = (callback) ->
    user = new User()
    db_fetcher.save_to_collection user.get_db_object(), collection_name, (result) ->
        callback null, user

################################
# Public Methods:
# Return error, user to callback
################################
module.exports.convert_to_user = convert_dbobject_to_user = (dbobject) ->
    if dbobject.username and dbobject.password
        return new RegisteredUser dbobject
    else
        return new User dbobject

module.exports.get_user = get_user = (guid, callback) ->
    db_fetcher.find_one guid, collection_name, (result) ->
        return callback null unless result
        user = convert_dbobject_to_user result
        callback user

module.exports.get_user_passive = (session_id, guid, username, password_hash, callback) ->
    if guid
        get_user guid, (user) ->
            console.log "How did this user come to not exist?", guid unless user
            return callback new Error "User does not exist" unless user
            # If the user is registered, verify username/hash
            if user instanceof RegisteredUser
                if user.username is username and user.password is password_hash
                    callback null, user
                else
                    callback new Error "Incorrect credentials"
            # Otherwise send back the unregistered user
            else
                callback null, user
    # If they didn't supply a guid, try to get from session
    else
        get_user_from_session session_id, (err, user) ->
            if user and !user.is_registered
                return callback null, user
            else
                # If that account is protected or session has no account
                # Create a new user
                return generate_new_user callback

module.exports.get_user_explicit = (username, password, callback) ->
    username_response = validate_username username
    password_response = validate_password password
    return callback username_response unless username_response is true
    return callback password_response unless password_response is true
    # Get a registered user
    get_user_from_username username, (user) ->
        return callback(new Error "No user with that user with that username") unless user
        bcrypt.compare password, user.password, (err, response) ->
            if response is true
                return callback null, user
            else
                return callback new Error "Incorrect password"

module.exports.register_user = (user, username, password, callback) ->
    username_response = validate_username username
    password_response = validate_password password
    return callback username_response unless username_response is true
    return callback password_response unless password_response is true
    ensure_username_uniqueness username, (is_unique) ->
        return callback is_unique unless is_unique is true
        user_data = user.get_db_object()
        bcrypt.encrypt password, salt, (err, hash) ->
            throw "Password encryption error: #{err}" if err
            user_data.is_registered = true
            user_data.username = username
            user_data.password = hash
            db_fetcher.update user_data, collection_name, ->
                user = convert_dbobject_to_user user_data
                callback null, user

module.exports.add_email_to_account = (user, email, callback) ->
    email_response = validate_email email
    return callback email_response unless email_response is true
    ensure_email_uniqueness email, (is_unique) ->
        return callback is_unique unless is_unique is true
        user_data = user.get_db_object()
        user_data.email = email
        db_fetcher.update user_data, collection_name, ->
            user = convert_dbobject_to_user user_data
            callback null, user

module.exports.remove_inactive_accounts = (callback=->) ->
    # Remove any users that don't have any posting history
    # and haven't logged in for 30 days
    thirty_days_ago = new Date().getTime() - (30 * 24 * 60 * 60 * 1000)
    query =
        is_registered       : false
        responses_authored  : []
        last_login          :
            $lt : thirty_days_ago
    db_fetcher.remove_complex query, collection_name, callback

module.exports.ban_user = (user_id, callback=->) ->
    get_user user_id, (user) ->
        return callback new Error "User not found" unless user
        user.ban callback

module.exports.unban_user = (user_id, callback=->) ->
    get_user user_id, (user) ->
        return callback new Error "User not found" unless user
        user.unban callback

#################
# User Middleware
#################
module.exports.user_middleware = ->
    return (req, res, next) ->
        ip = req.headers['X-Forwarded-For'] or req.connection.remoteAddress
        # IP Banning goes here
        if ip in []
            return res.send 500, new Error "ip banned"
        get_user_from_session req.session.id, (err, user) ->
            finish = (user) ->
                req.context.user = user
                if user
                    user.track_ip ip, next
                else
                    next()
            if user
                finish user
            else if req.context.is_admin
                # Create temporary user if we don't have one for web
                generate_new_user (err, user) ->
                    user.save_session req.session.id, ->
                        finish user
            else
                # No user for this session
                finish null

#################
# Testing Helpers
#################
module.exports.testing =
    clear_users: (callback=->) ->
        db_fetcher.get_collection collection_name, (collection) ->
            collection.remove null, callback

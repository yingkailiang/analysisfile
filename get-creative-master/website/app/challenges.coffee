fs = require 'fs'
jade = require 'jade'
uuid = require 'node-uuid'
linkify = require './linkify'
DBFetcher = require './db_fetcher'
uploads = require './uploads'
relative_day = require './relative_day'
DBObject = require './db_object'
config = require './config'

challenges_collection = "challenges"
module.exports.responses_collection = responses_collection = "responses"
hopper_collection = "challenges_hopper"
users_collection = require('./users').users_collection
hopper_id = 0

convert_to_user = require('./users').convert_to_user

module.exports.most_recent_timestamp = 0

db_fetcher = new DBFetcher config.db_settings, ->
    # Get the most recent timestamp
    db_fetcher.find_last_x 1, challenges_collection, (result) =>
        return false unless result[0]
        challenge = convert_challenge result[0]
        module.exports.most_recent_timestamp = challenge.timestamp

class S3DBObject extends DBObject
    schema: ->
        @timestamp = new Date().getTime() unless @timestamp?
        @image = {} unless @image?
        super()

    get_img_url: (type) ->
        return "" unless @image[type]
        return @image[type].remote_url

    get_img_node: (type="standard_size", clickable=true) ->
        return "" unless @image[type]
        img_node = "<img class=\"ugc_img\" src=\"#{@image[type].remote_url}\" width=\"#{@image[type].width}\" height=\"#{@image[type].height}\">"
        return img_node unless clickable
        return "<a href=\"#{@image.original.remote_url}\" class=\"js_external_link\">#{img_node}</a>"

    remove_s3_assets: ->
        for type, image_data of @image
            uploads.remove image_data.remote_path

class Response extends S3DBObject
    schema: ->
        @is_anonymous = false unless @is_anonymous?
        @is_hidden = false unless @is_hidden?
        @_id = uuid.v1() unless @_id?
        @likes = [] unless @likes?
        super()

    get_parent_challenge: (callback) ->
        db_fetcher.find_one @parent, challenges_collection, (result) =>
            return callback null unless result
            parent = convert_challenge result
            @challenge = parent
            callback parent

    hide: (should_remove_from_parent=false, callback=->) ->
        # Appears deleted to users. Remains in S3
        # and visible to staff.
        @is_hidden = true
        update = =>
            db_fetcher.modify @_id, responses_collection, {$set : {is_hidden : @is_hidden}}, callback

        if should_remove_from_parent
            # Remove from parent
            @get_parent_challenge (parent) =>
                parent.remove_response @_id if parent
                update()
        else
            update()

    remove: (should_remove_from_parent=false, callback=->) ->
        # Reserve this for when a user asks for content to
        # be entirely removed.
        @remove_s3_assets()
        if should_remove_from_parent
            # Remove from parent
            @get_parent_challenge (parent) =>
                parent.remove_response @_id
                remove_from_db()
        else
            remove_from_db()
        # Remove from DB
        remove_from_db = =>
            db_fetcher.remove @_id, responses_collection, (result) =>
                # Also remove from user authored responses
                db_fetcher.find_one @author_id, users_collection, (result) =>
                    user = convert_to_user result
                    user.remove_response @_id, callback

    get_author_data: (callback) ->
        # For template context, do not save
        db_fetcher.find_one @author_id, users_collection, (result) =>
            # Ensure schema is correct, even if we don't have an author
            result = result or {}
            user_data = convert_to_user(result).get_db_object()
            @author_data = user_data
            callback user_data

    like: (user_id, callback) ->
        # Returns an error or nothing
        if user_id is @author_id
            return callback new Error "You are not allowed to like your own post"
        if user_id in @likes
            return callback new Error "You have already liked this"
        @likes.push user_id
        db_fetcher.modify @_id, responses_collection, {$push : { likes : user_id }}, ->
            callback()

    user_can_like: (user_id) ->
        # Template helper
        return true unless user_id in @likes or user_id is @author_id

    get_text: ->
        # Template helper
        return linkify @text, "html"

class Challenge extends S3DBObject
    schema: ->
        @_id = uuid.v1() unless @_id?
        @responses = [] unless @responses?
        super()

    get_relative_day: ->
        return relative_day.get @timestamp

    get_responses: (page_number, callback) ->
        # For template context, do not save
        get_results = (results) =>
            return callback [] unless results.length
            count = results.length
            for i in [0...results.length]
                results[i] = convert_response results[i]
                # Also get the author for each response
                results[i].get_author_data ->
                    count -= 1
                    if count is 0
                        callback results
        if page_number
            limit = config.pagination_size
            skip = (page_number - 1) * limit
            db_fetcher.find_paged {_id : {$in : @responses}}, skip, limit, responses_collection, get_results
        else
            db_fetcher.find {_id : {$in : @responses}}, responses_collection, get_results

    remove: (callback=->) ->
        @get_responses null, (responses) =>
            for response in responses
                response.hide()
            @remove_s3_assets()
            # Remove from DB
            db_fetcher.remove @_id, challenges_collection, (result) ->
                callback result

    remove_response: (id, callback=->) ->
        index = @responses.indexOf(id)
        return callback null if index is -1
        @responses.splice @responses.indexOf(id), 1
        db_fetcher.modify @_id, challenges_collection, {$set : { responses : @responses }}, (result) ->
            callback result

    remove_s3_assets: ->
        for key, image_obj of @collage
            uploads.remove image_obj.remote_path
        super()

    get_url: (is_admin=false) ->
        admin = if is_admin then "/admin" else ""
        return "#{admin}/id/#{@_id}"

    get_page_count: ->
        return Math.ceil @responses.length/config.pagination_size

##################
# Helper Functions
##################
convert_response = (response) ->
    return new Response response

convert_challenge = (challenge) ->
    return new Challenge challenge

##################
# Public Functions
##################
module.exports.get_challenge = (id, callback) ->
    db_fetcher.find_one id, challenges_collection, (result) ->
        return callback null unless result
        callback convert_challenge result

module.exports.get_last_x_challenges = (x, callback) ->
    db_fetcher.find_last_x x, challenges_collection, (results) ->
        return callback null unless results.length
        for i in [0...results.length]
            results[i] = convert_challenge results[i]
        callback results

module.exports.get_challenges_x_to_y = (x, y, callback) ->
    db_fetcher.find_last_x y, challenges_collection, (results) ->
        return callback [] unless results.length
        length = Math.min y - x, results.length - x
        return callback [] unless length > 0
        results = results.splice x, length
        for i in [0...results.length]
            results[i] = convert_challenge results[i]
        callback results

module.exports.add_response_to_challenge = (id, response, callback) ->
    response.parent = id
    response = new Response(response).get_db_object()
    db_fetcher.modify id, challenges_collection, {$push : { responses : response._id }}, ->
        db_fetcher.save_to_collection response, responses_collection, (results) ->
            callback convert_response results[0]

module.exports.get_responses_for_user = (user_id, page_number, callback) ->
    get_results = (results) =>
        return callback [] unless results.length
        count = results.length
        for i in [0...results.length]
            results[i] = convert_response results[i]
            ((i) ->
                results[i].get_author_data ->
                    results[i].get_parent_challenge ->
                        count -= 1
                        if count is 0
                            callback results
            )(i)
    if page_number
        limit = config.pagination_size
        skip = (page_number - 1) * limit
        db_fetcher.find_paged { author_id : user_id }, skip, limit, responses_collection, get_results
    else
        db_fetcher.find { author_id : user_id }, responses_collection, get_results

module.exports.like_response = (response_id, user_id, callback) ->
    db_fetcher.find_one response_id, responses_collection, (result) ->
        return callback new Error "Response does not exist" unless result?
        response = convert_response result
        response.like user_id, callback

module.exports.get_all_responses_liked_by_user = (user, callback) ->
    db_fetcher.find {_id : {$in : user.liked_responses}}, responses_collection, (results) ->
        return callback [] unless results.length
        count = results.length
        for i in [0...results.length]
            results[i] = convert_response results[i]
            results[i].get_author_data ->
                count -= 1
                if count is 0
                    callback results

#################
# Admin Functions
#################
module.exports.rename_challenge = (id, new_prompt, callback) ->
    db_fetcher.modify id, challenges_collection, {$set : { prompt : new_prompt }}, (result) ->
        callback result?

module.exports.remove_challenge = (id, callback) ->
    module.exports.get_challenge id, (result) ->
        return callback null unless result
        challenge = convert_challenge result
        challenge.remove (result) ->
            callback result

module.exports.remove_response = (id, callback) ->
    db_fetcher.find_one id, responses_collection, (result) ->
        return callback null unless result
        response = convert_response result
        response.hide true, ->
            callback true

############################
# Challenge Hopper Functions
############################
get_challenge_hopper = (callback) ->
    # Hopper is a single entry in an otherwise empty collection
    db_fetcher.find_one hopper_id, hopper_collection, (result) ->
        callback result

module.exports.get_challenge_hopper = (callback) ->
    get_challenge_hopper (result) ->
        hopper = if result then result.hopper else []
        for i in [0...hopper.length]
            hopper[i] = convert_challenge hopper[i]
        callback hopper

module.exports.add_challenge_to_hopper = (challenge, callback) ->
    challenge = convert_challenge(challenge).get_db_object()
    # Make sure hopper challenge hopper exists in the database or init it
    get_challenge_hopper (result) ->
        unless result?
            hopper =
                _id     : hopper_id
                hopper  : [challenge]
            db_fetcher.save_to_collection hopper, hopper_collection, (result) ->
                callback result?
        else
            db_fetcher.modify hopper_id, hopper_collection, {$push : { hopper : challenge }}, (result) ->
                callback result?

module.exports.add_challenge_from_hopper = (callback=->) ->
    get_challenge_hopper (result) ->
        unless result and result.hopper.length
            return callback false
        new_hopper = result.hopper.slice 0
        challenge = new_hopper.shift()
        challenge = convert_challenge(challenge).get_db_object()
        db_fetcher.save_to_collection challenge, challenges_collection, (result) ->
            result = result[0]
            module.exports.most_recent_timestamp = result.timestamp
            db_fetcher.modify hopper_id, hopper_collection, {$set : { hopper : new_hopper }}, (result) ->
                callback result?

module.exports.move_challenge_in_hopper = (index, target_index, callback=->) ->
    get_challenge_hopper (result) ->
        unless result and result.hopper.length
            return callback false
        hopper = result.hopper
        challenge = hopper.slice index, 1
        hopper.splice target_index, 0, challenge
        db_fetcher.modify result._id, hopper, {$set : {hopper : hopper}}, (result) ->
            callback result?

module.exports.remove_challenge_from_hopper = (index, callback) ->
    get_challenge_hopper (result) ->
        new_hopper = result.hopper.slice 0
        challenge = new_hopper.splice index, 1
        challenge = convert_challenge challenge[0]
        challenge.remove()
        db_fetcher.modify hopper_id, hopper_collection, {$set : { hopper : new_hopper }}, (result) ->
            callback result?

#################
# Testing Helpers
#################
module.exports.testing =
    clear_hopper: (callback=->) ->
        db_fetcher.get_collection hopper_collection, (collection) ->
            collection.remove null, callback

    clear_challenges_list: (callback=->) ->
        db_fetcher.get_collection challenges_collection, (collection) ->
            collection.remove null, callback

    clear_responses_list: (callback=->) ->
        db_fetcher.get_collection responses_collection, (collection) ->
            collection.remove null, callback

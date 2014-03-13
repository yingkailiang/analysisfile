uuid = require 'node-uuid'
sanitizer = require 'sanitizer'
config = require './config'
DBFetcher = require './db_fetcher'
challenge_manager = require './challenges.coffee'

module.exports.convert_response_strings_to_objects = (db_settings, callback) ->
    # September 24, 2012
    # We should be using objects instead of strings for the challenge responses
    # Note: this would no longer work because of how the challenge manager changed
    col_name = 'challenges'
    db_fetcher = new DBFetcher db_settings, ->
        db_fetcher.find_all col_name, (results) ->
            for challenge in results
                did_migrate = false
                if challenge.responses
                    for i in [0...challenge.responses.length]
                        response = challenge.responses[i]
                        console.log "RESPONSE", response, typeof response is "string"
                        if typeof response is "string"
                            did_migrate = true
                            challenge.responses[i] = new challenge_manager.Response({ text : response }).get_db_object()

                # Make sure to run these through the schema
                challenge = new challenge_manager.Challenge(challenge).get_db_object()

                # Save back to DB
                db_fetcher.update challenge, col_name, ->
            callback "All done"
    return

module.exports.move_response_objects_to_new_collection = (callback) ->
    # November 5, 2012
    # Responses need their own database so we can show them independent of the challenge
    db_fetcher = new DBFetcher config.db_settings, ->
        db_fetcher.find_all 'challenges', (results) ->
            count = 0
            decr_count = ->
                count -= 1
                console.log "Countdown at", count
                if count is 0
                    callback "All done"
            for challenge in results
                count += challenge.responses.length + 1
                console.log "Countup is at", count
                for i in [0...challenge.responses.length]
                    response = challenge.responses[i]
                    response["_id"] = uuid.v1()
                    response["parent"] = challenge._id
                    # Save this to the new collection
                    db_fetcher.save_to_collection response, 'responses', ->
                        decr_count()
                    # Now replace with just the id
                    challenge.responses[i] = response._id
                db_fetcher.modify challenge._id, 'challenges', {$set : { responses : challenge.responses }}, ->
                    decr_count()
    return

module.exports.add_fake_responses = (callback) ->
    # Add some fake responses to migrate
    db_fetcher = new DBFetcher config.db_settings, ->
        db_fetcher.find_all 'challenges', (results) ->
            count = results.length
            for challenge in results
                fake_response_array = [
                    {
                        _id     : uuid.v1()
                        text    : "First from migration"
                        parent  : challenge._id
                        image   : {}
                    }
                    {
                        _id     : uuid.v1()
                        text    : "Second from migration"
                        parent  : challenge._id
                        image   : {}
                    }
                ]
                db_fetcher.modify challenge._id, 'challenges', {$set : { responses : fake_response_array }}, ->
                    count -= 1
                    if count is 0
                        return callback "all done"

module.exports.convert_author_to_author_id = (callback) ->
    # November 22, 2012
    db_fetcher = new DBFetcher config.db_settings, ->
        db_fetcher.find_all 'responses', (results) ->
            count = results.length
            for response in results
                update =
                    $set :
                        author_id : response.author
                    $unset : 
                        author : 1
                db_fetcher.modify response._id, 'responses', update, ->
                    count -= 1
                    if count is 0
                        return callback "all done"

module.exports.add_challenge_types = (callback) ->
    # November 26, 2012
    db_fetcher = new DBFetcher config.db_settings, ->
        db_fetcher.find_all 'challenges', (results) ->
            count = results.length
            for challenge in results
                challenge['type'] = if challenge.collage? then "collage" else "text"
                db_fetcher.update challenge, 'challenges', ->
                    count -= 1
                    if count is 0
                        return callback "all done"

module.exports.sanitize_ugc_text = (callback) ->
    # December 4, 2012
    db_fetcher = new DBFetcher config.db_settings, ->
        db_fetcher.find_all 'responses', (results) ->
            count = results.length
            for response in results
                response.text = sanitizer.escape response.text
                db_fetcher.update response, 'responses', ->
                    count -= 1
                    if count is 0
                        return callback "all done"

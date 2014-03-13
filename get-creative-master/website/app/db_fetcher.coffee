mongo = require 'mongodb'

module.exports = class DBFetcher
    constructor: (db_settings, callback=->) ->
        @db = new mongo.Db db_settings.name, new mongo.Server(db_settings.host, db_settings.port, {safe: true, auto_reconnect: true, native_parser: true}, {})
        @db.open (err) =>
            throw err if err
            if db_settings.user
                @db.authenticate db_settings.user, db_settings.pass, (err, replies) ->
                    throw err if err
                    callback()
            else
                callback()

    get_collection: (col_name, callback) ->
        @db.collection col_name, (err, collection) ->
            throw err if err
            callback collection

    find_all: (col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.find().sort({timestamp : -1}).toArray (err, result) ->
                throw err if err
                callback result

    find_last_x: (x=50, col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.find().sort({timestamp : -1}).limit(x).toArray (err, result) ->
                throw err if err
                callback result

    find: (query, col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.find query, (err, results) ->
                throw err if err
                results.sort({timestamp : -1}).toArray (err, array) ->
                    throw err if err
                    callback array

    find_paged: (query, skip, limit, col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.find query, (err, results) ->
                throw err if err
                results.skip(skip).limit(limit).sort({timestamp : -1}).toArray (err, array) ->
                    throw err if err
                    callback array

    find_one: (id, col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.findOne {
                    _id : id
                }, (err, result) ->
                    throw err if err
                    callback result

    find_one_complex: (query, col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.findOne query, (err, result) ->
                throw err if err
                callback result

    modify: (id, col_name, modifier, callback=->) ->
        @get_collection col_name, (collection) ->
            collection.findAndModify { _id : id }, {}, modifier, { new : true }, (err, result) ->
                throw err if err
                callback result

    modify_many: (query, col_name, modifier, callback) ->
        @get_collection col_name, (collection) ->
            collection.update query, modifier, { safe:true, multi:true }, (err, results) ->
                throw err if err
                callback results

    update: (object, col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.update { _id : object._id }, object, { upsert : true }, (err, result) ->
                throw err if err
                callback result

    save_to_collection: (entry, col_name, callback) ->
        @get_collection col_name, (collection) ->
            entry.timestamp = new Date().getTime()
            collection.insert entry, (err, result) ->
                throw err if err
                callback result

    remove: (id, col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.remove { _id : id }, (err, result) ->
                throw err if err
                callback true

    remove_complex: (query, col_name, callback) ->
        @get_collection col_name, (collection) ->
            collection.remove query, (err, result) ->
                throw err if err
                callback result

    close: ->
        @db.close()

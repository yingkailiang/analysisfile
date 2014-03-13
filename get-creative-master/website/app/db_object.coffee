module.exports = class DBObject
    constructor: (object={}) ->
        @unpack_object object
        @schema()
        @init()

    schema: ->
        @timestamp = new Date().getTime() unless @timestamp?

    init: ->
        return

    get_db_object: ->
        # Gives us just the relevant information to store in
        # the database so we're not storing the proto chain.
        obj = {}
        for own property, value of @
            obj[property] = value
        return obj

    unpack_object: (object) ->
        for own property, value of object
            @[property] = value

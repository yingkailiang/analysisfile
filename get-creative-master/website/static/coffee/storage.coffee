#######################
# Local storage helpers
#######################
class window.HTML5Storage
    get: (property, callback, is_json=false) ->
        try
            value = localStorage.getItem property
            if value? and is_json
                value = JSON.parse value
            callback value
        catch err
            window.track_event 'storage_error', 'get', property
            console.log "Error retrieving \"#{property}\" from storage", err
            throw err

    get_many: (properties, callback, is_json=false) ->
        try
            items = {}
            for property in properties
                value = localStorage.getItem property
                if value? and is_json
                    value = JSON.parse value
                items[property] = value
            callback items
        catch err
            window.track_event 'storage_error', 'get_many', properties.join ", "
            console.log "Error retrieving properties: \"#{properties}\" from storage", err
            throw err

    set: (property, value, callback, is_json=false) ->
        callback = callback or ->
        try
            if is_json
                value = JSON.stringify value
            localStorage.setItem property, value
            callback()
        catch err
            window.track_event 'storage_error', 'set', property
            console.log "Error setting \"#{property}\" to \"#{value}\" in storage", err
            throw err

    set_many: (pairs, callback, is_json=false) ->
        callback = callback or ->
        try
            for property, value of pairs
                if is_json
                    value = JSON.stringify value
                localStorage.setItem property, value
            callback()
        catch err
            properties = []
            for property, value of pairs
                properties.push property
            window.track_event 'storage_error', 'set_many', properties.join ", "
            console.log "Error setting pairs \"#{pairs}\" in storage", err
            throw err

    remove: (property, callback=->) ->
        try
            localStorage.removeItem property
            callback()
        catch err
            window.track_event 'storage_error', 'remove', property
            console.log "Error removing \"#{property}\" from storage", err
            throw err

    remove_many: (properties, callback=->) ->
        try
            for property in properties
                localStorage.removeItem property
            callback()
        catch err
            window.track_event 'storage_error', 'remove_many', properties.join ", "
            console.log "Error removing \"#{properties}\" from storage", err
            throw err

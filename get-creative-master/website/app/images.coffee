######################################
# Image manipulation using Imagemagick
######################################
fs = require 'fs'
crypto = require 'crypto'
cp = require 'child_process'
mime = require 'mime'
uploads = require './uploads'
thumbnails = require './thumbnails'

_get_hash_of_data = (data) ->
    md5 = crypto.createHash 'md5'
    md5.update data
    return md5.digest 'hex'

_clean_up_format = (format) ->
    # For my sanity. Why .JPEG when you can .jpg
    format = format.toLowerCase()
    format = "jpg" if format is "jpeg"
    return format

_get_image_info = (data, callback) ->
    im = cp.spawn 'identify', ["-"]
    info_spool = ""
    err_spool = ""
    im.stdout.on 'data', (data) ->
        info_spool += data
    im.stderr.on 'data', (data) ->
        err_spool += data
    im.stdout.on 'end', ->
        throw err_spool if err_spool.length
        throw "No data received from identify" unless info_spool.length
        info = info_spool.split " "
        dimensions = info[2].split "x"
        image_props =
            width   : parseInt dimensions[0], 10
            height  : parseInt dimensions[1], 10
            format  : _clean_up_format info[1]
        callback null, image_props
    im.stdin.write data, 'binary'
    im.stdin.end()

_save_to_s3 = (data, dest_dir, image_props, callback) ->
    hash = _get_hash_of_data data
    destination = dest_dir + hash + ".#{image_props.format}"
    mimetype = mime.lookup image_props.format
    uploads.put_data data, destination, mimetype, (response) ->
        image_props['remote_url'] = response.url
        image_props['remote_path'] = response.path
        callback()

_get_info_and_save = (data, type, callback, dest_dir="#{type}/") ->
    _get_image_info data, (err, image_props) ->
        return callback err, null if err
        image_props['type'] = type
        _save_to_s3 data, dest_dir, image_props, ->
            callback null, image_props

_generate_thumbnail = (original_data, image_props, type, callback) ->
    im_args = thumbnails.get_imagemagick_args image_props, type
    im = cp.spawn 'convert', im_args
    img_spool = err_spool = ""
    im.stdout.setEncoding 'binary'
    im.stdout.on 'data', (data) ->
        img_spool += data
    im.stderr.on 'data', (data) ->
        err_spool += data
    im.stdout.on 'end', ->
        throw err_spool if err_spool.length
        throw "No thumbnail generated" unless img_spool.length
        _get_info_and_save img_spool, type, callback
    im.stdin.write original_data
    im.stdin.end()

_generate_thumbnails = (original_data, image_props, callback) ->
    # Pass back (err, array of image_props)
    thumb_types = thumbnails.types
    images = [image_props]
    count = 0
    error = null

    check_if_done = (err) ->
        if count is thumb_types.length
            if err
                callback err, null
            else
                callback null, images

    for type in thumb_types
        _generate_thumbnail original_data, image_props, type, (err, thumb_props) ->
            error = err if err
            images.push thumb_props if thumb_props
            count += 1
            check_if_done error

module.exports.thumbnail_and_save_data = (original_data, callback) ->
    _get_info_and_save original_data, "original", (err, image_props) ->
        return callback err, null if err
        _generate_thumbnails original_data, image_props, (err, images) ->
            return callback err, null if err
            # Turn the images array into an object
            images_obj = {}
            for image in images
                type = image.type
                delete image.type
                images_obj[type] = image
            callback null, images_obj

module.exports.thumbnail_and_save = (path, callback) ->
    # Read in the file to memory then delete
    fs.readFile path, (err, original_data) ->
        throw err if err
        fs.unlink path, (err) ->
            throw err if err
        module.exports.thumbnail_and_save_data original_data, callback

module.exports.save_stamp_to_s3 = (path, callback) ->
    # For saving collage images
    fs.readFile path, (err, data) ->
        throw err if err
        fs.unlink path, (err) ->
            throw err if err
        _get_info_and_save data, "original", callback, "collage_images/"

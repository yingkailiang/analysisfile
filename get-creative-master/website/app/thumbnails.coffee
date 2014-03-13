##########################
# Thumbnail specifications
##########################
types =
    # "original" is untouched

    "standard_size":
        # For viewing from the extension
        max_width   : 500
        height      : "auto"
        lossy       : true
        quality     : 0.9

    "square_thumbnail":
        # For admin view
        width       : 50
        height      : 50
        crop        : true
        lossy       : true
        quality     : 0.9

module.exports.types = type_list = []
for name, _ of types
    type_list.push name


module.exports.get_imagemagick_args = (image_props, type) ->
    # Take the original image data and calculate
    # thumbnail data of type
    settings = types[type]
    im_args = ["-"]

    # First do cropping
    if settings.crop
        if settings.width > settings.height
            crop_width = image_props.width
            crop_height = settings.height*(image_props.width/settings.width)
        else
            crop_width = settings.width*(image_props.height/settings.height)
            crop_height = image_props.height
        im_args.push "-crop"
        im_args.push "#{crop_width}x#{crop_height}+0+0"

    # Now do resizing
    width = image_props.width
    if settings.max_width and width > settings.max_width
        width = settings.max_width
    height = image_props.height
    if settings.max_height and height > settings.max_height
        height = settings.max_height
    if settings.width is "auto"
        width = Math.round height*(image_props.width/image_props.height)
    else if settings.width?
        width = settings.width
    if settings.height is "auto"
        height = Math.round width*(image_props.height/image_props.width)
    else if settings.height?
        height = settings.height
    im_args.push "-resize"
    im_args.push "#{width}x#{height}"

    if settings.quality
        im_args.push "-quality"
        im_args.push "#{settings.quality * 100}"

    if settings.lossy and image_props.format isnt "jpg"
        im_args.push "-transparent"
        im_args.push "white"
        im_args.push "JPG:-"
    else
        im_args.push "-"

    return im_args

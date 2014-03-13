window.animations  =
    give_like: (like_button) ->
        clone = like_button.clone()
        clone.insertAfter like_button
        animations.animate_like_button clone
        animations.bonus_text clone

    animate_like_button: (like_button, duration) ->
        DURATION = 650
        SIZE_CHANGE = 10

        position = like_button.position()
        pos_path = new $.path.bezier(
            start:
                x       : position.left
                y       : position.top
                angle   : 145
                length  : 45
            end:
                x       : position.left - 1
                y       : position.top - 1
                angle   : -45
                length  : 45
        )
        like_button.animate(
            # Animating along a bezier curve
            path    : pos_path
        ,
            duration    : DURATION
            queue       : false
            easing      : "easeInOutQuad"
            complete    : ->
                $(this).remove()
        ).animate(
            # Animate the size changing
            width   : "+=#{SIZE_CHANGE}"
            height  : "+=#{SIZE_CHANGE}"
        ,
            duration    : DURATION/3
        ).animate(
            width   : "-=#{SIZE_CHANGE}"
            height  : "-=#{SIZE_CHANGE}"
        ,
            duration    : DURATION/3
        ).animate(
            width   : "-=#{SIZE_CHANGE}"
            height  : "-=#{SIZE_CHANGE}"
        ,
            duration    : DURATION/3
        )
        # And ensure it goes behind the post
        setTimeout(->
            like_button.css "zIndex", "-1"
        , DURATION/2)

    bonus_text: (like_button) ->
        position = like_button.position()
        bonus = $('<span class="bonus_text">+1</span>')
        bonus.css(
            position    : "absolute"
            left        : position.left + 30
            top         : position.top + 15
        )
        setTimeout(->
            bonus.insertAfter like_button
            bonus.animate(
                top     : "-=40"
                opacity : 0
            ,
                duration    : 500
                easing      : "linear"
            )
        , 450)

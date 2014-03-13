window.IS_WEB = true

$ ->
    # Visual tweak for trim
    if $(window).height() > $('body').height()
        $('.trim').css "position", "fixed"

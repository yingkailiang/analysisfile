window.IS_EXTENSION = true;
$ ->
    if typeof(badge_count) != "undefined"
    # Badge count is passed in through query when getting extension base HTML
        if badge_count > 0
            window.BADGE_COUNT = badge_count
            window.track_event 'open_extension', 'with_badge', badge_count
        else
            window.track_event 'open_extension', 'without_badge'

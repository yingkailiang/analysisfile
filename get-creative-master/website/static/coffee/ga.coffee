window._gaq = window._gaq or []
window._gaq.push ['_setAccount', 'UA-16426630-4']
(->
    ga = document.createElement 'script'
    ga.async = true
    ga.src = 'https://ssl.google-analytics.com/ga.js'
    s = document.getElementsByTagName('script')[0]
    s.parentNode.insertBefore ga, s
)()

window.track_pageview = (url) ->
    return if window.IS_ADMIN or window.IS_LOCAL
    _gaq.push ['_trackPageview', url]

window.track_event = ->
    return if window.IS_ADMIN or window.IS_LOCAL
    _gaq.push ['_trackEvent', arguments...]

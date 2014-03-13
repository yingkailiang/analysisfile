$ ->
    # Bind install links
    $('a.install_link').on "click", ->
        # If they are Windows, make it a link
        if navigator.platform.indexOf("Win") > -1
            href = $('link[rel="chrome-webstore-item"]').attr("href")
            console.log "href", href
            return document.location.href = href
        chrome.webstore.install undefined, undefined, (reason) ->
            window.show_error "The extension was not installed. Reason: #{reason}"
        
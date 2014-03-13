// Bind close button
var close_button = document.getElementById('close');
close_button.addEventListener("click", function() {
    window.close();
});

// Remove badges and pass badge count to server for GA
var bg_page = chrome.extension.getBackgroundPage();
var badge_count = bg_page.get_badge_count();
var iframe = document.getElementById('iframe');
iframe.src = "http://127.0.0.1:7000/local_extension_base?badge_count=" + badge_count;
bg_page.reset_badge_count();
bg_page.cancel_bounce_animation();
var event_action = (badge_count > 0) ? "has_badge" : "no_badge";
bg_page.track_event("popup_opened", event_action, null, badge_count);

// Listen for external link clicks
var respond_to_link = function(e) {
    chrome.tabs.create({url : e.data}, function(tab) {
        window.close();
    });
};

window.addEventListener('message', respond_to_link);

(function() {
    var HOME_URL = "http://127.0.0.1:7000";
    var MAX_BADGE_COUNT = 3;
    var NOTIFICATION_DISPLAY_SECONDS = 6;
    var WAIT_FOR_UPDATE_SECONDS = 10;

    var _badge_count;
    var _timestamp;

    _set_badge_text = function(string) {
        chrome.browserAction.setTitle({
            title   : "You have new challenges!"
        });
        chrome.browserAction.setBadgeText({
            text    : string
        });
    };

    _set_badge_count = function(count) {
        _badge_count = count;
        chrome.storage.local.set({
            badge_count : _badge_count
        });
    }

    window.get_badge_count = function() {
        return _badge_count;
    };

    window.reset_badge_count = function() {
        _set_badge_count(0);
        chrome.browserAction.setTitle({
            title   : "No new challenges."
        });
        chrome.browserAction.setBadgeText({
            text    : ""
        });
    };

    _reset_default_icon = function() {
        chrome.browserAction.setIcon({path:"/assets/icon.png"});
    }

    _bounce_icon_once = function(done, interrupt_function) {
        var max_size = 19;
        var sizes = [17, 15, 14, 13, 13, 12, 12, 12, 13, 15, 19, 17, 19];
        var icon_path = "assets/attention_icon.png";
        var speed = 12; // fps

        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", max_size.toString());
        canvas.setAttribute("height", max_size.toString());
        document.body.appendChild(canvas);
        var context = canvas.getContext("2d");
        var image = new Image()

        var _load_image_at_size = function(size) {
            var offset = (max_size - size)/2;
            context.clearRect(0, 0, max_size, max_size);
            context.drawImage(image, offset, offset, size, size);
            img_data = context.getImageData(0, 0, max_size, max_size);
            chrome.browserAction.setIcon({imageData:img_data});
        };

        // Pre-load the image before beginning
        image.onload = function() {
            // Loop through sizes asynchronously
            var loop = function(loop_action, count) {
                if (count === undefined) {
                    count = 0;
                }
                var max = sizes.length
                var size = sizes[count];
                if (count >= max) {
                    return done();
                }
                loop_action(size, function() {
                    count++;
                    loop(loop_action, count);
                });
            };

            loop(function(size, callback) {
                // This will get called for each size
                var delay = 1000/speed;
                _load_image_at_size(size);
                setTimeout(function() {
                    // Check to see if we should interrupt the animation
                    should_stop = interrupt_function();
                    if (!should_stop) {
                        callback();
                    } else {
                        _reset_default_icon();
                    }
                }, delay);
            });
        };
        image.src = icon_path;
    };

    var _is_bouncing = false;

    window.cancel_bounce_animation = function() {
        _is_bouncing = false;
    };

    _bounce_until_clicked = function() {
        if (_is_bouncing) {
            return true;
        }
        _is_bouncing = true;
        var delay_between_bounces = 500;
        var bounce = function() {
            _bounce_icon_once(function() {
                setTimeout(bounce, delay_between_bounces);
            }, function() {
                return !_is_bouncing;
            });
        };
        bounce();
    };

    _update_badge_count = function(count) {
        count = count || _badge_count;
        if (count > MAX_BADGE_COUNT) {
            count = MAX_BADGE_COUNT + "+";
        }
        if (count <= 0) {
            reset_badge_count();
        } else {
            _set_badge_text(count.toString());
            _bounce_until_clicked();
        }
    };

    _desktop_notification = function() {
        var notification = webkitNotifications.createNotification(
            'assets/icon.png',
            'New Daily Challenge!',
            'There\'s a new challenge waiting for you, get creative!'
        );
        notification.show();
        notification.onclick = function() {
            notification.cancel();
        };
        setTimeout(function() {
            notification.cancel();
        }, NOTIFICATION_DISPLAY_SECONDS * 1000);
    };

    _increase_notification_count = function(i) {
        _desktop_notification();
        i = (i == undefined || i == null) ? 1 : parseInt(i, 10);
        var new_count = _badge_count + i
        if (typeof(new_count) !== "number") {
            new_count = 1;
        }
        window.track_event("new_challenge_notice", null, null, new_count);
        _set_badge_count(new_count);
        _update_badge_count();
    };

    _listen = function() {
        // Listen for new challenges
        setInterval(function() {
            var req = new XMLHttpRequest()
            req.addEventListener('readystatechange', function() {
                if (req.readyState == 4) {
                    // Complete
                    if (req.status == 200 || req.status == 304) {
                        // Success
                        var response = JSON.parse(req.responseText);
                        if (response.new_count) {
                            _increase_notification_count(response.new_count);
                        } else {
                            window.track_event("check-in");
                        }
                        _timestamp = response.timestamp;
                        chrome.storage.local.set({
                            timestamp : _timestamp
                        });
                    }
                }
            });
            req.open('GET', HOME_URL + '/api/new.json?timestamp=' + _timestamp, true);
            req.send();
        }, WAIT_FOR_UPDATE_SECONDS*1000);
    };

    // Initialize _badge_count and _timestamp
    chrome.storage.local.get(["badge_count", "timestamp"], function(items) {
        _badge_count = items.badge_count || 0;
        _update_badge_count();
        _timestamp = items.timestamp || 0;
        // And begin listening
        _listen();
    });

    // Google Analytics
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);
    _gaq.push(['_trackPageview']);

    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

    window.track_pageview = function(url) {
        _gaq.push(['_trackPageview', url]);
    };

    window.track_event = function(category, action, label, value) {
        _gaq.push(['_trackEvent', category, action, label, value]);
    }
})();

ytnotifynames = new Array();
twitternotifynames = new Array();
twitchnotifynames = new Array();
var counter = 0;
var pollInterval = 1000*60;
var last

function checkIconColor() {
	if (localStorage['iconColor'] == 'white') {
		chrome.browserAction.setIcon({
			path: 'iconw.png'
		});
	} else {
		chrome.browserAction.setIcon({
			path: 'icon.png'
		});
	}
}

function onInstall() {
	chrome.tabs.create({url: "options.html"});
}

function onUpdate() {
	localStorage['mcNotificationUpdate'] = 1;
	if (localStorage['mcNotificationUpdate'] > 0) {
		var notification = webkitNotifications.createNotification(
			'icon48.png',
			'Mindcrack Notifier Updated (v1.8.0)',
			'Twitch Notifications (Enable in Settings), \'Via @YouTube\' tweet blocker.'
		);
		notification.onclick = $.proxy(function () {
			notification.cancel();
			var win=window.open('options.html', '_blank');
			win.focus();
		}, this);
		notification.show();
	}
}

function getVersion() {
	var details = chrome.app.getDetails();
	return details.version;
}



function update() {
	if (localStorage["ytnotifynames"] !== undefined) {
		ytnotifynames = localStorage["ytnotifynames"]
	}
	if (localStorage["twitternotifynames"] !== undefined) {
		twitternotifynames = localStorage["twitternotifynames"]
	}
	if (localStorage["twitchnotifynames"] !== undefined) {
		twitchnotifynames = localStorage["twitchnotifynames"]
	}
	chrome.storage.sync.get(['lastopened','lastnotified','lasttweetnotified','lasttwitchnotified'],function(items) {
		if (items.lastopened !== undefined) {
			last = items.lastopened
		} else {
			last = Math.floor((new Date()).getTime() / 1000).toString()
			chrome.storage.sync.set({'lastopened': Math.floor((new Date()).getTime() / 1000).toString()});
		}
		 if (items.lastnotified !== undefined) {
			notified = items.lastnotified
		} else {
			notified = Math.floor((new Date()).getTime() / 1000).toString()
			chrome.storage.sync.set({'lastnotified': notified});
			
		}
		if (items.lasttweetnotified !== undefined) {
			tweetnotified = items.lasttweetnotified
		} else {
			tweetnotified = 0;
			chrome.storage.sync.set({'lasttweetnotified': tweetnotified});
			
		}

		if (items.lasttwitchnotified !== undefined) {
			twitchnotified = items.lasttwitchnotified
		} else {
			twitchnotified = 0;
			chrome.storage.sync.set({'lasttwitchnotified': twitchnotified});
		}
		
	});
	$.getJSON('http://mindcrack.aubronwood.com/api/recent.json', function(data) {
		//Reverse the array. Oldest videos notified first.
		data = data.reverse();
		counter = 0;
		$.each(data, function(key,value) {
			if (value.timestamp > last) {
				if (value.timestamp > notified) {
					if (ytnotifynames.indexOf(value.author.toLowerCase()) >=0) {
						counter++;
						var notification = webkitNotifications.createNotification(
							value.image,
							'New Video From '+value.author,
							value.title
						);
						notification.onclick = $.proxy(function () {
							notification.cancel();
							var win=window.open(value.url, '_blank');
							win.focus();
						}, this);
						notification.ondisplay = function() {
							if (localStorage['mcNotificationExpire'] > 0) {
								console.log("beep?");
								setTimeout(function() {
									notification.cancel();
								},5000);
							}
						};
						notification.show();
					}
					chrome.storage.sync.set({'lastnotified': value.timestamp.toString()});
				}
				if (counter != 0) {
					chrome.browserAction.setBadgeText({text:counter.toString()});
				} else {
					chrome.browserAction.setBadgeText({text:''});
				}
			}
		});
	});
	$.getJSON('http://mindcrack.aubronwood.com/api/tweets.json', function(data) {
		console.log('GOT TWEETS');
		//Reverse the array. Oldest tweets notified first.
		data = data.reverse();
		var mode = 0;
		$.each(data, function(key,value) {
			if (value.id > tweetnotified) {
				console.log('tweet');
				if (localStorage['mcNotificationTweet'] == 1) {
					console.log('we can notify');
					if (twitternotifynames.indexOf(value.user.screen_name.toLowerCase()) >=0 && value.text.indexOf('via @YouTube') == -1) {
						
						console.log(value.user.screen_name.toLowerCase()+'is part of the club');
						var notification = webkitNotifications.createNotification(
							value.user.profile_image_url,
							value.user.name,
							value.text
						);
						notification.onclick = $.proxy(function () {
							notification.cancel();
							var win=window.open('http://twitter.com/'+value.user.screen_name+'/status/'+value.id_str, '_blank');
							win.focus();
						}, this);
						notification.ondisplay = function() {
							if (localStorage['mcNotificationExpire'] > 0) {
								console.log("beep?");
								setTimeout(function() {
									notification.cancel();
								},5000);
							}
						};
						notification.show();
					}
					chrome.storage.sync.set({'lasttweetnotified': value.id});
				}
			}
		});
	});
	$.getJSON('http://mindcrack.aubronwood.com/api/live.json', function(data) {
		var highestOnRun = 0;
		$.each(data, function(key,value) {
			console.log(value.id);
			if (value.id > highestOnRun) {
				highestOnRun = value.id;
			}
			if (value.id > twitchnotified) {
				if (twitchnotifynames.indexOf(value.channel.login.toLowerCase()) >=0 && localStorage['mcNotificationTwitch'] == 1) {
					var notification = webkitNotifications.createNotification(
						value.channel.screen_cap_url_small,
						value.channel.title,
						value.channel.status
					);
					notification.onclick = $.proxy(function() {
						notification.cancel();
						var win=window.open(value.channel.channel_url);
						win.focus();
					}, this);
					notification.ondisplay = function() {
						if (localStorage['mcNotificationExpire'] > 0) {
							setTimeout(function() {
								notification.cancel();
							}, 5000);
						}
					};
					notification.show();
				}
			}
		});
		if (highestOnRun > twitchnotified) {
			chrome.storage.sync.set({'lasttwitchnotified': highestOnRun});
		}

	});
	window.setTimeout(update,pollInterval);
}

// Check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version']
if (currVersion != prevVersion) {
	// Check if we just installed this extension.
	if (typeof prevVersion == 'undefined') {
  		onInstall();
	} else {
		onUpdate();
	}
	localStorage['version'] = currVersion;
}

//Icon coloring
checkIconColor();

update();

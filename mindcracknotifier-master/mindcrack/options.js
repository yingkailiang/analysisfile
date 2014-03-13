var mindcrackers;
var yttoggle = 0;
var ytnotifynames
if (localStorage['ytnotifynames'] != undefined) {
	ytnotifynames = localStorage['ytnotifynames']
} else {
	ytnotifynames = Array();
}
if (localStorage['twitternotifynames'] != undefined) {
	twitternotifynames = localStorage['twitternotifynames']
} else {
	twitternotifynames = Array();
}
if (localStorage['twitchnotifynames'] == undefined) {
	save_options();
	twitchnotifynames = Array();
} else {
	twitchnotifynames = localStorage['twitchnotifynames'];
}
function save_options() {

  
  var ytnotify = new Array();
  var twitternotify = new Array();
  var twitchnotify = new Array();
  $('#ytlist input').each(function() {
	  if ($(this).prop('checked') == true) {
		  ytnotify.push($(this).attr('name'));
		  twitternotify.push($(this).data('twitter'));
		  twitchnotify.push($(this).data('twitch'));
	  }
  });
  localStorage['ytnotifynames'] = ytnotify;
  localStorage['twitternotifynames'] = twitternotify;
  localStorage['twitchnotifynames'] = twitchnotify;
  
  
  
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
  
  if ($('#iconcolor').prop('checked') == true) {
	  localStorage['iconColor'] = 'white';
	  chrome.browserAction.setIcon({
			path: 'iconw.png'
		}); 
  } else {
	  localStorage['iconColor'] = 'black';
	  chrome.browserAction.setIcon({
			path: 'icon.png'
		}); 
  }
  if ($('#notifExpire').prop('checked') == true) {
	  localStorage['mcNotificationExpire'] = 1;
  } else {
	  localStorage['mcNotificationExpire'] = 0;
  }
  if ($('#notifUpdate').prop('checked') == true) {
	  localStorage['mcNotificationUpdate'] = 1;
  } else {
	  localStorage['mcNotificationUpdate'] = 0;
  }
  if ($('#notifTweet').prop('checked') == true) {
	  localStorage['mcNotificationTweet'] = 1;
  } else {
	  localStorage['mcNotificationTweet'] = 0;
  }
  if ($('#notifTwitch').prop('checked') == true) {
	  localStorage['mcNotificationTwitch'] = 1;
  } else {
	  localStorage['mcNotificationTwitch'] = 0;
  }
  chrome.storage.sync.set({'lasttwitchnotified': 0});
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	getMindcrackers();
	if (localStorage['iconColor'] == 'white') {
		$('#iconcolor').prop('checked',true);
	}
	if (localStorage['mcNotificationExpire'] == 1) {
		$('#notifExpire').prop('checked',true);
	}
	if (localStorage['mcNotificationUpdate'] == 1) {
		$('#notifUpdate').prop('checked',true);
	}
	if (localStorage['mcNotificationTweet'] == 1) {
		$('#notifTweet').prop('checked',true);
	}
	if (localStorage['mcNotificationTwitch'] == 1) {
		$('#notifTwitch').prop('checked',true);
	}


}

function getMindcrackers() {
	$.getJSON('http://mindcrack.aubronwood.com/api/mindcrackers.json', function(data) {
			mindcrackers = data;
			$.each(mindcrackers,function(key,value) {
				var checked = "";
				if (ytnotifynames.indexOf(value.youtube)>=0) {
					checked = "checked";
				} 
				$('#ytlist').append('<input type="checkbox" data-twitch="'+value.twitch+'" data-twitter="'+value.twitter+'" name="'+ value.youtube +'" id="ytnotif" '+checked+'>'+value.prettyname+'<br>');
				
			});
	});
}

function toggle_all(selector) {
	$(selector).each(function() {
		if (yttoggle == 0) {
			$(this).prop('checked',true);
		} else {
			$(this).prop('checked',false);
		}
	});
	if (yttoggle == 0) {
		yttoggle = 1;
	} else {
		yttoggle = 0;
	}
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
$('#all').click(function() {
	toggle_all('#ytlist input');
});
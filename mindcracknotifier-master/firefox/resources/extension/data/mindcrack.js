var lastopened;
if (localStorage['lastviewed'] == undefined) {
	localStorage['lastviewed'] = 0;
}
$(document).ready(function() {
  activatePanel(localStorage['lastviewed']);
	$('.youtubebutton').click(function() {
		activatePanel(0);
	});
	$('.twitterbutton').click(function() {
		activatePanel(1);
	});
});


								
function  activatePanel(panel) {
	console.log(panel);
	if (panel == 0) {
		console.log("YOUTUBE");
		$('.twitter').css('display','none');
		$('.youtubebutton').css('display','none');
		$('.twitterbutton').css('display','block');
		$('.main').css('display','block');
		$('.main').empty();
		localStorage['lastviewed'] = 0;
		$.getJSON('http://mindcrack.aubronwood.com/api/recent.json', function(data) {
			$.each(data, function(key,value) {
				if (value.title.length > 50) {
					value.title = value.title.substring(0,50)+'...';
				}
				var link ='<a href="'+value.url+'" >\
			<article>\
				<figure class="ytimg"><img src="'+value.image+'" /></figure>\
				<div class="details">\
					<h1>'+value.title+'</h1>\
					<h2>'+value.author+'</h2>\
				</div>\
			</article>\
		</a>';
				console.log('appending '+link);
				$('.main').append(link);
			});
		});
		
	} else {
		console.log("TWITTER");
		$('.main').css('display','none');
		$('.twitterbutton').css('display','none');
		$('.youtubebutton').css('display','block');
		$('.twitter').css('display','block');
		$('.twitter').empty();
		localStorage['lastviewed'] = 1;
		$.getJSON('http://mindcrack.aubronwood.com/api/tweets.json', function(data) {
			$.each(data, function(key,value) {

				var link ='<a href="http://twitter.com/'+value.user.screen_name+'/status/'+value.id_str+'">\
			<article>\
				<figure class="twitterimg"><img src="'+value.user.profile_image_url+'" /></figure>\
				<div class="details">\
					<h3>'+value.user.name+'</h2>\
					<h2>@'+value.user.screen_name+'</h2>\
					<h1>'+value.text+'</h1>\
				</div>\
				<div class="clear"></div>\
			</article>\
		</a>';
				$('.twitter').append(link);
			});
			
		});
		
	}	


}
	
chrome.browserAction.setBadgeText({text:''});
chrome.storage.sync.set({'lastopened': Math.floor((new Date()).getTime() / 1000).toString()});
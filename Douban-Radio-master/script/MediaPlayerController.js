var MediaPlayerController = MediaPlayerController || {};
MediaPlayerController.playlist = [];
MediaPlayerController.index = -1;
MediaPlayerController.channelUrl = null;
MediaPlayerController.channelInfo = [
	{
		title: "chinese",
		index: 0,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=1&from=mainsite&r=3087402645"
	},
	{
		title: "japanese",
		index: 1,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=17&from=mainsite&r=e2b4c1b954"
	},
	{
		title: "american",
		index: 2,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=2&from=mainsite&r=a09822fe44"
	},
	{
		title: "80",
		index: 3,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=4&from=mainsite&r=38ca50cb33"
	},
	{
		title: "light",
		index: 4,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=9&from=mainsite&r=1d5a511a6f"
	},
	{
		title: "southchina",
		index: 5,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=6&from=mainsite&r=89f19285d0"
	},
	{
		title: "nescafe",
		index: 6,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=32&from=mainsite&r=0b530c89bc"
	},
	{
		title: "young",
		index: 7,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=76&from=mainsite&r=718ec139f4"
	},
	{
		title: "new",
		index: 8,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=61&from=mainsite&r=fb6ecd5ce4"
	},
	{
		title: "90",
		index: 9,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=5&from=mainsite&r=c0da153637"
	},
	{
		title: "countryside",
		index: 10,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=8&from=mainsite&r=ce6b617888"
	},
	{
		title: "classic",
		index: 11,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=27&from=mainsite&r=4403a1bcb5"
	},
	{
		title: "girl",
		index: 12,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=20&from=mainsite&r=c652017031"
	},
	{
		title: "r&b",
		index: 13,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=16&from=mainsite&r=92685d30a8"
	},
	{
		title: "movie",
		index: 14,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=10&from=mainsite&r=cb975d5b9a"
	},
	{
		title: "korean",
		index: 15,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=18&from=mainsite&r=e04a00cd8f"
	},
	{
		title: "jazz",
		index: 16,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=13&from=mainsite&r=e13d204dd8"
	},
	{
		title: "comics",
		index: 17,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=28&from=mainsite&r=9408eb5624"
	},
	{
		title: "70",
		index: 18,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=3&from=mainsite&r=dcc310e2c3"
	},
	{
		title: "rock",
		index: 19,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=7&from=mainsite&r=ed050c7294"
	},
	{
		title: "french",
		index: 20,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=22&from=mainsite&r=ed648c294a"
	},
	{
		title: "easy",
		index: 21,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=77&from=mainsite&r=64300ca194"
	},
	{
		title: "rap",
		index: 22,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=15&from=mainsite&r=b44b0bd660"
	},
	{
		title: "electric",
		index: 23,
		url: "http://douban.fm/j/mine/playlist?type=n&channel=14&from=mainsite&r=d2699c3434"
	},
];

MediaPlayerController.requestPlaylist = function () {
	chrome.extension.connect().postMessage('MediaPlayerController:request');
	jQuery.ajax({
	  	url: MediaPlayerController.channelUrl,
	 	type: "GET",
	  	timeout: 2000,
	    success: function(data, textStatus, xhr) {
	   		chrome.extension.connect().postMessage('MediaPlayerController:received');
	    	MediaPlayerController.index = -1;
	  	  	MediaPlayerController.playlist = data.song;
	  	  	MediaPlayerController.playNext();			
	  	},
	  	error: function(xhr, textStatus, errorThrown) {
	    	MediaPlayerController.playlist = [];
	    	MediaPlayerController.requestPlaylist();
	  	},
	});
}

MediaPlayerController.generateUrl = function(config){
	return "http://douban.fm/j/mine/playlist?channel="+config.channelNo+"&type="+config.type+"&sid="+config.sid;
}

MediaPlayerController.playNext = function(){
	if (MediaPlayerController.playlist.length && MediaPlayerController.index < MediaPlayerController.playlist.length - 1) {
		MediaPlayerController.index++;
		MediaPlayer.setCurrentSrc(MediaPlayerController.playlist[MediaPlayerController.index].url);
		MediaPlayerController.play();
	}else{
		chrome.extension.connect().postMessage('MediaPlayerController:end of playlist');
		MediaPlayerController.requestPlaylist();
	}
}

MediaPlayerController.playPrevious = function(){
	if (MediaPlayerController.playlist.length && MediaPlayerController.index > 0) {
		MediaPlayerController.index--
		MediaPlayer.setCurrentSrc(MediaPlayerController.playlist[MediaPlayerController.index].url);
		MediaPlayerController.play();
	}else{
		chrome.extension.connect().postMessage('MediaPlayerController:start of playlist');
	}
}

MediaPlayerController.play = function(){
	chrome.extension.connect().postMessage(MediaPlayerController.playlist[MediaPlayerController.index]);
	MediaPlayer.play();
}

MediaPlayerController.setMediaPlayerLogic = function(){
	MediaPlayer.onEnded = function(){
		MediaPlayerController.playNext();
	};
}

function main(index){
	chrome.extension.connect().postMessage('MediaPlayerController:main');
	var url = MediaPlayerController.channelInfo[index].url;
	MediaPlayerController.channelUrl = url;
	MediaPlayerController.setMediaPlayerLogic();
	MediaPlayerController.requestPlaylist();
}
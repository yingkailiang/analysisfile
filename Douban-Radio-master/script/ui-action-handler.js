var channelNo = 0;

function play () {
	backDOM.MediaPlayer.play();
}

function stop (){
	backDOM.MediaPlayer.pause();
}

function next () {
	backDOM.MediaPlayerController.playNext();
}

function init () {
	var mediaplay = document.querySelector('#media-play');
	mediaplay.addEventListener('click', play);

	var mediastop = document.querySelector('#media-stop');
	mediastop.addEventListener('click', stop);

	var medianext = document.querySelector('#media-next');
	medianext.addEventListener('click', next);

	if(localStorage.getItem('channel')){
		channelNo = localStorage.getItem('channel');
	}

	backDOM = chrome.extension.getBackgroundPage();
	console.log(backDOM.MediaPlayer.readyState());
	if (backDOM.MediaPlayer.readyState()<2 ) {
		backDOM.main(channelNo);
	}else{
		var currentSongInfo = backDOM.MediaPlayerController.playlist[backDOM.MediaPlayerController.index];
		setSonyTitle(currentSongInfo.title);
		setSongArtist(currentSongInfo.artist);
		setBackgroundImage(currentSongInfo.picture);
	}
}

chrome.extension.onConnect.addListener(function(port){
	port.onMessage.addListener(function(msg){
		console.log(msg);

		if (msg.picture) {
			setSonyTitle(msg.title);
			setSongArtist(msg.artist);
			setBackgroundImage(msg.picture);
		};
	});	
});

function setSonyTitle(song){
	var title = document.querySelector('#media-title-song');
	title.textContent = song;
}

function setSongArtist (name) {
	var artist = document.querySelector('#media-title-artist');
	artist.textContent = name;
}

function setBackgroundImage(source){
	var cover = document.querySelector('#media-cover');
	source = source.replace('mpic', 'lpic');
	cover.src = source;

}

document.addEventListener('DOMContentLoaded', init);
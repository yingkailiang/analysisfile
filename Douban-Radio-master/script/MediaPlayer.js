/* Module 		*/
/* MediaPlayer 	*/


var MediaPlayer = MediaPlayer || {};
MediaPlayer.mp = new Audio();
MediaPlayer.mp.addEventListener('ended', function(e){	
	MediaPlayer.onEnded(e);
},false);

MediaPlayer.init = function(){
	//chrome.extension.connect().postMessage('mp');
}

MediaPlayer.error = function(){
	/*
	 *@param 1: stop by user
	 *@param 2: network error
	 *@param 3: decode error
	 *@param 4: url error
	 */
	if (MediaPlayer.mp && MediaPlayer.mp.error) {
		return MediaPlayer.mp.error.code;
	}	
}

MediaPlayer.getCurrentSrc = function(){
	return MediaPlayer.mp.currentSrc;
}

MediaPlayer.setCurrentSrc = function(src){
	MediaPlayer.mp.src = src;
}

MediaPlayer.canPlayType = function(type){
	return MediaPlayer.mp.canPlayType(type);
}

MediaPlayer.getNetworkState = function(){
	/*
	 *@param 0: no resource for init
	 *@param 1: correct but no network
	 *@param 2: downloading
	 *@param 3: no resource
	 */
	return MediaPlayer.mp.networkState;
}

MediaPlayer.load = function(){
	MediaPlayer.mp.load();
}

// No-Understand
MediaPlayer.getBuffered = function(){
	return MediaPlayer.mp.buffered;
}

MediaPlayer.preload = function(){
	/*
	 *@param none: no preload
	 *@param metadata: info about preload
	 *@param auto
	 */
	return MediaPlayer.mp.preload;
}

MediaPlayer.readyState = function(){
	/*
	 *@param 1: have_nothing
	 *@param 2: have_metadata
	 *@param 3: have_current_data
	 *@param 4: have_future_data
	 *@param 5: have_enough_data
	 */
	return MediaPlayer.mp.readyState;
}

MediaPlayer.isSeeking = function(){
	return MediaPlayer.mp.seeking;
}

MediaPlayer.getCurrentTime = function(){
	return MediaPlayer.mp.currentTime;
}

MediaPlayer.setCurrentTime = function(time){
	MediaPlayer.mp.currentTime = time;
}

MediaPlayer.getStartTime = function(){
	return MediaPlayer.mp.startTime;
}

MediaPlayer.getDuration = function(){
	return MediaPlayer.mp.duration;
}

MediaPlayer.isPaused = function(){
	return MediaPlayer.mp.paused;
}

MediaPlayer.getDefaultPlaybackRate = function(){
	return MediaPlayer.mp.defaultPlaybackRate;
}

MediaPlayer.setDefaultPlaybackRate = function(value){
	return MediaPlayer.mp.defaultPlaybackRate = value;
}

MediaPlayer.getPlayRange = function(){
	return MediaPlayer.mp.played;
}

MediaPlayer.getSeekableRange = function(){
	return MediaPlayer.mp.seekable;
}

MediaPlayer.isEnded = function(){
	return MediaPlayer.mp.ended;
}

MediaPlayer.isAutoPlay = function(){
	return MediaPlayer.mp.autoPlay;
}

MediaPlayer.isLoop = function(){
	return MediaPlayer.mp.loop;
}

MediaPlayer.play = function(){
	MediaPlayer.mp.play();
}

MediaPlayer.pause = function(){
	MediaPlayer.mp.pause();
}

MediaPlayer.isControls = function(){
	MediaPlayer.mp.controls;
}

MediaPlayer.getVolume = function(){
	return MediaPlayer.mp.volume;
}

MediaPlayer.setVolume = function(value){
	MediaPlayer.mp.volume = value;
}

MediaPlayer.setMulted = function(mute){
	MediaPlayer.mp.muted = mute;
}

MediaPlayer.isMulted = function(){
	return MediaPlayer.mp.muted;
}

MediaPlayer.onLoadStart = function(e){}
MediaPlayer.onProgress = function(e){}
MediaPlayer.onSuspend = function(e){}
MediaPlayer.onAbort = function(e){}
MediaPlayer.onError = function(e){}
MediaPlayer.onStalled = function(e){}
MediaPlayer.onPlay = function(e){}
MediaPlayer.onPause = function(e){}
MediaPlayer.onLoadMetaData = function(e){}
MediaPlayer.onLoadData = function(e){}
MediaPlayer.onWaiting = function(e){}
MediaPlayer.onPlaying = function(e){}
MediaPlayer.onCanPlay = function(e){}
MediaPlayer.onCanPlayThrough = function(e){}
MediaPlayer.onSeeking = function(e){}
MediaPlayer.onSeeked = function(e){}

/*@returns current playing time*/
MediaPlayer.onTimeUpdate = function(e){}
MediaPlayer.onEnded = function(e){}
MediaPlayer.onRateChange = function(e){}

/*@returns song's duration*/
MediaPlayer.onDurationChange = function(e){}
MediaPlayer.onVolumeChange = function(e){}
var BookmarkMap = function(config){
	config = config || {};
	if(config.data){
		this.hasData = true;
		this.data = config.data;
	} else {
		this.hasData = false;
		this.data = {};
	}

	this.saveFn = config.save || function(){};
}

BookmarkMap.prototype.isSet = function(){
	return this.hasData;
}

BookmarkMap.prototype.set = function(bookmark){
	this.data[bookmark.id] = bookmark;
	this.hasData = true;
	return true;
}

BookmarkMap.prototype.removeBookmark = function(bookmarkId){
	return delete(this.data[bookmarkId]);
}

BookmarkMap.prototype.get = function(bookmarkId){
	return this.data[bookmarkId];
}

BookmarkMap.prototype.save = function(){
	this.saveFn(this.data);
}

BookmarkMap.prototype.reset = function(){
	this.data = {};
	this.hasData = false;
	this.save();
}
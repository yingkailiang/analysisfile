var BookmarkTagMap = function(config){
	config = config || {};
	this.data = config.data || {};
	this.saveFn = config.save || function(){};
}

BookmarkTagMap.prototype.add = function(bookmarkId, tag){
	if(this.data[bookmarkId]){
		if(this.data[bookmarkId].indexOf(tag) < 0){
			this.data[bookmarkId].push(tag);
		} else {
			return false;
		}
	} else {
		this.data[bookmarkId] = [tag];
	}
	return true;
}

BookmarkTagMap.prototype.remove = function(bookmarkId, tag){
	var hasBookmarkId = (this.data[bookmarkId]) ? true:false;
	var tagIndex = (hasBookmarkId) ? this.data[bookmarkId].indexOf(tag) : -1;
	if(hasBookmarkId && tagIndex >= 0){
		this.data[bookmarkId].splice(tagIndex, 1);
		return true;
	}
	return false;
}

BookmarkTagMap.prototype.removeBookmark = function(bookmarkId){
	var hasBookmarkId = (this.data[bookmarkId]) ? true:false;
	if(hasBookmarkId){
		delete(this.data[bookmarkId]);
		return true;
	}
	return false;
}

BookmarkTagMap.prototype.get = function(bookmarkId){
	var tags = this.data[bookmarkId];
	return (tags) ? tags:[];
}

BookmarkTagMap.prototype.save = function(){
	this.saveFn(this.data);
	return true;
}


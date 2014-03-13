var BookmarkIndex = function(config){
	config = config || {};
	this.data = config.data || {} ;
	this.saveFn = config.save || function(){};

	if(config.data){
		this.hasData = true;
	} else {
		this.hasData = false;
	}
}

BookmarkIndex.prototype.isSet = function(){
	return this.hasData;
}

BookmarkIndex.prototype.save = function(){
	this.saveFn(this.data);
	return;
}

BookmarkIndex.prototype.reset = function(){
	this.data = {};
	this.save();
	this.hasData = false;
	return true;
}

BookmarkIndex.prototype.add = function(bookmarkId, keys){
	if(keys instanceof Array){
		for(var i in keys){
			var key = keys[i];
			this._add(bookmarkId, key);
		}
	} else {
		this._add(bookmarkId, keys);
	}
}

BookmarkIndex.prototype._add = function(bookmarkId, key){
	key = key.toLowerCase();
	var bookmarkIds = this.get(key);
	if(bookmarkIds){
		if(bookmarkIds.indexOf(bookmarkId) == -1){
			this.data[key].push(bookmarkId);
		} else {
			return;
		}
	} else {
		this.data[key] = [bookmarkId];
	}
}

BookmarkIndex.prototype.hasKey = function(key){
	return (this.data[key])  ? true:false;
}

BookmarkIndex.prototype.remove = function(bookmarkId, keys){
	if(keys instanceof Array){
		for(var i in keys){
			var key = keys[i];
			this._remove(bookmarkId, key);
		}
	} else {
		this._remove(bookmarkId, keys);
	}
}

BookmarkIndex.prototype._remove = function(bookmarkId, key){
	key = key.toLowerCase();
	var hasKey = this.hasKey(key);
	var index = (hasKey) ? this.get(key).indexOf(bookmarkId): -1;
	if(hasKey && index > -1){
		this.data[key].splice(index, 1);
	}
}

BookmarkIndex.prototype.get = function(key){
	return this.data[key];
}

BookmarkIndex.prototype.search = function(searchValue){
	searchValue = searchValue.toLowerCase();
	return this.get(searchValue) || [];
}

BookmarkIndex.prototype.removeBookmark = function(bookmarkId){
	var cnt = 0;
	for(var i in this.data){
		var bookmarkIds = this.data[i] || [];
		var index = bookmarkIds.indexOf(bookmarkId);
		if(index >= 0){
			bookmarkIds.splice(index, 1);
			cnt++;
		}
	}
	return cnt;
}
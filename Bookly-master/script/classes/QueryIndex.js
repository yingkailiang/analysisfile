var QueryIndex = function(config){
	config = config || {};
	this.data = config.data || {byQuery:{},byId:{}, lastQuery:""};
	this.saveFn = config.save || function(){};
}

QueryIndex.prototype.save = function(){
	this.saveFn(this.data);
	return true;
}

QueryIndex.prototype.reset = function(){
	this.data = {};
	this.save();
}

QueryIndex.prototype.add = function(query, bookmarkId){
	var res = this.data.byQuery[query];
	var idRes = this.data.byId[bookmarkId];
	this.data.lastQuery = query;
	if(res){
		var bMap = res[bookmarkId];
		if(bMap){
			this.data.byQuery[query][bookmarkId]++;
		} else {
			this.data.byQuery[query][bookmarkId] = 1;
		}
	} else {
		this.data.byQuery[query] = {};
		this.data.byQuery[query][bookmarkId] = 1;
	}

	if(idRes){
		this.data.byId[bookmarkId]++;
	} else {
		this.data.byId[bookmarkId] = 1;
	}

	this.save();
}

QueryIndex.prototype.getQueryRank = function(query){
	var sortedBookmarks = [];
	var objs = [];
	var res = this.data.byQuery[query] || {};

	for(var bookmarkId in res){
		var cnt = res[bookmarkId];
		objs.push({id:bookmarkId, count:cnt});
	}

	objs.sort(function(a,b){
		return b.count - a.count;
	});

	for(var i in objs) sortedBookmarks.push(objs[i].id);
	return sortedBookmarks;
}

QueryIndex.prototype.getGlobalRank = function(query){
	var sortedBookmarks = [];

	for(var bookmarkId in this.data.byId){
		if(this.data.byId[bookmarkId] > 0){
			sortedBookmarks.push({id:bookmarkId, count:this.data.byId[bookmarkId] });
		} else {
			sortedBookmarks.push({id:bookmarkId, count:0});
		}
	}

	sortedBookmarks.sort(function(a,b){
		return b.count - a.count;
	});

	for(var i in sortedBookmarks){
		sortedBookmarks[i] = sortedBookmarks[i].id;
	}
	return sortedBookmarks;
}

QueryIndex.prototype.removeBookmark = function(bookmarkId){
	for(var i in this.data.byQuery){
		delete(this.data.byQuery[i][bookmarkId]);
	}
	delete(this.data.byId[bookmarkId]);
}

QueryIndex.prototype.setLastQuery = function(query){
	this.data.lastQuery = query;
	this.save();
}

QueryIndex.prototype.getLastQuery = function(){
	return this.data.lastQuery || "";
}
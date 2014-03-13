var bookmarkIndex;
var bookmarkTagMap;
var bookmarkMap;

function update(fn){
	chrome.storage.local.get([
			STORAGE_BOOKMARK_INDEX_NAME
			,STORAGE_TAG_MAP_NAME
			,BOOKMARK_MAP_NAME
	], function(dataSet){
		bookmarkIndex = new BookmarkIndex({
			data: (dataSet[STORAGE_BOOKMARK_INDEX_NAME]) ? JSON.parse(dataSet[STORAGE_BOOKMARK_INDEX_NAME]):undefined
			,save: function(saveData, cb){
				var s = {};
				s[STORAGE_BOOKMARK_INDEX_NAME] = JSON.stringify(saveData);
				chrome.storage.local.set(s, cb);
			}
		});

		bookmarkTagMap = new BookmarkTagMap({
			data: (dataSet[STORAGE_TAG_MAP_NAME]) ? JSON.parse(dataSet[STORAGE_TAG_MAP_NAME]):undefined
			,save:function(saveData, cb){
				var s = {};
				s[STORAGE_TAG_MAP_NAME] = JSON.stringify(saveData);
				chrome.storage.local.set(s, cb);
			}
		});

		bookmarkMap = new BookmarkMap({
			data: (dataSet[BOOKMARK_MAP_NAME]) ? JSON.parse(dataSet[BOOKMARK_MAP_NAME]):undefined
			,save:function(saveData, cb){
				var s = {};
				s[BOOKMARK_MAP_NAME] = JSON.stringify(saveData);
				chrome.storage.local.set(s, cb);
			}
		});

		fn(bookmarkIndex, bookmarkTagMap, bookmarkMap);
	});
}

		
chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
	update(function(bookmarkIndex, bookmarkTagMap, bookmarkMap){
		var category = (bookmark.url) ? 'bookmark':'bookmark folder';
		bookmarkIndex = addBookmarkToIndex(bookmark, bookmarkTagMap, bookmarkIndex);
		bookmarkIndex.save();

		bookmarkMap = addBookmarkToMap(bookmark, bookmarkMap);
		bookmarkMap.save();
		
		ga('send','event', category ,'created', JSON.stringify(bookmark));
	});
});

chrome.bookmarks.onRemoved.addListener(function(id, removeInfo){
	update(function(bookmarkIndex, bookmarkTagMap, bookmarkMap){
		reindex(bookmarkMap, bookmarkTagMap, bookmarkIndex);
		
		ga('send','event','bookmark','removed');
	});
});

chrome.bookmarks.onChanged.addListener(function(id, changeInfo){
	update(function(bookmarkIndex, bookmarkTagMap, bookmarkMap){
		var category = changeInfo.url ? "bookmark":"bookmark folder";

		reindex(bookmarkMap, bookmarkTagMap, bookmarkIndex);
		
		ga('send','event',category ,'changed', JSON.stringify(changeInfo));
	});
});

chrome.bookmarks.onImportEnded.addListener(function(a){
	update(function(bookmarkIndex, bookmarkTagMap, bookmarkMap){
		reindex(bookmarkMap, bookmarkTagMap, bookmarkIndex);
		ga('send','event','bookmark','imported');
	});
});
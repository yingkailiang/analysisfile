function setEndOfContenteditable(contentEditableElement){
    var range,selection;
    if(document.createRange){//Firefox, Chrome, Opera, Safari, IE 9+

        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
}

function getCaretPosition(editableDiv) {
    var caretPos = 0, containerEl = null, sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv) {
                caretPos = range.endOffset;
            }
        }
    } 
    return caretPos;
}

function getPieces(largeString){
    var pieces = [];
	for(var i=1; i <= largeString.length && i <= 11; i++){
	    var tail = 0;
	    var groupSize = i;
	    for(var j=0; tail < largeString.length; j++){
	          pieces.push(largeString.substr(j, groupSize));
	          tail = j + groupSize;
	     }
	}
	return pieces;
}


function parseQuery(queryString){
	var result = {all:[], excludes:[], any:[]};
	var all =  queryString.split(' ');

	for(var i in all){
		var allVal = all[i].trim();
		if( allVal != "" && all.length > 0){
			result.all.push(allVal);
		}
	}
	
	return result;
}

function addBookmarkToMap(bookmark, map){
	var children = bookmark.children || [];

	if(bookmark.url && bookmark.url != ""){
		if(bookmark.title == ""){
			bookmark.displayTitle = bookmark.url.replace(/http[s]*:\/\/[www.]*/gi, "");
		} else {
			bookmark.displayTitle = bookmark.title;
		}
		map.set(bookmark);
	}

	for(var i in children){
		var child = children[i];
		map = addBookmarkToMap(child, map);
	}
	return map;
}

function buildIndex(bookmarks, tagMap, index){
	for(var i in bookmarks){
		index = addBookmarkToIndex(bookmarks[i], tagMap, index);
	}
	return index;
}

function reindex(bookmarkMap, tagMap, index){
	index.reset();
	bookmarkMap.reset();
	chrome.bookmarks.getTree(function(bookmarks){
		for(var i in bookmarks){
			var bookmark = bookmarks[i];
			bookmarkMap = addBookmarkToMap(bookmark, bookmarkMap);
		}
		bookmarkMap.save();

		bookmarkIndex = buildIndex(bookmarks, bookmarkTagMap, bookmarkIndex);
		bookmarkIndex.save();
	});
}

function addBookmarkToIndex(bookmark, tagMap, index, parentTitle){
	var tags = tagMap.get(bookmark.id);
	var children = bookmark.children || [];
	var parentTitle = parentTitle || "";
	var allKeys = [];
	var indexTitle = bookmark.title || bookmark.url || "";
	
	
	if(bookmark.url && bookmark.url != ""){
		indexTitle = indexTitle.replace(/http[s]*:\/\/[www.]*/gi, "");
		var titleWords = (bookmark.title) ? bookmark.title.split(' '):[];
		allKeys.push(bookmark.title);
		allKeys.push(bookmark.id);
		allKeys.push(bookmark.url);
		allKeys = allKeys.concat(getPieces(bookmark.id));
		allKeys = allKeys.concat(getPieces(indexTitle));
		if(parentTitle != "") allKeys = allKeys.concat(getPieces(parentTitle));
		
		for(var i in titleWords){
			var titleWord = titleWords[i];
			allKeys.push(titleWord);
		}
		for(var i in tags){
			allKeys.push(tags[i]);
			var tagPieces = getPieces(tags[i]);
			allKeys = allKeys.concat(tagPieces);
		}
		
		index.add(bookmark.id, allKeys);
	} else {
		parentTitle = bookmark.title;
	}

	for(var i in children){
		var child = children[i];
		index = addBookmarkToIndex(child, tagMap, index, parentTitle);
	}
	return index;
}


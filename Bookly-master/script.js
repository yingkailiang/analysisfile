var bookmarkIndex;
var bookmarkMap;
var bookmarkTagMap;
var queryIndex;
var bookmarks;
var updateResults;
var bookmarkIds;
var cnt = 0;
var searchEvt;



require([
	'dojo/NodeList-manipulate'
	,'dojo/dom-construct'
	,'dojox/collections/Set'
	,'dojo/NodeList-traverse'
	,"dojox/dtl"
	,"dojox/dtl/Context"
	,'dojox/dtl/tag/logic'
	,'dojo/keys'
	,'dojo/dom-class'
	,'dojo/_base/event'
	,'dojo/on'
	,'dojo/domReady!'
]
,function(m,dconst,Set,traverse,dtl,Context,dtlLogic,keys,domClass, dEvt, on){

	chrome.storage.local.get([
			STORAGE_BOOKMARK_INDEX_NAME
			,STORAGE_QUERY_INDEX_NAME
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

		queryIndex = new QueryIndex({
			data: (dataSet[STORAGE_QUERY_INDEX_NAME]) ? JSON.parse(dataSet[STORAGE_QUERY_INDEX_NAME]):undefined
			,save:function(saveData, cb){
				var s = {};
				s[STORAGE_QUERY_INDEX_NAME] = JSON.stringify(saveData);
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

		if(!bookmarkIndex.isSet() || !bookmarkMap.isSet()){
			chrome.bookmarks.getTree(function(bookmarks){
				if(!bookmarkIndex.isSet()){
					bookmarkIndex = buildIndex(bookmarks, bookmarkTagMap, bookmarkIndex);
					bookmarkIndex.save();
				}

				if(!bookmarkMap.isSet()){
					for(var i in bookmarks){
						var bookmark = bookmarks[i];
						bookmarkMap = addBookmarkToMap(bookmark, bookmarkMap);
					}
					bookmarkMap.save();
				}

				loadBookmarkPage(bookmarkIndex,bookmarkTagMap, queryIndex, bookmarkMap);
			});
		} else {
			loadBookmarkPage(bookmarkIndex,bookmarkTagMap, queryIndex, bookmarkMap);
		}
	});

	var bookmarkItemTemplate = new dojox.dtl.Template(BOOKMARK_ITEM_TEMPLATE_NAME);

	dojo.query('html').on('keydown', function(evt){
		var charOrCode = evt.charCode || evt.keyCode;
		switch(charOrCode){
			case keys.ENTER:
				if(dojo.query(':focus:not(.tags)')[0]){
					var mod = "";
					evt.preventDefault();
					var query = dojo.query('#bookmarkSearch')[0].value;
					var url = dojo.query('.selected a')[0].getAttribute('href');
					var bookmarkId = this.getAttribute('bookmark-id');
					var resultIndex = Number(dojo.query('.selected a')[0].getAttribute('result-index'));
					queryIndex.add(query, bookmarkId);

					if (url.search(/^javascript:/gi) == -1){
						if(evt.ctrlKey || evt.shiftKey){
							chrome.tabs.create({url: url});
							mod = (evt.ctrlKey) ? ' + ctrl' :' + alt';
						} else  {
							chrome.tabs.update({url:url});
						}
						ga('send','event','enter' + mod,'keydown', 'results:' + cnt, resultIndex);
						window.close();
					}
				} else {
					evt.preventDefault();
					dojo.query('.selected a')[0].focus();
					ga('send','event','enter','keydown', 'from tag edit to link');
				}
				break;
			case keys.TAB:
				var hasFocus =dojo.query('.tags:focus').closest('li').query('a')[0] ||  dojo.query('a:focus')[0];
				var lastBookmark = dojo.query('.bookmarks .BookmarkItem a').last()[0];
				var tabType = (evt.shiftKey) ? "up":"down"
				ga('send','event', 'tab '+tabType,'keydown');

				if(hasFocus && lastBookmark === hasFocus && !evt.shiftKey){
					evt.preventDefault();
					dojo.query('#bookmarkSearch')[0].focus();
					
				} else if(hasFocus && hasFocus.tagName == 'INPUT' && evt.shiftKey){
					evt.preventDefault();
					dojo.query('.bookmarks li a').last()[0].focus();
				} 
				break;
			case keys.DOWN_ARROW:
				var inputFocus =  dojo.query('input:focus')[0];
				var selected = dojo.query('.tags:focus').closest('li').query('a')[0] ||dojo.query('a:focus')[0];
				var lastBookmark = dojo.query('.bookmarks .BookmarkItem a').last()[0];
				

				if(inputFocus){
					var numBookmarks = dojo.query('.BookmarkItem').length;
					if(numBookmarks > 1){
						evt.preventDefault();
						dojo.query('a').at(1)[0].focus();
					} else if(numBookmarks == 1){
						evt.preventDefault();
						dojo.query('a').at(0)[0].focus();
					} 
					ga('send','event','arrow down','keydown', 'from search');
				} else if(selected) {
					if(selected === lastBookmark){
						evt.preventDefault();
						dojo.query('#bookmarkSearch')[0].focus();
					} else {
						evt.preventDefault();
						dojo.query(selected).closest('li').next().query('a')[0].focus();
					}
					ga('send','event','arrow down','keydown', 'from selected');
				}
				break;
			case keys.UP_ARROW:
				var inputFocus = dojo.query('input:focus')[0];
				var selected = dojo.query('.tags:focus').closest('li').query('a')[0] || dojo.query('a:focus')[0];
				var firstBookmark = dojo.query('.bookmarks .BookmarkItem a').first()[0];
				var numBookmarks = dojo.query('.BookmarkItem').length;

				if(inputFocus){
					if(numBookmarks > 1){
						evt.preventDefault();
						dojo.query('.bookmarks li a').last()[0].focus();
					} 
					ga('send','event','arrow up', 'keydown','from search');
				} else if(selected){
					if(selected === firstBookmark){
						evt.preventDefault();
						dojo.query('#bookmarkSearch')[0].focus();
					} else {
						evt.preventDefault();
						dojo.query(selected).closest('li').prev().query('a')[0].focus();
					}
					ga('send','event','arrow up','keydown', 'from selected');
				}
				break;
			case keys.ALT:
				if(evt.shiftKey){
					evt.preventDefault();
					var focus = dojo.query(':focus')[0];
					var tags = dojo.query('.selected .tags')[0];
					
					if(tags === focus){
						dojo.query(tags).closest('li').query('a')[0].focus();
						ga('send','event','alt + shift','keydown', 'end tag edit');
					} else {
						tags.focus();
						setEndOfContenteditable(tags);
						ga('send','event','alt + shift', 'keydown','start tag edit');
					}
				}
				break;
			case keys.SHIFT:
				if(evt.altKey){
					evt.preventDefault();
					var focus = dojo.query(':focus')[0];
					var tags = dojo.query('.selected .tags')[0];
					
					if(tags === focus){
						dojo.query(tags).closest('li').query('a')[0].focus();
						ga('send','event','shift + alt','keydown', 'end tag edit');
					} else {
						tags.focus();
						setEndOfContenteditable(tags);
						ga('send','event','shift + alt','keydown', 'start tag edit');
					}
				}
				break;
			case keys.RIGHT_ARROW:
				dojo.query('.selected .tags')[0].focus();
				ga('send','event','arrow right','keydown', 'start tag edit');
				break;

			case keys.LEFT_ARROW:
				var focus = dojo.query(':focus')[0];
				if(focus){
					var pos = getCaretPosition(focus);
					if(pos == 0){
						evt.preventDefault();
						var selected  = dojo.query('.selected a')[0];
						selected.focus();
						ga('send','event','arrow left','keydown', 'end tag edit');
					}
				}
				break;
				
		}
	});

	function loadBookmarkPage(bookmarkIndex, bookmarkTagMap, queryIndex, bookmarkMap){
		dojo.query('#bookmarkSearch')[0].value = queryIndex.getLastQuery();
		dojo.query('#bookmarkSearch').on('keyup,view',function(){
			var qu = this.value;
			queryIndex.setLastQuery(qu);
			window.scrollTo(0,0);
			updateResults(qu);
		});
		
		updateResults = function(qu){
			dojo.query('.bookmarks').html('');

			var q = parseQuery(qu);
			var all = q.all;
			var any = q.any;
			bookmarkIds = [];
			var exact = [];
			var exclude = [];
			
			if(all.length > 0){
				var allResults = bookmarkIndex.search(all[0]);
				var inter = [];
				for(var i = 1; i < all.length; i++){
					var res = bookmarkIndex.search(all[i]);
					inter = Set.intersection(allResults, res).toArray();
					allResults = inter;
				}
				bookmarkIds = bookmarkIds.concat(allResults);
			} 

			for(var i = 0; i < any.length; i++){
				bookmarkIds = bookmarkIds.concat(bookmarkIndex.search(any[i]));
			}

			if(qu == "" || (any.length == 0 && all.length == 0) ){
				for(var bookmarkId in bookmarkMap.data) bookmarkIds.push(bookmarkId);
			} else {
				bookmarkIds = bookmarkIds.concat( bookmarkIndex.search(qu));
			}

			for(var i = 0; i< q.excludes.length; i++){
				exclude = exclude.concat(bookmarkIndex.search(q.excludes[i]));
			}
			
			var pushedIds = [];
			
			for(var i in bookmarkIds){
				var bookmarkId = bookmarkIds[i];
				if(pushedIds.indexOf(bookmarkId) == -1 && exclude.indexOf(bookmarkId) == -1){
					pushedIds.push(bookmarkId);
				} else {
					continue;
				}
			}

			var bookmarksForQuery = (qu != "") ? queryIndex.getQueryRank(qu) : [];
			var globalRank = queryIndex.getGlobalRank();
			var sortedBookmarks= [];
			var remainingBookmarks = [];

			for(var i in bookmarksForQuery){
				var id = bookmarksForQuery[i];
				var index = pushedIds.indexOf(id);
				if(index >= 0){ 
					sortedBookmarks.push(bookmarkMap.get(id));
					pushedIds.splice(index, 1);
				}
			}

			for(var i in exact){
				var id = exact[i];
				var index = pushedIds.indexOf(id);

				if(index >= 0){
					sortedBookmarks.push(bookmarkMap.get(id));
					pushedIds.splice(index, 1);
				}
			}

			for(var i in globalRank){
				var id = globalRank[i];
				var index = pushedIds.indexOf(id);

				if(index >= 0){
					sortedBookmarks.push(bookmarkMap.get(id));
					pushedIds.splice(index, 1);
				}
			}

			for(var i in pushedIds){
				var id = pushedIds[i];
				remainingBookmarks.push(bookmarkMap.get(id));
			}

			remainingBookmarks.sort(function(a,b){
				var aTitle = a.displayTitle || a.title;
				var bTitle = b.displayTitle || b.title;

				aTitle = aTitle.toLowerCase();
				bTitle = bTitle.toLowerCase();

				if(aTitle > bTitle){
					return 1;
				} else if(aTitle < bTitle){
					return -1;
				} else {
					return 0;
				}
			});
			
			sortedBookmarks = sortedBookmarks.concat(remainingBookmarks);

			cnt = 0;
			for(var i in sortedBookmarks){
				var bookmark = sortedBookmarks[i];
				var tags = bookmarkTagMap.get(bookmark.id);
				var isFirst = cnt == 0;
				var tabindex = (isFirst) ? '-1':"";
				
				var nd = dconst.create('li',{
					innerHTML: bookmarkItemHtml(bookmarkItemTemplate, bookmark, tags, tabindex, cnt)
					,class: (isFirst) ? 'selected first':""
				});

				dojo.query('.bookmarks').append(nd);
				cnt++;
			}

			


			dojo.query('.tags').on('click', function(){
				var isFocused = domClass.contains(this, 'focusTags');
				var isClicked = domClass.contains(this,'clickedTags');
				
				if(!isClicked){
					setEndOfContenteditable(this);
					dojo.query(this).addClass('clickedTags');
					ga('send','event',"tags", 'click',' enter edit');
				}
			});

			dojo.query('.tags').on('focus',function(){
				var isFocused = domClass.contains(this, 'focusTags');
				var isClicked = domClass.contains(this,'clickedTags');
				dojo.query(this).closest('.BookmarkItem').removeClass('emptyTags');

				if(!isFocused && !isClicked){
					if(this.innerHTML.trim() != ""){
						this.innerHTML = this.innerHTML +',&nbsp;';
					}
					dojo.query(this).addClass('focusTags');
					setEndOfContenteditable(this);
				}
			});

			dojo.query('.tags').on('focusout', function(){
				dojo.query(this).removeClass('clickedTags');
				dojo.query(this).removeClass('focusTags');
				var tagStr = this.innerHTML;
				var trimmed = tagStr.replace(/((&nbsp;)|(\,)|(\s))+$/i,"").trim();
				
				this.innerHTML = trimmed;
				var hasContent = this.innerHTML != "";
				
				if(hasContent){
					dojo.query(this).closest('.BookmarkItem').removeClass('emptyTags');
					ga('send','event','tags','focusout', 'has content');
				} else {
					dojo.query(this).closest('.BookmarkItem').addClass('emptyTags');
					ga('send','event','tags','focusout', 'no content');
				}
				var bookmarkId = this.getAttribute('bookmark-id');
				saveTags(bookmarkId);
			});

			dojo.query('.BookmarkItem a').on('click', function(e){
				e.preventDefault();
				var query = dojo.query('#bookmarkSearch')[0].value;
				var bookmarkId = this.getAttribute('bookmark-id');
				var resultIndex = Number(this.getAttribute('result-index'));
				queryIndex.add(query, bookmarkId);
				
				if(this.href.search(/^javascript:/gi) == -1){
					if(!e.ctrlKey ){
						chrome.tabs.update({url:this.href});
						ga('send','event','bookmark','click', 'result total:' + cnt, resultIndex);
					}  else {
						chrome.tabs.create({url:this.href});
						ga('send','event','bookmark','click', 'result total:' + cnt, resultIndex);
					}
				}

				window.close();
			});

			dojo.query('a').on('focus', function(){
				var skipFirst = dojo.query('a[tabindex=-1]')[0];
				if(skipFirst) skipFirst.setAttribute('tabindex', '');
				dojo.query('.selected').removeClass('selected');
				dojo.query(this).closest('li').addClass('selected');
			});

			dojo.query('#bookmarkSearch').on('focus', function(){
				dojo.query('.selected').removeClass('selected');
				dojo.query('.first').addClass('selected');
			});

			if(searchEvt) searchEvt.remove();
			searchEvt = on(dojo.query('#bookmarkSearch'), 'focusout', function(){
				ga('send','event',"search", 'keydown',qu, cnt);
			});

			dojo.query('#bookmarkSearch')[0].focus();
		}
		
		updateResults(queryIndex.getLastQuery());
		dojo.query('#bookmarkSearch')[0].select();
	}
	function saveTags(bookmarkId){
		var currentTags = bookmarkTagMap.get(bookmarkId);
		var tagStr = dojo.query('#in_'+bookmarkId)[0].innerHTML.replace(/((&nbsp;)|(\,)|(\s))+$/i,"");
		var tags = tagStr.split(',');

		for(var i in currentTags){
			var currentTag = currentTags[i]; 
			bookmarkTagMap.remove(bookmarkId, currentTag);
			bookmarkIndex.remove(bookmarkId, getPieces(currentTag));
		}

		for(var i in tags){ 
			var tag = tags[i].replace(/((&nbsp;)|(\,)|(\s))+$/i,"").trim();
			if(tag != "" && tag != " "){
				bookmarkTagMap.add(bookmarkId, tag);
				bookmarkIndex.add(bookmarkId, getPieces(tag));
			}
		}

		bookmarkTagMap.save();
		bookmarkIndex.save();
	}
	function bookmarkItemHtml(template, bookmark, tags, tabindex, resultIndex){
		var tagString = tags.join(', ');
		var additionalClasses = [];
		if(tagString == "") additionalClasses.push('emptyTags');

		var context = new dojox.dtl.Context({
			id: bookmark.id || ""
			,displayTitle: bookmark.displayTitle || bookmark.title || bookmark.url
			,title:bookmark.title
			,url: bookmark.url || ""
			,tags: tagString
			,additionalClasses: additionalClasses.join(' ')
			,tabindex: tabindex || ""
			,resultIndex: resultIndex || -1
		});

		return template.render(context);
	}

	function bookmarkUpdateHtml(template, bookmark, tags){
		var context = new Context({
			id:bookmark.id
			,tags: tags.join(', ')
		});
		return template.render(context);
	}
});//END ON READY





var APP_ID = chrome.app.getDetails().id;
var TEMPLATE_PATH = 'templates/';

var BOOKMARK_ITEM_TEMPLATE_NAME = TEMPLATE_PATH + 'BookmarkItemTemplate.html';

var STORAGE_BOOKMARK_INDEX_NAME = APP_ID + '_bookmarkindex';
var STORAGE_QUERY_INDEX_NAME = APP_ID + '_queryindex';
var STORAGE_TAG_MAP_NAME = APP_ID + '_tagmap';
var BOOKMARK_MAP_NAME = APP_ID + '_bookmarkmap';


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');


ga('create', 'UA-48292626-1', {
  'cookieDomain': 'none'
});
ga('set', 'checkProtocolTask', function(){});
ga('send', 'pageview');



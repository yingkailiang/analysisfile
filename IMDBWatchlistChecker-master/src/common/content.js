// ==UserScript==
// @name IMDBWatchlistChecker
// @include http://www.imdb.com/name/nm*
// @include https://www.imdb.com/name/nm*
// @require jquery-2.0.3.min.js
// ==/UserScript==

/** Dispatch request to process in the background. */
kango.dispatchMessage("PersonRequested");

/** Add the main content message listener. */
kango.addMessageListener("CheckMovies", function(event){
 /** Validating response parameters. */
 if (event.data && event.data.IDs && (event.data.IDs.length > 0)){
  /** Select elements as reference for movies. */
  var tags = $(".year_column");
  tags.each(function(){
   var tag = $(this).next(":first");
   var attr = $("a", tag).attr("href");
   var id = attr.substring(9).replace("/", "");
   var index = id.indexOf("?");
   id = (index >= 0) ? id.substring(0, index) : id;
   /** Check if value of attribute "href" of selected tag is in the list of IDs sent by the main background script. */
   if ((attr.indexOf("/title/tt") == 0) && (event.data.IDs.indexOf(id) > -1)){
    /** Insert image located in the source sent by the main background script in the proper position. */
    $(event.data.imageString).insertBefore($(tag));
   };
  });
 };
});

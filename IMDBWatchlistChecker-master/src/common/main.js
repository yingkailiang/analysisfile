/**
 * @file Main background script
 * @author Ricardo Sotolongo
 * @version 0.2
 */

/**
 * @namespace
 * @description Represents global constants.
 */
var consts = {
 /**
  * @constant
  * @type {string}
  * @default
  * @description Represents the IMDB wtachlist base URL.
  */
 url: "http://www.imdb.com/watchlist",
 /**
  * @constant
  * @type {string}
  * @default
  * @description Represents the IMDB wtachlist URL base query string.
  */
 query: "?start=",
 /**
  * @constant
  * @type {number}
  * @default
  * @description Represents the increment between movie pages in the IMDB watchlist.
  */
 increment: 100,
 /**
  * @constant
  * @type {array}
  * @default
  * @description Represents the valid browser names.
  */
 browsers: ["Chrome", "Firefox"]
};

/**
 * @namespace
 * @description Represents global helpers.
 */
var helpers = {
 /**
  * @method
  * @param {string} content - String representation of the IMDB watchlist page DOM.
  * @returns {array} Array of movies IDs cotained inside IMDB watchlist page DOM.
  * @description Get movies IDs.
  */
 getIDs: function(content){
  var result;
  /** Validating input parameters. */
  if (((content instanceof String) || (typeof content == "string")) && content){
   /** Creating the context (DOM) based on content string representation. */
   var dom = $(content);
   /** According to IMDB watchlist internal structure "list_item" class is used in each movie included in the page. */
   var tags = $("div", dom).filter(".list_item");
   tags.each(function(){
    /** Only interested in the "href" attribute of link elements. */
    var attr = $("a", this).attr("href");
    if (attr.indexOf("/title/tt") == 0){
     /** Init result array only in case it is not created before. */
     if (!result){
      result = new Array();
     };
     /** Add the founded movie ID to results. */
     result.push(attr.substring(9, attr.length - 1));
    };
   });
  };
  return result;
 },
 /**
  * @method
  * @param {array} browsers - Array of browser names to identify.
  * @returns {string} Browser name.
  * @example
  * //returns "Chrome" (in case the current browser is Google Chrome)
  * helpers.browserName(["Chrome", "Firefox"]);
  * @description Find current browser name.
  */
 browserName: function(browsers){
  var result = (navigator && navigator.userAgent) ? navigator.userAgent : undefined;
  /** Validating input parameters as well as existence of browser's userAgent. */
  if (result && browsers){
   /** Find the index of current browser name in available browser list. */
   var index = 0;
   while ((index < browsers.length) && (navigator.userAgent.indexOf(browsers[index]) == -1)){
    index++;
   };
   result = (index < browsers.length) ? browsers[index] : result;
  };
  return result;
 },
 /**
  * @method
  * @returns {string} Image source URI.
  * @example
  * //returns "resource://kango-7a4190e6-1040-4e4c-a4be-47249e455bcc/images/checkmark.png" (in case the current browser is Mozilla Firefox)
  * helpers.getImageSource();
  * @description Find image URI inside extension resources depending of current browser.
  */
 getImageSource: function(){
  var result = "";
  var browser = helpers.browserName(consts.browsers);
  switch (browser)
  {
   case consts.browsers[0]:
    result = "chrome.extension.getURL('images/checkmark.png')";
    break;
   case consts.browsers[1]:
    result = "resource://kango-7a4190e6-1040-4e4c-a4be-47249e455bcc/images/checkmark.png";
    break;
   default:
    result = "http://raw.github.com/rsotolongo/IMDBWatchlistChecker/master/src/common/images/checkmark.png";
  };
  return result;
 },
 /**
  * @method
  * @param {string} source - String representation of an URI.
  * @returns {boolean} true if the resource specified by source parameter is static or, otherwise it returns false.
  * @description Finds if the resource specified by source parameter is static or not (dynamic).
  * @example
  * //returns true
  * helpers.staticResource("resource://IMDBnWatchlistnChecker_kango/images/checkmark.png");
  * @example
  * //returns true
  * helpers.staticResource("chrome.extension.getURL('images/checkmark.png')");
  */
 staticResource: function(source){
  return source ? (source.indexOf("://") > 0) : false;
 },
 /**
  * @method
  * @param {string} source - String representation of an URI.
  * @returns {string} String representation of an HTML image element.
  * @description Creates an HTML image element with values on attribute "alt", "src", "style", and "title".
  * @example
  * //returns "&lt;img alt='*' src='resource://IMDBnWatchlistnChecker_kango/images/checkmark.png' style='color: red; height: 16px; width: 16px;' title='In Watchlist'/&gt;"
  * helpers.getImageString("resource://IMDBnWatchlistnChecker_kango/images/checkmark.png");
  */
 getImageString: function(source){
  var imageString = "";
  source = source ? source : helpers.getImageSource();
  var imageStyle = "color: red; height: 16px; width: 16px;";
  var imageSource = helpers.staticResource(source) ? source : eval(source);
  var imageTitle = kango.i18n.getMessage("In Watchlist");
  /** Craeting HTML element based on tag name and attribute values. */
  imageString = "<img alt='*' src='" + imageSource + "' style='" + imageStyle + "' title='" + imageTitle + "'/>";
  return imageString;
 },
 /**
  * @method
  * @description Make a request (a page of movies belogings to user's IMDB watchlist).
  * @param {helpers~firstResponse|helpers~nextResponse} callback - The callback that handles the response.
  */
 makeRequest: function(url, callback, target){
  /**
   * @namespace
   * @property {string} url - Base URL to make requests.
   * @property {string} method - HTTP method to make requests.
   * @property {boolean} async - Asynchronous requests.
   * @property {string} contentType - Response content type.
   */
  var details = {
   url: url,
   method: "GET",
   async: true,
   contentType: "text"
  };
  kango.xhr.send(details, function(data){
   /**
    * @namespace
    * @property {number} code - Response code.
    * @property {string} message - Response message.
    * @property {number} cant - How many movies in total are included in user's IMDB watchlist.
    * @property {number} count - How many pages conforms user's IMDB watchlist.
    * @property {array} IDs - IDs of movies included in user's IMDB watchlist.
    * @property {string} imageString - String representation of HTML image element to be used in the client's content script.
    */
   var result = {
    code: 0,
    message: "",
    cant: 0,
    count: 0,
    IDs: new Array(),
    imageString: ""
   };
   /** Validating response. */
   if ((data.status == 200) && data.response){
    /** Creating the context (DOM) based on the response. */
    var dom = $(data.response);
    /** Find how many pages have the user's IMDB watchlist. */
    var tag = $("div", dom).filter(".desc:first");
    var attr = $(tag).attr("data-size");
    /** Creating results. */
    result.cant = parseInt(attr, 10);
    result.count = isNaN(result.cant) ? 1 : Math.ceil(result.cant / consts.increment);
    result.IDs = helpers.getIDs(data.response);
    result.imageString = helpers.getImageString();
    result.message = "OK!";
   } else {
    result.message = "ERROR!";
   };
   result.code = data.status;
   /** Call the callback responsable to send results to callee client. */
   callback(result, target);
  });
 },
 /**
  * @event helpers#dispatchMessage
  * @param {object} response - Response to be parsed and send it to client.
  * @param {object} target - Callee client (browser tab).
  * @description This event is called to send results to the main content script.
  */
 dispatchMessage: function(response, target){
  /** Validating input parameters. */
  if (target && response && response.IDs.length > 0){
   /** Dispatch results to client. */
   target.dispatchMessage("CheckMovies", response);
  };
 },
 /**
  * @callback helpers~nextResponse
  * @param {object} response - Response to be parsed and send it to client.
  * @param {object} target - Callee client (browser tab).
  * @fires helpers#dispatchMessage
  * @description This callback should be used to send results from second and following pages of IMDB watchlist.
  */
 nextResponse: function(response, target){
  helpers.dispatchMessage(response, target);
 },
 /**
  * @callback helpers~firstResponse
  * @param {object} response - Response to be parsed and send it to client.
  * @param {object} target - Callee client (browser tab).
  * @fires helpers#dispatchMessage
  * @description This callback should be used only to send results of first IMDB watchlist page.
  */
 firstResponse: function(response, target){
  /** Validating input parameters. */
  if (response){
   helpers.dispatchMessage(response, target);
   /** Analyzing following IMD watchlist pages. */
   for (var count = 1; count < response.count; count++){
    helpers.makeRequest(consts.url + consts.query + (count * consts.increment + 1), helpers.nextResponse, target);
   };
  };
 }
};

/**
  * @constructor
  * @description Represents the extension class.
  */
IMDBWatchlistChecker = function(){
 /** Add the main background message listener. */
 kango.addMessageListener("PersonRequested", function(event){
  /** Request first IMDB watchlist page. */
  helpers.makeRequest(consts.url, helpers.firstResponse, event.target);
 });
};

/**
 * @description Represents the instance of the extension. See {@link IMDBWatchlistChecker}.
 */
var extension = new IMDBWatchlistChecker();

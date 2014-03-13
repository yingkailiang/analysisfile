/*global jQuery:false*/
'use strict';


/*
 * Make an AJAX call to the server to get the refreshed item info
 */
(function (exports) {

  //'http://localhost:3000/api/scrape'
  var server = 'http://cheaperplz.com/api/scrape';

  exports.remoteScrape = function (url, cb) {
    jQuery.post(server, {
      url: url
    }, cb);
  };

}(window));

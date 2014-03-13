/***********************************************************************
 * 
 *     This file is part of gRecipes.
 *
 *     gRecipes is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     gRecipes is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 * 
 *     You should have received a copy of the GNU General Public License
 *     along with gRecipes.  If not, see <http://www.gnu.org/licenses/>.
 * 
 **********************************************************************/

(function(window, chrome, undefined) {

var DOCLIST_SCOPE = 'https://docs.google.com/feeds',
    DOCLIST_FEED = DOCLIST_SCOPE + '/default/private/full/',
    oauth = ChromeExOAuth.initBackgroundPage({
      'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
      'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
      'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
      'consumer_key': 'anonymous',
      'consumer_secret': 'anonymous',
      'scope': DOCLIST_SCOPE,
      'app_name': 'gRecipe',
      'callback_page': 'lib/chrome_ex_oauth.html'
    });

var gdocs = {
  
  /**
   * Creates a new document in Google Docs.
   */
  createDoc: function(title, content, callback) {
    oauth.sendSignedRequest(DOCLIST_FEED, callback, {
      'method': 'POST',
      'headers': {
        'GData-Version': '3.0',
        'Content-Type': 'multipart/related; boundary=END_OF_PART',
      },
      'parameters': {
        'alt': 'json'
      },
      'body': constructContentBody_(title, 'document', content, 'text/html', false)
    });
  },
  
  authorize: function() {
    var d = $.Deferred();
    oauth.authorize(d.resolve);
    return d.promise();
  },
  
  unauthorize: function() {
    chrome.tabs.create( {
      'url': 'https://www.google.com/accounts/b/0/RevokeAuthSubAccess?authsub_tokens=' + encodeURIComponent(oauth.getToken()) + '&authsub_target_label=oamfgnlpfakglicippbmceflfnicfhon&authsub_scope_label=Google+Docs'
    });
    oauth.clearTokens();
  },
  
  hasAuth: function() {
    return oauth.hasToken()
  },
};


/**
 * A helper for constructing the raw Atom xml send in the body of an HTTP post.
 * @param {XMLHttpRequest} xhr The xhr request that failed.
 * @param {string} docTitle A title for the document.
 * @param {string} docType The type of document to create.
 *     (eg. 'document', 'spreadsheet', etc.)
 * @param {boolean?} opt_starred Whether the document should be starred.
 * @return {string} The Atom xml as a string.
 */
function constructAtomXml_(docTitle, docType, opt_starred) {
  var starred = opt_starred || null;

  var starCat = ['<category scheme="http://schemas.google.com/g/2005/labels" ',
                 'term="http://schemas.google.com/g/2005/labels#starred" ',
                 'label="starred"/>'].join('');

  var atom = ["<?xml version='1.0' encoding='UTF-8'?>", 
              '<entry xmlns="http://www.w3.org/2005/Atom">',
              '<category scheme="http://schemas.google.com/g/2005#kind"', 
              ' term="http://schemas.google.com/docs/2007#', docType, '"/>',
              starred ? starCat : '',
              '<title>', htmlspecialchars_(docTitle), '</title>',
              '</entry>'].join('');
  return atom;
};

/**
 * A helper for constructing the body of a mime-mutlipart HTTP request.
 * @param {string} title A title for the new document.
 * @param {string} docType The type of document to create.
 *     (eg. 'document', 'spreadsheet', etc.)
 * @param {string} body The body of the HTTP request.
 * @param {string} contentType The Content-Type of the (non-Atom) portion of the
 *     http body.
 * @param {boolean?} opt_starred Whether the document should be starred.
 * @return {string} The Atom xml as a string.
 */
function constructContentBody_(title, docType, body, contentType, opt_starred) {
  var body = ['--END_OF_PART\r\n',
              'Content-Type: application/atom+xml;\r\n\r\n',
              constructAtomXml_(title, docType, opt_starred), '\r\n',
              '--END_OF_PART\r\n',
              'Content-Type: ', contentType, '\r\n\r\n',
              body, '\r\n',
              '--END_OF_PART--\r\n'].join('');
  return body;
};

function htmlspecialchars_(string) {
  return string.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/'/g, '&#039;').replace(/"/g, '&quot;');
};

window.gdocs = gdocs;

})(window, chrome);

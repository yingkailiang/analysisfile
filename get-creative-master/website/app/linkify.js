// Adapated from Jann Horn's Linkify
// https://github.com/thejh/node-linkify/blob/master/LICENSE
// Regex from: http://daringfireball.net/2010/07/improved_regex_for_matching_urls
var MAGIC_REGEX = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

function replaceURLs(text, fn) {
  if (typeof fn === 'string') {
    if (fn === 'html')
      fn = function(match, url) {
        url = url.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        return '<a class="js_external_link" href="'+url+'">'+match+'</a>'
      }
    else
      throw new Error('unknown replacer type')
  }
  return text.replace(MAGIC_REGEX, function(match) {
    var matchURL = match
    if (!/^[a-zA-Z]{1,6}:/.test(matchURL)) matchURL = 'http://' + matchURL
    return fn(match, matchURL)
  })
}

module.exports = replaceURLs

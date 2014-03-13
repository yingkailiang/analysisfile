/**
 * @author christophe
 */
exports.parse = function(pattern){
	if (pattern == "<all_urls>") {
		return /^(http|https|ftp|file):\/\/.+/;
	}
	if (!/^(http|https|ftp|file|resource|\*):\/\/([^\/]*)\/(.*)/.test(pattern)) {
		throw new Error("Malformed pattern :" + pattern);
	}
	var scheme = RegExp.$1, host = RegExp.$2, path = RegExp.$3;
	if (pattern.indexOf('*') == -1) {
		return pattern;
	}
	var firstWildcardPosition = host.indexOf("*");
	var lastWildcardPosition = host.lastIndexOf("*");
	if (firstWildcardPosition != lastWildcardPosition) 
		throw new Error("There can be at most one '*' character in a wildcard.");
	if (firstWildcardPosition > 0) {
		throw new Error("Bad widlcard position");
	}
	if (firstWildcardPosition == 0 && host.length > 1 && host[1] != '.') {
		throw new Error("Only *. accepted but  got: " + pattern);
	}
	//console.log(pattern,"^" + scheme.replace('*', '.*') + '://' + host.replace(/\./g, '\\.').replace('*', '.*') + "/?" + path.replace(/\./g, '\\.').replace('*', '.*') + "$");
	return new RegExp("^" + scheme.replace('*', '.*') + '://' + host.replace(/\./g, '\\.').replace('*', '.*') + "/?" + path.replace(/\./g, '\\.').replace('*', '.*') + "$");
	
}

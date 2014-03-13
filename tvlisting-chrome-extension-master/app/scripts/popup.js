'use strict'

var lineupUrl = localStorage.getItem('lineup')

if (lineupUrl) {
	var $listing = jQuery('#listing'), $rows
	var zipCode  = parseURL(lineupUrl).params.zipCode

	jQuery('span').text(zipCode)

	var cached = restoreCache(zipCode)

	if (cached) {
		setListing(cached)
	} else {
		jQuery.get(lineupUrl).done(onListingData)
	}

	jQuery('input').keyup(onSearch).on('search', onSearch)
} else {
	chrome.tabs.create({ url : 'options.html' })
}

function onListingData(data) {
	var template = document.createElement('template')
	template.innerHTML = data
	var clonedNode = template.content.querySelector('#channelLineupList tbody').cloneNode(true)

	setListing(clonedNode)
	setTimeout(function(){
		cache(zipCode, clonedNode)
	}, 50)
}

function setListing(nodes) {
	$rows = $listing.append(nodes).find('tbody tr')
}

function restoreCache(zipCode) {
	if (localStorage.getItem('zip') == zipCode) {
		return localStorage.getItem('cache')
	}
	return null
}

function cache(zipCode, nodes) {
	localStorage.setItem('cache', nodes.outerHTML)
	localStorage.setItem('zip', zipCode)
}

function onSearch() {
	var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase()
	console.log("keyup "+val)

	$rows.show().filter(function() {
		var text = $(this).text().replace(/\s+/g, ' ').toLowerCase()
		return !~text.indexOf(val)
	}).hide()
}

function deparam(search) {
	var ret = {},
		seg = search.replace(/^\?/,'').split('&'),
		len = seg.length, i = 0, s;
	for (;i<len;i++) {
		if (!seg[i]) { continue; }
		s = seg[i].split('=');
		ret[s[0]] = s[1];
	}
	return ret;
}

function parseURL(url) {
	var a =  document.createElement('a');
	a.href = url;
	return {
		source: url,
		protocol: a.protocol.replace(':',''),
		host: a.hostname,
		port: a.port,
		query: a.search,
		params: deparam(a.search),
		hash: a.hash.replace('#',''),
		path: a.pathname.replace(/^([^\/])/,'/$1'),
		file_path: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
		relative_path: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
		segments: a.pathname.replace(/^\//,'').split('/')
	};
}



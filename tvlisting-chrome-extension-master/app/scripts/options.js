'use strict';

var $zipCode = $('#zipCode').val(localStorage.getItem('zip'))
var BASE     = 'http://tvlistings.timewarnercable.com'
var lastZip  = ''

$(".alert").alert()
$('.error, #clearCache').hide()

var $searchBtn = $('#searchBtn').click(function(){
	var zipVal = $zipCode.val()
	if ( zipVal ) {
		var searchBtn = $(this).button('loading')
		$.get(BASE +'/findTvListings/?zipCode='+ zipVal).done(function(data){
			lastZip = zipVal
			var lineup = extractChannelListUrl(parseLineups(data))
			if (lineup) {
				storeLineup(lineup)
			}
			updateCacheBtn()
		}).fail(onFailure)
	} else {
		$zipCode.focus()
	}
})

function storeLineup(lineup) {
	localStorage.clear()
	localStorage.setItem('lineup', lineup)
	$searchBtn.button('complete').attr('disable', true)
}

function noLineupFound() {
	onFailure('No TWC channel lineups for this area.')
	$searchBtn.button('reset')
}

var $clearCacheBtn = $('#clearCache')

updateCacheBtn()

$clearCacheBtn.click(function(){
	localStorage.removeItem('cache')
	updateCacheBtn()
})

window.addEventListener('message', function(event) {
	if (event.data.successful) {
		var lineup = [BASE,'/findTvListings/viewChannelLineUp/?headendId=', event.data.headEndId, '&zipCode=', lastZip].join('')
		storeLineup(lineup)
	} else {
		noLineupFound()
	}
});

function updateCacheBtn() {
	if (localStorage.getItem('cache')) {
		$clearCacheBtn.show()
	} else {
		$clearCacheBtn.hide()
	}
}

function parseLineups(data) {
	var template = document.createElement('template')
	template.innerHTML = data
	return template.content
}

function extractChannelListUrl(templateContent) {
	var elements = templateContent.querySelectorAll('a.arrowBtn:first-child')
	if (elements.length) {
		return BASE + elements[0].getAttribute('href')
	}
	parseJavaScript(templateContent.querySelectorAll('script:not([src])')[0].innerHTML)
	return ''
}

function parseJavaScript(source) {
	console.log(source)

	 var iframe = document.getElementById('theFrame')
	 var message = {
	 	source: source
	 }
	 iframe.contentWindow.postMessage(message, '*')
}

function onFailure (data) {
	console.error(data)
	$('.error').find('.msg').text(data).end().fadeIn()
}

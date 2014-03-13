// copyright - no one
// use as freely as you would like
// Author: Dhruv Goel

/* Initialization function which is executed when the DOM is loaded
   This is used to bind actions with the DOM elements
*/
var initialize = function() {
	$('#getQuoteButton').click(populateQuotes);
};

// function to update the labels next to stocks
var populateQuotes = function() {
	$('#stockList span').each(
		function(){
			var $span=$(this);
			var stockName = $span.children('input').val();
			var label = $span.children('label');
			var googleQuote = getGoogleFinanceQuote(stockName, label);
		}
	)
};

// function to get the quote for a particular stock via Google
var getGoogleFinanceQuote = function(stockName, label) {
	var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20WHERE%20symbol%3D'" + stockName + "'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
	$.getJSON(url, function(data) {
	    label.text(data.query.results.quote.LastTradePriceOnly);
	});
};


// Bind actions with elements when HTML is done loading
document.addEventListener('DOMContentLoaded', function () {
  	initialize();
});
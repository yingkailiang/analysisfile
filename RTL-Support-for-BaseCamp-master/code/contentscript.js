var port = null;

function setCssForLTR()
{
	$('#comments, #message_header, #OriginalPost, .text_area, .message, .check_box_commentable, #preview_body, #PreviewBody, .message_title').css({
		"direction": "ltr",
		"text-align": "left" });
	$('div.formatted_text_body li, div.formatted_text_body ul, #preview_body li, #preview_body ul, #PreviewBody li, #PreviewBody ul').css( { 
	"margin-left": "15px", 
	"padding-left": "3px", 
	"padding-right": "0px",
	"margin-right": "0" });
}

function setCssForRTL()
{
	$('#comments, #message_header, #OriginalPost, .text_area, .message, .check_box_commentable, #preview_body, #PreviewBody, .message_title').css({
		"direction": "rtl",
		"text-align": "right" });
	$('div.formatted_text_body li, div.formatted_text_body ul, #preview_body li, #preview_body ul, #post_body_preview li, #post_body_preview ul').css( { 
		"margin-right": "15px", 
		"padding-right": "3px", 
		"padding-left": "0px",
		"margin-left": "0" });
}
function toggleCssOfDirectioning(shouldBeLTR)
{
	console.log("Setting direction. Should be left-to-right? "+shouldBeLTR)
	if (shouldBeLTR == "yes") setCssForLTR();
	else setCssForRTL();
}


function askForDirection()
{
	console.log("Asking for direction in 1 and 3 second");
	setTimeout('port.postMessage("what direction should I use?");',1000);
	setTimeout('port.postMessage("what direction should I use?");',3000);
}

function bindButtonClicks()
{
	$("input[type=button]").on("click", askForDirection);
	$("input[type=submit]").on("click", askForDirection);
}

function initPort()
{
	port = chrome.extension.connect();
	//port.postMessage();
	port.onMessage.addListener(function(msg) {
	  toggleCssOfDirectioning(msg.direction);
	  });
 }
 
function init()
{
	initPort();
	bindButtonClicks(); //whenever a button is clicked, re apply the style
}

init();

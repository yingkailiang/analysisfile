// ==UserScript==
// @name ChristmasTree
// @include http://*/*
// @include https://*/*
// @include ftp://*/*
// @include file:///*
// @require jquery-1.8.2.min.js
// @require codemirror.js
// @require matchbrackets.js
// @require continuecomment.js
// @require javascript.js
// ==/UserScript==
var $ = window.$.noConflict(true); // Required for Opera and IE

var cur_request;
var riak_headers;
var cur_links;
var editor;

function extractData(rawText) {
	var tokens, text = rawText.trim();

	function test(text) {
		return ((text.charAt(0) == "[" && text.charAt(text.length - 1) == "]") || (text.charAt(0) == "{" && text.charAt(text.length - 1) == "}"));
	}

	if (test(text)){
		return {
			text : rawText,
			offset : 0
		};
	}

	tokens = text.match(/^([^\s\(]*)\s*\(([\s\S]*)\)\s*;?$/);
	if(tokens && tokens[1] && tokens[2]) {
		if(test(tokens[2].trim()))
			return {
				fnName : tokens[1],
				text : tokens[2],
				offset : rawText.indexOf(tokens[2])
			};
	}
}

var refreshJSON = function(){
	var settings = {
		success: updateEditor,
		url: document.URL,
		type: 'GET'
	};

    cur_request = $.ajax(settings);
};

function updateEditor(err, data, res){
	if(res.status == 200){
		var headers = cur_request.getAllResponseHeaders();

		riak_headers = {};

		headers.toString().split('\n').forEach(function(h){
			var keyVal = h.split(':');

			if(keyVal[0].toLowerCase().indexOf('x-riak') === 0){
				riak_headers[keyVal[0].toLowerCase()] = keyVal[1];
			}
		});

		cur_links = res.getResponseHeader('Link');

		var parsed = JSON.parse(res.responseText);
		editor.setValue(JSON.stringify(parsed, null, 4));

		$("#errors").html('Last save ' + new Date());
	}
	else if(res.status == 304){
		$("#errors").html('Not modified');
	}
}

function formatJSON(){
	var curJSON = editor.getValue();

	try{
		var parsed = JSON.parse(curJSON);
		editor.setValue(JSON.stringify(parsed, null, 4));
	}
	catch(err){
		$("#errors").html('JSON parse error');
	}
}

function postDATA(){
	var curJSON = editor.getValue();
	var stringifyedData;

	try{
		parsedJSON = JSON.parse(curJSON);
		stringifyedData = JSON.stringify(parsedJSON);
	}
	catch(err){
		$("#errors").html('Error while parse JSON');
		return;
	}

	var settings = {
		contentType: "application/json",
		success: refreshJSON,
		url: document.URL,
		data: stringifyedData,
		type: 'PUT',
		headers: {
			'Link': cur_links
		}
	};

	if(riak_headers){
		for(var h in riak_headers){
			settings.headers[h] = riak_headers[h];
		}
	}

	$.ajax(settings);
}

function getOptions(callback){
	kango.invokeAsync('kango.storage.getItem', 'options', function(options){
		if(!options){
			options = {
				isRiakEnabled: true,
				riakPath: '/riak/'
			};
		}

		callback(options);
	});
}

function showEditor(isRiak, dataText){
	var html = '<textarea class="editor" id="editor">' + dataText + '</textarea><br/>';

	if(isRiak === true){
		html += '<button type="submit" id="update_json_data">Save</button>' +
			'<button id="refresh_btn">Get data from RIAK</button>' +
			'<button id="format_json">Format</button>';
	}

	html += '<div id="errors"></div>';

	$('body').html(html);

	$('#update_json_data').click(postDATA);
	$('#refresh_btn').click(refreshJSON);
	$('#format_json').click(formatJSON);

	editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		lineNumbers: true
	});

	if(isRiak === true){
		editor.setSize(null, '90%');
		refreshJSON();
	}
	else {
		editor.setSize(null, '97%');
	}
}

function showFormated(isRiak, dataText){
	var html = '<pre id="formatedJson">' + dataText + '</pre>';
	html += '<div id="menu"><a id="showEditor" href="#">Editor</a>';

	$('body').html(html);

	$('#menu').css({
		position: 'fixed',
		top: '20px',
		right: '20px'
	});

	$('#showEditor').click(function(){
		showEditor(isRiak, dataText);
	});
}

function load(options) {
	var child, data;

	if(document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" ||
			document.body.children.length === 0)){

		child = document.body.children.length ? document.body.childNodes[0] : document.body;
		data = extractData(child.innerText);

		var isNotFound = child.innerText.indexOf('not found') === 0;
		var isRiak = document.location.pathname.indexOf(options.riakPath) === 0;

		if(data || isNotFound){
			var dataParsed;
			var dataText;

			if(!isNotFound){
				dataParsed = JSON.parse(data.text);
				dataText = JSON.stringify(dataParsed, null, 4);
			}
			else {
				dataText = {notFount: true};
				dataText = JSON.stringify(dataText, null, 4);
			}

			if(options.isRiakEnabled === true && isRiak === true){
				showEditor(isRiak, dataText);
			}
			else {
				showFormated(isRiak, dataText);
			}
		}
	}
}

setTimeout(function(){
	kango.invokeAsync('kango.io.getExtensionFileContents', 'codemirror.css', function(content) {
		$("<style />").html(content).appendTo("head");
		getOptions(function(options){
			load(options);
		});
	});
}, 100);

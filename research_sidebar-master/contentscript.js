//listens for messages
window.addEventListener("message", function(event){
	if(event.data.action == "send_URL")
		send_URL();
	if(event.data.action == "load_URL")
		window.location.href = event.data.URL;
});

//listens for "button_pushed" message from listener in background.js
chrome.runtime.onMessage.addListener(function(msg, sender) {
	if(msg == "button_pushed"){
		toggle_state();
	}
});

//variable to store tab.id of current tab
var tabId;

var iframeId = 'research_sidebar';
var WIDTH = '300px';
var sidebarFILE = 'sidebar/sidebar.html';

//set sidebar to current state as soon as page loads
window.onload = function(){
	//requests tab id from background page
	chrome.runtime.sendMessage("request_id", function(response) {
  		tabId = response.id;
  		console.log("tabId: "+response.id);
  		set_sidebar();
	});
	
}

//resizes html when window is resized
window.onresize = function() {
	var html = get_html();
	chrome.storage.local.get(function(data){
		if(data.researchList.indexOf(tabId) != -1) {
			html.style.width = html.clientWidth - parseFloat(WIDTH) + 'px';
		}
	});
}

function send_URL(){
	var sidebar_window = document.getElementById(iframeId).contentWindow;
	sidebar_window.postMessage({URL: window.location.href}, "*");
	console.log("SENDING URL");
}

//toggles state of sidebar between ACTIVE and INACTIVE
function toggle_state() {
	chrome.storage.local.get(function(data){
		var list = data.researchList;
		if(list.indexOf(tabId) == -1) {
			list.push(tabId);
			console.log("Sidebar is ACTIVE");
		}else{
			list.splice(list.indexOf(tabId), 1);
			console.log("Sidebar is INACTIVE");
		}
		chrome.storage.local.set({'researchList': list});
		console.log(list);
		set_sidebar();
	});
}

//insert or remove sidebar depending on if sidebar is ACTIVE or NOT ACTIVE
function set_sidebar() {
	chrome.storage.local.get(function(data){

		if(data.researchList.indexOf(tabId) != -1) {
			console.log("LOADING SIDEBAR");
			//code to insert sidebar into webpage
			load_sidebar();
		}else{
			console.log("REMOVING SIDEBAR");
			//code to remove sidebar from webpage
			remove_sidebar();
			
		}
	});
}

//helper funcion to get html DOM object
function get_html() {
	var html;
	if(document.documentElement){
		html = document.documentElement;
	}else if(document.getElementsByTagName('html') && document.getElementsByTagName('html')[0]) {
		html = document.getElementsByTagName('html')[0];
	}else{
		throw 'no html tag retrieved!';
	}
	return html;
}

function load_sidebar() {
	var html = get_html();
	
	if(getComputedStyle(html).position === 'static') {
		html.style.position = 'relative';
	}
	
	html.style.width = html.clientWidth - parseFloat(WIDTH) + 'px';
	
	var div = document.createElement("div");
	div.innerHTML = '<iframe id="'+iframeId+'" src="'+chrome.extension.getURL(sidebarFILE)+'" frameborder="0" allowtransparency="false" '+'style="position: fixed; overflow:hidden; width: '+WIDTH+';border:none;z-index: 2147483647; height: 100%; top: 0px; right: 0px; bottom: 0px; background-color: black;"></iframe>';
	html.appendChild(div.firstChild);
}

function remove_sidebar() {
	var html = get_html();
	
	html.style.width = 'auto';
	
	if(document.getElementById(iframeId))
		html.removeChild(document.getElementById(iframeId));
}
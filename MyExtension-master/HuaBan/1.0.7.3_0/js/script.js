var global="__huaban";var script=document.createElement("script");script.setAttribute("charset","utf-8");script.innerText="     (function(w, d, g, J) {         var e = J.stringify || J.encode;         d[g] = d[g] || {};         d[g]['showValidImages'] = d[g]['showValidImages'] || function() {             w.postMessage(e({'msg': {'g': g, 'm':'s'}}), location.href);         }     })(window, document, '__huaban', JSON); ".replace(/\s{2,}/g," ");document.body.appendChild(script);window.addEventListener("message",function(a){if(window.top!=window.self){return}var c;try{c=JSON.parse(a.data)}catch(b){}if(c&&c.msg&&c.msg.g&&c.msg.m&&c.msg.m=="s"){if(document[c.msg.g]&&typeof document[c.msg.g]["showValidImages"]=="function"){document[c.msg.g]["showValidImages"]()}}});var target=null;document.body.addEventListener("contextmenu",function(a){target=a.target});chrome.extension.onRequest.addListener(function(c,b,a){if(c.msg){switch(c.msg){case"showValidImages":if(window.top==window.self){document[global]["showValidImages"]()}break;case"pinImage":c.data.img=target;if(target.width>=16&&target.height>=16){document[global]["pinImage"](c.data)}else{if(window.top==window.self){document[global]["showValidImages"]()}}break;default:break}}});
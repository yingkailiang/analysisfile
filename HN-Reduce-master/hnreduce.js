// Removal function called by clicking on [remove]
function remove(id, href) { 
    _remove(href);

    // Push info to main extension to save in localStorage,
    // so we can show it in the options later on
    chrome.extension.sendRequest({remove: href}, function(response) {
        console.log(response.farewell);
    });
}

// Remove from DOM
function _remove(href) {
    rows1 = document.getElementsByTagName("tr");
    tbody = rows1[3].getElementsByTagName("tbody")[0];
    rows = rows1[3].getElementsByTagName("tr");

    var len = rows.length;
    for (i=0; i<len; i++) {
        if (i%3 == 0) {
            cols = rows[i].getElementsByTagName("td");
            if (cols.length > 2) {
                td_title = cols[2];                
                link = td_title.getElementsByTagName("a")[0];
                if (link.href == href) {
                    // found. remove now.
                    i1 = rows[i];
                    i2 = rows[i+1];
                    i3 = rows[i+2];
                    tbody.removeChild(i1);        
                    tbody.removeChild(i2);        
                    tbody.removeChild(i3);
                    return ;
                }
            }                
        }        
    }            
}

// Main table parser. Traverses through DOM and removes row or adds [remove]    
function reduce() {
    var port = chrome.extension.connect({name: "isremoved"});
    port.onMessage.addListener(function(msg) {
        //console.log("is removed: " + msg.removed);
        if (msg.removed) {
            _remove(msg.removed);   
        }
    });
        
    // Get the tr from the main container which has the actual item table inside
    rows1 = document.getElementsByTagName("tr");
    container = rows1[3]; // <tr> with the table with all news items
    
    // Get all the item tr's
    rows = container.getElementsByTagName("tr");    
    // rows[0] ... first <tr> with item number, votearrow, title, url
    // rows[1] ... first <tr> with metainfo
    // rows[2] ... first <tr> with blank line

    var len = rows.length;
    for (i=0; i<len; i++) {
        if (i%3 == 0) {
            // Row with item number, title, etc. Check title
            cols = rows[i].getElementsByTagName("td");
            if (cols.length > 2) {                
                td_title = cols[2];
                td_title.style.width = "680px";
                link = td_title.getElementsByTagName("a")[0];
                // console.log(link[0].href);
                
                // Add remove column
                x = document.createElement('td');
                x.innerHTML = " <small style='color:lightgray; cursor:pointer;' onmouseover='this.parentNode.parentNode.style.background=\"#fbfbf9\"' onmouseout='this.parentNode.parentNode.style.background=\"\"'>[remove]</small>";
                x.reduce_id = i;
                x.reduce_href = link.href; 
                x.addEventListener("click", function(e) {
                    remove(this.reduce_id, this.reduce_href);
                }, false);
                rows[i].appendChild(x);

                // Ask the main extension if this url is removed
                port.postMessage({href: link.href});                
            }
        }
    }
}

reduce();
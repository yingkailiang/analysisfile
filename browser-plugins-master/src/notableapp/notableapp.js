/**
 * @author chaitanya
 */

function Capture(db) {
    var self = this;
    this.view = function (evt) {
        var viewTabUrl = chrome.extension.getURL("capture.html");
        var imageid = evt.srcElement.parentNode.getAttribute("screenshot");
        notableapp.dbhandle.transaction(function(tx) {
            tx.executeSql("SELECT id, title, url, image FROM NotableApp WHERE id = ?", [imageid], function(tx, result) {
                result = result.rows.item(0);
                chrome.tabs.create({url: viewTabUrl, selected: true}, function(tab) {
                    var views = chrome.extension.getViews();
                    for (var i = 0; i < views.length; i++) {
                       var view = views[i];
                       if (view.location.href == viewTabUrl && !view.imageAlreadySet) {
                          view.setScreenshotUrl(result["image"]);
                          view.imageAlreadySet = true;
                          break;
                       }
                    }
                });
            }, function(tx, error){
                console.log('Failed to retrieve notes from database - ' + error.message);
                return;
            });
        });
    };
    this.log = function() {
//        console.log("object log: "+ self.title +", "+ self.url);
    };
    this.save = function() {
        var cap = this;
//        console.log("object saved: "+ cap.title +", "+ cap.url +", "+ cap.image);
        notableapp.dbhandle.transaction(function(tx){
            tx.executeSql("INSERT INTO NotableApp (title, url, image) VALUES (?, ?, ?)", [cap.title, cap.url, cap.image], function(tx, result) {
        notableapp.updateDisplay("added", null, null);
            });
        });
    };
    this.remove = function(evt) {
        var imageid = evt.srcElement.parentNode.parentNode.getAttribute("screenshot");
//        console.log("remove has been clicked " + imageid);
        notableapp.dbhandle.transaction(function(tx) {
            tx.executeSql("DELETE FROM NotableApp WHERE id = ?", [imageid], function(tx, result) { 
                notableapp.updateDisplay("remove", evt, imageid);
            });
        });
    };
    this.add = function(evt) {
        console.log("uploading the capture image .. ");
        var imageid = evt.srcElement.parentNode.parentNode.getAttribute("screenshot");
        var boundaryString = '----WebKitFormBoundaryIyMogSMYIcqEAloZ';
        var boundary = '--' + boundaryString;

        notableapp.dbhandle.transaction(function(tx) {
            tx.executeSql("SELECT id, title, url, image FROM NotableApp WHERE id = ?", [imageid], function(tx, result) {
                result = result.rows.item(0);
                console.log("sending image : " + imageid + ", " + result["image"]);
                
                var reqBody = '\r\n'
                    + boundary
                    + '\r\n'
                    + 'Content-Disposition: form-data; name="capture"; filename="capture.png"' + '\r\n'
                    + 'Content-Type: image/jpg' + '\r\n\r\n'
                    + result["image"]
                    + '\r\n\r\n'
                    + boundary 
                    + '\r\n';
                    
                console.log('Content-Length : '+ reqBody.length);
                var req = new XMLHttpRequest();
                req.open('POST', 'https://www.notableapp.com/posts/upload/', true);
                req.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundaryString);
//                req.setRequestHeader('Content-Length', reqBody.length);
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        console.log("responseText: " + req.responseText + "...");
                    }
                };
                req.onerror = function (error) {
                    console.log("error occured while posting the image : " + error);
                };
                req.send(reqBody);
            }, function(tx, error) {
                console.log('Failed to post the capture to notableapp - ' + error.message);
                return;
            });
        });
        
        console.log('capture sent to server');
    };
    return this;
}

Capture.prototype = {
    get id() {
        if (!("_id" in this))
            this._id = 0;
        return this._id;
    },
 
    set id(x) {
        this._id = x;
    },
 
    get title() {
        if (!("_title" in this))
            this._title = 0;
        return this._title;
    },
 
    set title(x) {
        this._title = x;
    },
     
    get url() {
        if (!("_url" in this))
            this._url = 0;
        return this._url;
    },
 
    set url(x) {
        this._url = x;
    },
 
    get image() {
        if (!("_image" in this))
            this._image = 0;
        return this._image;
    },
 
    set image(x) {
        this._image = x;
    }
};

function captureNew () {
    var cap = new Capture(notableapp.dbhandle);
    chrome.tabs.getSelected(null, function(tab) {
        cap.url = tab.url;
        cap.title = tab.title;
    });
    chrome.tabs.captureVisibleTab(null, function(img) {
        cap.image = img;
    });
    window.setTimeout(function() {
       cap.save();
    }, 300);
    notableapp.display(null);
}

var notableapp = (function () {
    try {
        db1 = openDatabase("NotableAppDB", "1.0", "NotableApp Captures Table", 20000);
        db1.transaction (function(tx) {
            tx.executeSql ("SELECT id FROM NotableApp", [], function(tx, result) { 
                console.log("records count is " + result.rows.length);
            },
            function(tx, error) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS NotableApp (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT, image BLOB)", [], 
                    function(r) {
                        console.log("table successfully created. ");
                    });
                }
           );
        });
    } catch (err) {
        console.log("failed to open the db.");
    }

    return {
        dbhandle : db1,
        init : function () {
             notableapp.updateBadgeText();
        },
        totalCaptures : function () {
            console.log("fetching the total number of captures.");
            return 1;
        },
        updateBadgeText : function () {
//            console.log("updating the badge-text.");
            db1.transaction(function(tx) {
                tx.executeSql("SELECT id FROM NotableApp", [], function(tx, result){
                chrome.browserAction.setBadgeText({
                    text: ""+result.rows.length
                });
                }, function(tx, error){
//                    console.log('Failed to retrieve notes from database - ' + error.message);
                    return;
                });
            });
        },
        updateDisplay : function (action, evt, imageid) {
//             console.log("action, id : " + action + ", " + imageid );
             if (action == "remove" && imageid != null) {
                 document.body.removeChild( evt.srcElement.parentNode.parentNode );
             } else if ( action == "added" ) {
             var sqlquery = "SELECT * from NotableApp where id = ( select max(id) from NotableApp )";
             notableapp.display(sqlquery);
             }
             notableapp.updateBadgeText();
        },
        display : function (sqlquery) {
            if (sqlquery === null ) {
                sqlquery = "SELECT id, title, url, image FROM NotableApp";
            }
            var tmp, scrshot = document.getElementsByClassName("screenshot")[0];
            db1.transaction(function(tx) {
               tx.executeSql(sqlquery, [], function(tx, result) {
                    for (var i = 0; i < result.rows.length; ++i) {
                        var row = result.rows.item(i);
                        var cap = new Capture();
                        cap.id  = row['id'];
                        cap.url = row['url'];
                        cap.title = row['title'].substring(0,25);
                        cap.image = row['image'];
    
                        tmp = scrshot.cloneNode(true);
                        tmp.className = "visible";
                        tmp.setAttribute("screenshot", cap.id);
                        tmp.getElementsByClassName("title")[0].href      = cap.url;
                        tmp.getElementsByClassName("title")[0].innerHTML = cap.title;
                        tmp.getElementsByClassName("thumbnail")[0].src   = cap.image;
                        tmp.getElementsByClassName("addbtn")[0].addEventListener("click", function(e) {cap.add(e); }, false);
                        tmp.getElementsByClassName("thumbnail")[0].addEventListener("click", function(e) {cap.view(e); }, false);
                        tmp.getElementsByClassName("removebtn")[0].addEventListener("click", function(e) {cap.remove(e); }, false);
                        document.body.appendChild(tmp);
                    }
                    notableapp.updateBadgeText();
                }, function(tx, error){
                    console.log('Failed to retrieve notes from database - ' + error.message);
                    return;
                });
            });
        },
        loadCaptures : function(id) {
            var sqlquery = "";
            if (id = "*") {
                sqlquery = "SELECT id, title, url, image FROM NotableApp";
            } else {
                sqlquery = "SELECT id, title, url, image FROM NotableApp WHERE id = ?";
            }
        }
    }
})();

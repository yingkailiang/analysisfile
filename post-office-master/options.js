// Copyright (c) 2012 by Nick Simmonds.  All rights reserved.

// Saves options to localStorage
function saveOptions() {
    document.getElementById("output").innerHTML = "Saving";
    localStorage["gmail"] = document.getElementById("gmail").checked;
    localStorage["yahoo"] = document.getElementById("yahoo").checked;
    localStorage["live"] = document.getElementById("live").checked;
    localStorage["owa"] = document.getElementById("owa").checked;
    localStorage["owaUrl"] = document.getElementById("owaUrl").value;
    localStorage["default"] = document.getElementById("default").value;
    document.getElementById("output").innerHTML = "Saved!";
    chrome.extension.getBackgroundPage().window.location.reload();
}
// Restores page elements state to saved value from localStorage.
function restoreOptions() {
    for (var x in localStorage) {
        if (localStorage[x] === "true") {
            document.getElementById(x).checked = true;
        } else if (localStorage[x] === "false") {
            document.getElementById(x).checked = false;
        } else if (x === "owaUrl") {
        	document.getElementById(x).value = localStorage[x];
        } else if (x === "default") {
        	document.getElementById(x).value = localStorage[x];
        } else continue;
   }
}

//add event listeners

//this adds the button listener
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', saveOptions);
});

//this resets the options when the page is loaded
document.addEventListener('DOMContentLoaded', restoreOptions);

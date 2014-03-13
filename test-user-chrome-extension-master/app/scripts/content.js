var sID = "";

// the right mouse click will execute this function for getting the id
document.addEventListener("mousedown", function(event) {
        var el = event.target;

        sID = el.id;

    },
    true
);

// waiting for the message
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('message received');
        var objField = document.getElementById(sID);

        insertText(objField, request);
    }
);

// insert the selected value in the right clicked field
function insertText(field, value) {
    field.value = "TEST";
}

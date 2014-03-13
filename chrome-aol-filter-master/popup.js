// Usually we try to store settings in the "sync" area since a lot of the time
// it will be a better user experience for settings to automatically sync
// between browsers.
//
// However, "sync" is expensive with a strict quota (both in storage space and
// bandwidth) so data that may be as large and updated as frequently as the CSS
// may not be suitable.
var storage = chrome.storage.local;

storage.get({ "rowStyle":"", "titleStyle":"", "filter":"" } , function(items) {
    if (items.rowStyle) {
        $("#rowStyle").val(items.rowStyle);
    }
    if (items.titleStyle) {
        $("#titleStyle").val(items.titleStyle);
    }
    if (items.filter) {
        $("#data").val(items.filter);
    }
});

function message(message) {
    $("#message").html(message);
    setTimeout(function() { $("#message").html('') }, 3000);
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    $("#button").click(function() {
        // Get a value saved in a form.
        var rowStyle = $("#rowStyle").val();
        var titleStyle = $("#titleStyle").val();
        var filters = $("#data").val();        
        // Check that there's some code there.
        if (!filters) {
            message('Error: Please, specify the filters');
            return;
        }
        var dataObj = {"rowStyle":rowStyle, "titleStyle":titleStyle, "filter":normalize(filters) };
        // Save it using the Chrome extension storage API.
        storage.set(dataObj, function() {
            // Notify that we saved.
            message('Settings saved');            
        });
        $("#data").val(filters);
    });
});

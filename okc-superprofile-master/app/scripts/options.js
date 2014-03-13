'use strict';

// Saves options to localStorage.
function save_options() {
    chrome.storage.sync.set({ backendUrl: document.getElementById('backendUrl').value });

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
        status.innerHTML = "";
    }, 2000);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    chrome.storage.sync.get("backendUrl", function(items) {
        var backendUrl = items.backendUrl;

        if (!backendUrl) {
            return;
        }

        document.getElementById("backendUrl").value = backendUrl;
    });
}

$(function() {
    restore_options();

    $("#save").click(function() {
        save_options();
    });
})


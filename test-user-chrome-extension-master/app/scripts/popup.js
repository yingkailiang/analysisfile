'use strict';

/**
 * Test user data handling
 */
// function for generating a test user by http://randomuser.me/
function getNewUser() {
    $.ajax({dataType:'json', url: 'http://api.randomuser.me/', timeout:5000, success:onRssSuccess, error:onRssError, async: false});
}

// handle successful requests
function onRssSuccess(results, callFromLocalStorage) {
    // store to local storage
    if (callFromLocalStorage != true) {
        localStorage['TUX.result'] = JSON.stringify(results);
        // reset this for getting notified when new email will be received
        localStorage["TUX.email.listLength"] = 0;
    }

    var user = results.results[0].user;
    var seed = results.results[0].seed;
    // set user data
    $('#firstname').val(upperCase(user.name.first));
    $('#lastname').val(upperCase(user.name.last));
    // we 'generate' a username here
    $('#nickname').val(user.name.first.substring(0, 3) + user.name.last.substr(0, 3) + user.location.zip.substring(0, 3));
    $('#password').val(user.password);

    // set user picture
    $('#face').remove();
    $('#facespace').prepend('<img id="face" src="' + user.picture + '" />');

    // set user location
    $('#street').val(upperCase(user.location.street));
    $('#city').val(upperCase(user.location.city));
    $('#state').val(upperCase(user.location.state));
    $('#zip').val(user.location.zip);

    console.log(user.picture);
}

// handle unsuccessful requests
function onRssError(results) {
    console.log('error');
}

function upperCase(text) {
    var textParts = text.split(" ");
    var result = "";
    for (var i = 0; i < textParts.length; i++) {
        var part = textParts[i];
        console.log(part);
        if (result != "") {
            result = result + " ";
        }
        result = result + part.charAt(0).toUpperCase() + part.slice(1);
    }

    return result;
}

/**
 * Get email handling
 */
function getEmail() {
    $.ajax({dataType:'json', url: 'https://www.guerrillamail.com/ajax.php?f=get_email_address', timeout:5000, success:onEmailRssSuccess, error:onEmailRssError, async: false});
}

function onEmailRssSuccess(result, callFromLocalStorage) {
    if (callFromLocalStorage != true) {
        localStorage['TUX.email.result'] = JSON.stringify(result);
    }

    console.log(result.email_addr);
    $('#email').val(result.email_addr);
}

function onEmailRssError(result) {
    console.log('email cannot be retrieved due to an error');
}

/**
 * Forget email handling
 */
function forgetEmail() {
    $.ajax({dataType:'json', url: 'https://www.guerrillamail.com/ajax.php?f=forget_me', timeout:5000, async: false});
}

/**
 * Just do all calls, when button is clicked
 */
function doCalls() {
    getNewUser();
    forgetEmail();
    getEmail();

    // reset badge text
    chrome.browserAction.setBadgeText({text: ""});
}

function selectElement(target) {
    console.log('works');
    target.select();
}

var localStoragePrefix = "TestUserExt";

function storeValue(key, value) {
    var newKey = localStoragePrefix + key;
    localStorage[newKey] = value;
}

function loadValue(key) {
    var newKey = localStoragePrefix + key;
    return localStorage[newKey];
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('button').addEventListener('click', doCalls);
    //document.querySelector('#firstname').addEventListener('click', test);
    document.addEventListener('click', function(e) {

        var liste = ['firstname', 'lastname', 'email', 'nickname', 'password', 'street', 'city', 'state', 'zip'];
        if (liste.indexOf(e.target.id) != -1) {
            selectElement(e.target);
            storeValue(e.target.id, e.target.value);
        }

    }, false);

    document.addEventListener('change', function(e) {

        var liste = ['firstname', 'lastname', 'email', 'nickname', 'password', 'street', 'city', 'state', 'zip'];
        if (liste.indexOf(e.target.id) != -1) {
            storeValue(e.target.id, e.target.value);
        }

    }, false);
});

// load previous test user if available
$( document ).ready(function() {
    var localResults = localStorage['TUX.result'];
    if (localResults) {
        onRssSuccess(JSON.parse(localResults), true);
    }

    var emailResult = localStorage['TUX.email.result'];
    if (emailResult) {
        onEmailRssSuccess(JSON.parse(emailResult), true);
    }
});

'use strict';

function save() {
    localStorage["username"] = $('#username').val();
    localStorage["password"] = $('#password').val();
}

document.addEventListener('DOMContentLoaded', function () {
    // set github credentials
    $('#username').val(localStorage["username"]);
    $('#password').val(localStorage["password"]);

    // set checkboxes - works with a workaround for boolean values -> localStorage only stores string and "false" -> true ;)
    $('#create').attr('checked', localStorage["CreateEvent"] == "true");
    $('#star').attr('checked', localStorage["WatchEvent"] == "true");
    $('#opensource').attr('checked', localStorage["PublicEvent"] == "true");
    $('#follow').attr('checked', localStorage["FollowEvent"] == "true");

    document.querySelector('button').addEventListener('click', save);

    $(".checkbox").change(function() {
        // check which checkbox is used
        if (this.id == "create") {
            localStorage["CreateEvent"] = this.checked;
        } else if (this.id == "star") {
            localStorage["WatchEvent"] = this.checked;
        } else if (this.id == "opensource") {
            localStorage["PublicEvent"] = this.checked;
        } else if (this.id == "follow") {
            localStorage["FollowEvent"] = this.checked;
        }
    });
});
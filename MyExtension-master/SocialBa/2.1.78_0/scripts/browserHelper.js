/// <reference path="jquery-1.4.1.min.js" />

var browserHelper = {
    ajax: function (options) {
        $.ajax(options);
    },
    get: function (url, options, callback) {
        $.get(url, options, callback);
    },
    post: function (options) {

    },
    getJSON: function (url, params, callback) {
        $.getJSON(url, params, callback);
    }
}

var bh = browserHelper;
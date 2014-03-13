"use strict";
exports.main = function(options, callbacks) {
	const packaging = require('@loader/options');
	function start() {
		var extension = require("jetchrome").Extension(packaging);
		var engine = require("jetchrome").Engine(extension, options.staticArgs);
	}

	if (options.staticArgs.debug) {
		require("utils-sf/firebug");
		const Logger = require("utils-sf/logger").Logger;
		Logger.logLevel = Logger.LOG_ALL;
		var timer = require("api-utils/timer");
		timer.setTimeout(function() {
			Logger.log("start", packaging);
			start();
		}, 2000);
	} else {
		start();
	}
	if (options.staticArgs.quitWhenDone)
		callbacks.quit();
};

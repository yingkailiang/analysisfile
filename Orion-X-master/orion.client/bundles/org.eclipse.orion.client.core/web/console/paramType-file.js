/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *     Kris De Volder (VMWare) - initial API and implementation
 *******************************************************************************/

/*global define*/

define(['i18n!orion/console/nls/messages', 'dojo', 'console/current-directory', 'orion/widgets/Console'],
	function(messages, dojo, mCurrentDirectory, mConsole) {

	var orion = {};
	orion.consolePage = {};

	orion.consolePage.ParamTypeFile = (function() {
		function ParamTypeFile(name, directories, files) {
			this._init(name, directories, files);
		}

		ParamTypeFile.prototype = {
			_init: function(name, directories, files) {
				this.name = name;
				this.directories = directories;
				this.files = files;
				this._initCache();
				var self = this;
				dojo.subscribe("/dojo/hashchange", function(newHash) { //$NON-NLS-0$
					self._initCache();
				});
			},
			_initCache: function() {
				this.cache = {};
				var self = this;
				this.withValidFiles(
					function(validFiles) {
						validFiles.sort(function(a,b) {
							var isDir1 = a.Directory;
							var isDir2 = b.Directory;
							if (isDir1 !== isDir2) {
								return isDir1 ? -1 : 1;
							}
							var n1 = a.Name && a.Name.toLowerCase();
							var n2 = b.Name && b.Name.toLowerCase();
							if (n1 < n2) { return -1; }
							if (n1 > n2) { return 1; }
							return 0;
						});
						self.cache.validFiles = validFiles;
					},
					function(error) {
						self.cache.validFiles = [];
					}
				);
			},
			/**
			 * This function is invoked by the console to query for the completion
			 * status and predictions for an argument with this parameter type.
			 */
			parse: function(arg) {
				var string = arg || "";
				var predictions = this.getPredictions(string);
				if (predictions !== null) {
					return this.createCompletion(string, predictions);
				}

				/*
				 * The predictions are not available yet, so return a completion without predictions.
				 * A 'then' method is added to allow access to the actual completion via a callback.
				 */
				var deferredCompletion = {
					value: string,
					status: mConsole.CompletionStatus.PARTIAL
				};
				deferredCompletion.then = function(callback) {
					this.withCompletions(string, function(predictions) {
						callback(this.createCompletion(string, predictions));
					});
				};
				return deferredCompletion;
			},

			stringify: function(value) {
				if (typeof(value) === "string") { //$NON-NLS-0$
					return value;
				}
				return value.Name;
			},
			
			/* internal */

			computePredictions: function(text, validFiles) {
				var predictions = [];
				if (this.directories) {
					var add = text.length < 3;
					if (add) {
						for (var i = 0; i < text.length; i++) {
							if (text.charAt(i) !== '.') { //$NON-NLS-0$
								add = false;
								break;
							}
						}
					}
					if (add) {
						// TODO the value for ".." should of course be the node of the
						// parent directory, but is currently just ".." because this
						// value often cannot always be determined
						predictions.push({name: "..", value: ".."}); //$NON-NLS-1$ //$NON-NLS-0$
					}
				}
				for (var i = 0; i < validFiles.length; i++) {
					var candidate = validFiles[i];
					var name = candidate.Name;
					if (this.startsWith(name, text)) {
						predictions.push({name: name, value: candidate});
					}
				}
				return predictions;
			},
			createCompletion: function(string, predictions) {
				var exactMatch = this.find(predictions, function(el) {
					return el.name === string;
				});
				var status, message;
				var value = string;
				if (exactMatch) {
					status = mConsole.CompletionStatus.MATCH;
					value = exactMatch.value;
				} else if (predictions !== null && predictions.length > 0) {
					status = mConsole.CompletionStatus.PARTIAL;
				} else {
					status = mConsole.CompletionStatus.ERROR;
					message = dojo.string.substitute(messages['\'${0}\' is not valid'], [string]);
				}
				return {value: value, status: status, message: message, predictions: predictions};
			},
			find: function(array, func) {
				for (var i = 0; i < array.length; i++) {
					if (func(array[i])) {
						return array[i];
					}
				}
				return null;
			},
			/*
			 * Returns predictions for text, or null if they cannot be computed synchronously.
			 */
			getPredictions: function(text) {
				if (this.cache.predictions && this.cache.text === text) {
					return this.cache.predictions;
				}
				if (this.cache.validFiles) {
					/* do a quick computation from the list of dirs */
					this.cache.predictions = this.computePredictions(text, this.cache.validFiles);
					this.cache.text = text;
					return this.cache.predictions;
				}
				/* no predictions are currently ready */
				return null;
			},
			startsWith: function(string, prefix) {
				if (typeof(string) === "string" && typeof(prefix) === "string") { //$NON-NLS-1$ //$NON-NLS-0$
					return string.indexOf(prefix) === 0;
				}
				return false;
			},
			/*
			 * Gets the list of completions for text and passes the result to func.
			 * This method will fetch the data asynchronously if required.
			 */
			withCompletions: function(text, func) {
				var completions = this.getPredictions(text);
				if (completions) {
					func(completions);
				} else {
					var self = this;
					this.withValidFiles(
						function(validFiles) {
							self.cache.validFiles = validFiles;
							func(this.getPredictions(text));
						}
					);
				}
			},
			withValidFiles: function(func, errorFunc) {
				var self = this;
				mCurrentDirectory.withCurrentChildren(
					function(nodes) {
						var result = [];
						for (var i = 0; i < nodes.length; i++) {
							var node = nodes[i];
							if ((node.Directory && self.directories) || (!node.Directory && self.files)) {
								result.push(node);
							}
						}
						func(result);
					},
					errorFunc
				);
			}
		};
		return ParamTypeFile;
	}());
	
	return orion.consolePage;
});

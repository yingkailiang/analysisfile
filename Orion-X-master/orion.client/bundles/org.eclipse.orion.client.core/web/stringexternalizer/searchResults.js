/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global define window*/
/*jslint regexp:false browser:true forin:true*/

define(['require', 'dojo', 'orion/commands', 'stringexternalizer/searchExplorer', 'stringexternalizer/nonnlsSearchUtil'], function(require, dojo, mCommands, mSearchExplorer, mSearchUtils){

	/**
	 * Creates a new search results generator.
	 * @name orion.searchResults.SearchResultsGenerator
	 * @class A search results generator for display search results to an end user
	 */
	function SearchResultsGenerator(serviceRegistry, resultsId, commandService, fileService) {
		this.registry = serviceRegistry;
		this.fileService = fileService;
		this.resultsId = resultsId;
		this.commandService = commandService;
		this.explorer = new mSearchExplorer.SearchResultExplorer(this.registry, this.commandService, this);
	}

	SearchResultsGenerator.prototype = /** @lends orion.searchResults.SearchResultsGenerator.prototype */ {

		_renderSearchResult: function(resultsNode, jsonData) {
			dojo.empty(resultsNode);
			this.explorer.setResult(resultsNode, jsonData);
			this.explorer.startUp();
		},

		/**
		 * Runs a search and displays the results under the given DOM node.
		 * @public
		 * @param {DOMNode} resultsNode Node under which results will be added.
		 * @param {String} query URI of the query to run.
		 * @param {String} [excludeFile] URI of a file to exclude from the result listing.
		 * @param {Boolean} [generateHeading] generate a heading for the results
		 * @param {Function(DOMNode)} [onResultReady] If any results were found, this is called on the resultsNode.
		 * @param {Boolean} [hideSummaries] Don't show the summary of what matched beside each result.
		 * @param {Boolean} [useSimpleFormat] Use simple format that only shows the file name to show the result, other wise use a complex format with search details.
		 */
		_search: function(resultsNode, root) {
			var search = new mSearchUtils.NonNlsSearch(this.fileService, root);
			try{
				var self = this;
				search.getNonNls().then(function(nonNLS){
					self._renderSearchResult(resultsNode, nonNLS);
				}, function(error){
					throw error;
				});
			}
			catch(error){
				this.registry.getService("orion.page.message").setErrorMessage(error);	 //$NON-NLS-0$
			}
		},

		/**
		 * Performs the given query and generates the user interface 
		 * representation of the search results.
		 * @param {String} query The search query
		 */
		loadResults: function(root) {
			this.root = root;
			// console.log("loadResourceList old " + this._lastHash + " new " + path);
			var parent = dojo.byId(this.resultsId);
			dojo.place(document.createTextNode("Searching for non externalized strings..."), parent, "only"); //$NON-NLS-1$ //$NON-NLS-0$
			this._search(parent, root);
		},
		
		setConfig: function(config){
			dojo.hitch(this.explorer, this.explorer.setConfig)(config);
		}
		
	};
	SearchResultsGenerator.prototype.constructor = SearchResultsGenerator;
	//return module exports
	return {SearchResultsGenerator:SearchResultsGenerator};
});
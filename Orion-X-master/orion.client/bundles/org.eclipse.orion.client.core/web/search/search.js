/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global window define */
/*browser:true*/

define(['require', 'dojo', 'orion/bootstrap', 'orion/status', 'orion/progress','orion/dialogs',
        'orion/commands', 'orion/favorites', 'orion/searchOutliner', 'orion/searchClient', 'orion/fileClient', 'orion/operationsClient', 'orion/searchResults', 'orion/globalCommands', 'orion/contentTypes',
        'dojo/parser', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane', 'orion/widgets/eWebBorderContainer'], 
		function(require, dojo, mBootstrap, mStatus, mProgress, mDialogs, mCommands, mFavorites, mSearchOutliner, 
				mSearchClient, mFileClient, mOperationsClient, mSearchResults, mGlobalCommands, mContentTypes) {

	dojo.addOnLoad(function() {
		function extractQueryString(){
			//In fire fox, dojo.hash() transforms white space as "%20", where we can use it if the hash contains "replace=xx xx"
			var qStr = window.location.hash;
			var index = qStr.indexOf("#"); //$NON-NLS-0$
			if(index >= 0){
				qStr = qStr.substring(index+1);
			}
			return qStr;
		}
		
		function parseHash(){
			var hash = dojo.hash();
			var hasLocation = (hash.indexOf("+Location:") > -1); //$NON-NLS-0$
			var searchLocation = null;
			var searchStr = hash;
			if(hasLocation){
				var splitHash = hash.split("+Location:"); //$NON-NLS-0$
				if(splitHash.length === 2){
					searchLocation = splitHash[1].split("*")[0]; //$NON-NLS-0$
					searchStr = splitHash[0];
				}
			}
			return {searchStr: searchStr, searchLocation: searchLocation};
		}
		
		function makeHref(fileClient, seg, location, searchStr){
			if(!location || location === "" || location === "root"){ //$NON-NLS-0$
				seg.href = require.toUrl("search/search.html") + "#" + searchStr; //$NON-NLS-1$ //$NON-NLS-0$
			} else {
				seg.href = require.toUrl("search/search.html") + "#" + searchStr + "+Location:" + location + "*"; //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			}
		}
	
		function setPageInfo(serviceRegistry, fileClient, commandService, searcher){
			var searchLoc = parseHash();
			
			if(searchLoc.searchLocation){
				fileClient.read(searchLoc.searchLocation, true).then(
						dojo.hitch(this, function(metadata) {
							mGlobalCommands.setPageTarget({task: "Search", target: metadata, serviceRegistry: serviceRegistry, 
								fileService: fileClient, commandService: commandService, searchService: searcher, breadcrumbRootName: "Search",
								makeBreadcrumbLink: function(seg,location){makeHref(fileClient, seg, location, searchLoc.searchStr);}});
						}),
						dojo.hitch(this, function(error) {
							window.console.error("Error loading file metadata: " + error.message); //$NON-NLS-0$
						})
				);
			} else {
				mGlobalCommands.setPageTarget({task: "Search", serviceRegistry: serviceRegistry, 
					commandService: commandService, searchService: searcher, fileService: fileClient, breadcrumbRootName: "Search",
					makeBreadcrumbLink: function(seg,location){makeHref(fileClient, seg, location, searchLoc.searchStr);}});
			}
		}
		mBootstrap.startup().then(function(core) {
			var serviceRegistry = core.serviceRegistry;
			var preferences = core.preferences;
			window.document.body.style.visibility = "visible"; //$NON-NLS-0$
			dojo.parser.parse();

			var dialogService = new mDialogs.DialogService(serviceRegistry);
			var operationsClient = new mOperationsClient.OperationsClient(serviceRegistry);
			new mStatus.StatusReportingService(serviceRegistry, operationsClient, "statusPane", "notifications", "notificationArea"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			new mProgress.ProgressService(serviceRegistry, operationsClient);
			var commandService = new mCommands.CommandService({serviceRegistry: serviceRegistry});
			// favorites and saved searches
			new mFavorites.FavoritesService({serviceRegistry: serviceRegistry});
			new mSearchOutliner.SavedSearches({serviceRegistry: serviceRegistry});

			var fileClient = new mFileClient.FileClient(serviceRegistry);
			var contentTypeService = new mContentTypes.ContentTypeService(serviceRegistry);
			var searcher = new mSearchClient.Searcher({serviceRegistry: serviceRegistry, commandService: commandService, fileService: fileClient});
			
			var searchOutliner = new mSearchOutliner.SearchOutliner({parent: "searchProgress", serviceRegistry: serviceRegistry}); //$NON-NLS-0$
			mGlobalCommands.generateBanner("banner", serviceRegistry, commandService, preferences, searcher, searcher); //$NON-NLS-0$
			
			var queryString =extractQueryString();

			mGlobalCommands.generateDomCommandsInBanner(commandService, searcher, queryString, null, null,  /* no images */ false, /* client handle page nav area */ true);     
			setPageInfo(serviceRegistry, fileClient, commandService, searcher);
			var searchResultsGenerator = new mSearchResults.SearchResultsGenerator(serviceRegistry, "results", commandService, fileClient, false/*crawling*/); //$NON-NLS-0$
			searchResultsGenerator.loadResults(queryString);
			//every time the user manually changes the hash, we need to load the results with that name
			dojo.subscribe("/dojo/hashchange", searchResultsGenerator, function() { //$NON-NLS-0$
				setPageInfo(serviceRegistry, fileClient, commandService, searcher);
				var query = extractQueryString();
				searchResultsGenerator.loadResults(query);
				mGlobalCommands.generateDomCommandsInBanner(commandService, searcher, query, null, null,  /* no images */ false, /* client handle page nav area */ true);     
			});
		});
	});
});

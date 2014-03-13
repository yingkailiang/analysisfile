/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     Anton McConville (IBM Corporation) - initial API and implementation
 *
 *******************************************************************************/
/*global define dojo dijit orion window widgets localStorage*/
/*jslint browser:true devel:true*/

define(['i18n!orion/settings/nls/messages', 'require', 'dojo', 'orion/bootstrap', 'orion/status', 'orion/commands', 'orion/operationsClient', 'orion/fileClient', 'orion/searchClient', 'orion/dialogs', 'orion/globalCommands', 'orion/sites/siteClient', 'orion/sites/siteUtils', 'orion/sites/sitesExplorer', 'orion/treetable', 'dojo/parser', 'dojo/hash', 'dojo/date/locale', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane', 'orion/widgets/maker/PluginMakerContainer', 'orion/widgets/maker/ScrollingContainerSection', 'orion/widgets/maker/PluginDescriptionSection', 'orion/widgets/maker/PluginCompletionSection', 'dijit/form/Button', 'dijit/ColorPalette'], function(messages, require, dojo, mBootstrap, mStatus, mCommands, mOperationsClient, mFileClient, mSearchClient, mDialogs, mGlobalCommands, mSiteClient, mSiteUtils, mSiteTree, mTreeTable) {

	dojo.addOnLoad(function() {
		mBootstrap.startup().then(function(core) {

			var serviceRegistry = core.serviceRegistry;
			var preferences = core.preferences;

			document.body.style.visibility = "visible"; //$NON-NLS-0$
			dojo.parser.parse();

			// Register services
			var operationsClient = new mOperationsClient.OperationsClient(serviceRegistry);
			var preferencesStatusService = new mStatus.StatusReportingService(serviceRegistry, operationsClient, "statusPane", "notifications", "notificationArea"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			var commandService = new mCommands.CommandService({
				serviceRegistry: serviceRegistry
			});

			var fileClient = new mFileClient.FileClient(serviceRegistry);
			var searcher = new mSearchClient.Searcher({
				serviceRegistry: serviceRegistry,
				commandService: commandService,
				fileService: fileClient
			});

			var preferenceDialogService = new mDialogs.DialogService(serviceRegistry);
			mGlobalCommands.generateBanner("banner", serviceRegistry, commandService, preferences, searcher); //$NON-NLS-0$

			preferencesStatusService.setMessage("Loading..."); //$NON-NLS-0$
			
			/* Note 'pageActions' is the attach id for commands in the toolbar */
			
			var containerParameters = { preferences: preferences, 
										serviceRegistry: core.serviceRegistry,
										preferencesStatusService: preferencesStatusService,
										commandService: commandService,
										preferenceDialogService: preferenceDialogService,
										settingsCore: core,
										toolbarID: "pageActions" }; //$NON-NLS-0$

			var container = new orion.widgets.maker.PluginMakerContainer( containerParameters, dojo.byId( "selectionAgent" )); //$NON-NLS-0$
			
			var description = orion.widgets.maker.PluginDescriptionSection({title:messages["Plugin Description"]});
			container.addSection( description );
			
			container.addCommand( messages['Create'], 'createPlugin' ); //$NON-NLS-1$

			preferencesStatusService.setMessage("");
		});
	});
});
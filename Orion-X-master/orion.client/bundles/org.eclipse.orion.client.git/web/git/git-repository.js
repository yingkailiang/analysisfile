/******************************************************************************* 
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var eclipse;
/*global define document dojo dijit serviceRegistry:true */
/*browser:true*/
define(['i18n!git/nls/gitmessages', 'require', 'dojo', 'orion/bootstrap', 'orion/status', 'orion/progress', 'orion/util', 'orion/PageUtil', 'orion/commands', 'orion/dialogs', 'orion/selection', 
        'orion/fileClient', 'orion/operationsClient', 'orion/searchClient', 'orion/globalCommands',
        'orion/git/gitRepositoryExplorer', 'orion/git/gitCommands', 'orion/git/gitClient', 'orion/ssh/sshTools', 'orion/links',
	    'dojo/parser', 'dojo/hash', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane', 'orion/widgets/eWebBorderContainer'], 
		function(messages, require, dojo, mBootstrap, mStatus, mProgress, mUtil, PageUtil, mCommands, mDialogs, mSelection, 
				mFileClient, mOperationsClient, mSearchClient, mGlobalCommands, 
				mGitRepositoryExplorer, mGitCommands, mGitClient, mSshTools, mLinks) {

mBootstrap.startup().then(function(core) {
	var serviceRegistry = core.serviceRegistry;
	var preferences = core.preferences;
	document.body.style.visibility = "visible"; //$NON-NLS-0$
	dojo.parser.parse();
	
	new mDialogs.DialogService(serviceRegistry);
	var selection = new mSelection.Selection(serviceRegistry);
	new mSshTools.SshService(serviceRegistry);
	var commandService = new mCommands.CommandService({serviceRegistry: serviceRegistry});
	var operationsClient = new mOperationsClient.OperationsClient(serviceRegistry);
	new mProgress.ProgressService(serviceRegistry, operationsClient);
	new mStatus.StatusReportingService(serviceRegistry, operationsClient, "statusPane", "notifications", "notificationArea"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	
	// ...
	var linkService = new mLinks.TextLinkService({serviceRegistry: serviceRegistry});
	var gitClient = new mGitClient.GitService(serviceRegistry);
	var fileClient = new mFileClient.FileClient(serviceRegistry);
	var searcher = new mSearchClient.Searcher({serviceRegistry: serviceRegistry, commandService: commandService, fileService: fileClient});
	
	var explorer = new mGitRepositoryExplorer.GitRepositoryExplorer(serviceRegistry, commandService, linkService, /* selection */ null, "artifacts", "itemLevelCommands"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	mGlobalCommands.generateBanner("banner", serviceRegistry, commandService, preferences, searcher, explorer); //$NON-NLS-0$
	
	// define commands
	mGitCommands.createFileCommands(serviceRegistry, commandService, explorer, "pageActions", "selectionTools"); //$NON-NLS-1$ //$NON-NLS-0$
	mGitCommands.createGitClonesCommands(serviceRegistry, commandService, explorer, "pageActions", "selectionTools", fileClient); //$NON-NLS-1$ //$NON-NLS-0$

	// define the command contributions - where things appear, first the groups
	commandService.addCommandGroup("pageActions", "eclipse.gitGroup", 100); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.addCommandGroup("pageActions", "eclipse.gitGroup", 200); //$NON-NLS-1$ //$NON-NLS-0$
	
	commandService.registerCommandContribution("reposPageActions", "eclipse.cloneGitRepository", 100, "eclipse.gitGroup", false, null, new mCommands.URLBinding("cloneGitRepository", "url")); //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("reposPageActions", "eclipse.initGitRepository", 200, "eclipse.gitGroup"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	
	commandService.registerCommandContribution("repoPageActions", "eclipse.orion.git.pull", 100, "eclipse.gitGroup"); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("repoPageActions", "eclipse.orion.git.applyPatch", 200, "eclipse.gitGroup"); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("repoPageActions", "eclipse.git.deleteClone", 300, "eclipse.gitGroup"); //$NON-NLS-1$ //$NON-NLS-0$
	
	commandService.registerCommandContribution("reposPageActions", "eclipse.orion.git.openCommitCommand", 1000, "eclipse.gitGroup", true,  //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			new mCommands.CommandKeyBinding('h', true, true), new mCommands.URLBinding("openGitCommit", "commitName")); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("reposPageActions", "eclipse.orion.git.showContent", 1100, null, true, new mCommands.CommandKeyBinding('e', true, true)); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	
	commandService.registerCommandContribution("repoPageActions", "eclipse.orion.git.openCommitCommand", 1000, "eclipse.gitGroup", true,  //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		new mCommands.CommandKeyBinding('h', true, true), new mCommands.URLBinding("openGitCommit", "commitName")); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("repoPageActions", "eclipse.orion.git.showContent", 1100, null, true, new mCommands.CommandKeyBinding('e', true, true)); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$

	// object contributions
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.openCloneContent", 100); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.openGitStatus", 100); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.openGitLog", 100); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.pull", 200); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.removeBranch", 1000); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.checkoutTag", 200); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.removeTag", 1000); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.checkoutBranch", 200); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.applyPatch", 300); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.git.deleteClone", 1000); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.fetch", 500); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.merge", 600); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.mergeSquash", 700); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.rebase", 700); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.resetIndex", 800); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.removeRemote", 1000); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.deleteConfigEntryCommand", 1000); //$NON-NLS-1$ //$NON-NLS-0$
	commandService.registerCommandContribution("itemLevelCommands", "eclipse.orion.git.editConfigEntryCommand", 200); //$NON-NLS-1$ //$NON-NLS-0$
	
	// add commands specific for the page	
	var viewAllCommand = new mCommands.Command({
		name : messages["View All"],
		id : "eclipse.orion.git.repositories.viewAllCommand", //$NON-NLS-0$
		hrefCallback : function(data) {
			return require.toUrl(data.items.ViewAllLink);
		},
		visibleWhen : function(item) {
		
			this.name = item.ViewAllLabel;
			this.tooltip = item.ViewAllTooltip;
			return item.ViewAllLabel && item.ViewAllTooltip && item.ViewAllLink;
		}
	});
	commandService.addCommand(viewAllCommand);
		
	// process the URL to find our bindings, since we can't be sure these bindings were defined when the URL was first processed.
	commandService.processURL(window.location.href);
	
	fileClient.loadWorkspace().then(
		function(workspace){
			explorer.setDefaultPath(workspace.Location);
			explorer.redisplay();
		}	
	);	
	
	//every time the user manually changes the hash, we need to load the workspace with that name
	dojo.subscribe("/dojo/hashchange", explorer, function() { //$NON-NLS-0$
		fileClient.loadWorkspace().then(
			function(workspace){
				explorer.setDefaultPath(workspace.Location);
				explorer.redisplay();
			}	
		);	
	});
	
});

//end of define
});

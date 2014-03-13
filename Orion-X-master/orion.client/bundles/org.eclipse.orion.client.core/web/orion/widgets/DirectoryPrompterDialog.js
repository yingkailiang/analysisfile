/*******************************************************************************
 * @license
 * Copyright (c) 2011 IBM Corporation and others. 
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global define dojo dijit eclipse orion widgets */
/*jslint browser:true */

define(['i18n!orion/widgets/nls/messages', 'dojo', 'dijit', 'orion/util', 'dijit/Dialog', 'dijit/form/Button', 'orion/widgets/ExplorerTree',  'orion/widgets/_OrionDialogMixin', 'text!orion/widgets/templates/DirectoryPrompterDialog.html'], function(messages, dojo, dijit, mUtil) {

/**
* @param options {{
		func : function(item)     Function to be called with the selected item
		message : String          (Optional) Message to display in dialog.
		title : String            (Optional) Dialog title.
	}}
 */
 
dojo.declare("orion.widgets.DirectoryPrompterDialog", [ dijit.Dialog, orion.widgets._OrionDialogMixin ], { //$NON-NLS-0$
	treeWidget : null,
	treeRoot : {},
	widgetsInTemplate : true,
	templateString : dojo.cache('orion', 'widgets/templates/DirectoryPrompterDialog.html'), //$NON-NLS-1$ //$NON-NLS-0$
	constructor : function() {
		this.inherited(arguments);
		this.options = arguments[0] || {};
	},
	
	postMixInProperties : function() {
		this.inherited(arguments);
		this.title = this.options.title || messages['Choose a Folder'];
		this.buttonOk = messages['OK'];	
		this.message = this.options.message || "";
	},
	
	postCreate : function() {
		this.inherited(arguments);
		this.loadFolderList("/");	// workspace root //$NON-NLS-0$
		if (!this.message) {
			dojo.style(this.messageCell, {display: "none"}); //$NON-NLS-0$
		}
	},
	
	_copyChildren : function(children) {
		var newChildren = [];
		for (var e in children) {
			var child = children[e];
			newChildren[e] = {
				Directory: child.Directory, 
				Length: child.Length, 
				LocalTimeStamp: child.LocalTimeStamp,
				Location: child.Location, 
				ChildrenLocation: child.ChildrenLocation,
				Name: child.Name
			};
		}
		return newChildren;
	},
	
	loadFolderList: function(path) {
		path = mUtil.makeRelative(path);
		this.treeRoot.Location = path;
		this.options.fileClient.loadWorkspace(path).then(
			dojo.hitch(this, function(loadedWorkspace) {
				for (var i in loadedWorkspace) {
					this.treeRoot[i] = loadedWorkspace[i];
				}
				// we don't filter out files because there are no files at the workspace root
				// We alsos need to copy the children of the loaded work space. Otherwise the tree model is not getting children once you opened the dialog and reopen it.
				//Refer to https://bugs.eclipse.org/bugs/show_bug.cgi?id=382771#c2.
				mUtil.processNavigatorParent(this.treeRoot, this._copyChildren(loadedWorkspace.Children));
				this.createTree();
			})
		);
	},
	
	createTree : function(){
		var myTreeModel = new orion.widgets.DirectoryTreeModel(this.options.serviceRegistry, this.treeRoot , this.options.fileClient);
		this.treeWidget = new orion.widgets.ExplorerTree({
			id: "treeWidget", //$NON-NLS-0$
			style: "width:100%; height:100%", //$NON-NLS-0$
			model: myTreeModel,
			showRoot: false,
			persist: false, // disabled for now, these cookies can get really big
			openOnClick: false,
			getLabel: function(item) {
				return item.Name;
			},
			getIconClass: function(/* dojo.data.Item */ item, /* Boolean */ opened){
				return "folderItem";			 //$NON-NLS-0$
			}
		});	
		    
	this.treeWidget.startup();
	dojo.byId(this.treeContentPane.id).appendChild(this.treeWidget.domNode);
	},
	
	execute : function() {
		var selectedItems = this.treeWidget.getSelectedItems();
		this.onHide();
		this.options.func(selectedItems[0]);
	}
});

orion.widgets.DirectoryTreeModel = (function() {
	/**
	 * @name orion.widgets.DirectoryTreeModel
	 * @class Tree model used by orion.widgets.DirectoryPrompterDialog
	 */
	function DirectoryTreeModel(serviceRegistry, root, fileClient) {
		this.registry = serviceRegistry;
		this.root = root;
		this.fileClient = fileClient;
	}
	DirectoryTreeModel.prototype = {
		destroy: function(){
		},
		getRoot: function(onItem){
			onItem(this.root);
		},
		mayHaveChildren: function(/* dojo.data.Item */ item){
			return true;
		},
		getChildren: function(/* dojo.data.Item */ parentItem, /* function(items) */ onComplete){
			// the parent item may already have the children fetched
			if (parentItem.children) {
				onComplete(parentItem.children);
			} else if (parentItem.Directory!==undefined && parentItem.Directory===false) {
				onComplete([]);
			} else if (parentItem.Location) {
				this.fileClient.fetchChildren(parentItem.ChildrenLocation).then(
					dojo.hitch(this, function(children) {
						var folderChildren = [];
						for (var i=0; i<children.length; i++) {
							if (children[i].Directory) {
								folderChildren.push(children[i]);
							}
						}
						mUtil.processNavigatorParent(parentItem, folderChildren);
						onComplete(folderChildren);
					}));
			} else {
				onComplete([]);
			}
		},
		getIdentity: function(/* item */ item){
			var result;
			if (item.Name) {
				result = item.Location;
			} else {
				result = "ROOT"; //$NON-NLS-0$
			}
			return result;
		},
		getLabel: function(/* dojo.data.Item */ item){
			return item.Name;
		},
		onChildrenChange: function(/* dojo.data.Item */ parent, /* dojo.data.Item[] */ newChildrenList) {
			// No implementation is necessary, this method is here so client code
			// can connect to it
		}
	};
	return DirectoryTreeModel;
})();
});
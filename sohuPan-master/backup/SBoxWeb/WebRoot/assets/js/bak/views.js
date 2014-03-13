/**
 * @fileOverview 首页主要的view定义。
 * @author angelscat angelscat@vip.qq.com
 * 
 */

//首页页面整体布局
/**
 * 首页页面整体布局
 * @class Layout
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.Layout = Backbone.View.extend({/** @lends Sbox.Views.Layout*/
	el:$('#content'),
	template:_.template($('#layout-template').html()),
	initialize:function(){
		this.render();
	},
	render:function(){
		this.$el.html(this.template());
		new Sbox.Views.SideBar();
		//new Sbox.Views.Main();
		return this;
	}
});

//sidebar
/**
 * 左侧导航主体
 * @class SideBar
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.SideBar = Backbone.View.extend({/** @lends Sbox.Views.SideBar*/
	el:$("#content"),
	template:_.template($('#sidebar-template').html()),
	events:{
		'click #myFileHead'		:'myFile',
		'click #publicFileHead'	:'publikFile',
		'click #shareFileHead'	:'shareFile',
		'click #outChainHead'	:'outChain',
		'click .outchain .outlink' :'outlink',
		'click .outchain .uploadlink' :'uploadlink',
		// 'click #starFileHead'	:'starFile',
		'click #recycleBinHead'	:'recycleBin'
	},
	initialize:function(){
		this.render();
	},
	render:function(){
		this.$('#sidebar').html(this.template());
		return this;
	},
	myFile:function(e){
		Backbone.history.navigate('!/' + MY_DISK_NAME,true);
	},
	publikFile:function(e){
		Backbone.history.navigate('!/' + PUBLIC_DISK_NAME,true);
	},
	shareFile:function(e){
		Backbone.history.navigate('!/' + SHARE_DISK_NAME,true);
	},
	outChain:function(e){
		var obj = $('#outChainHead').next();
		if(obj.find('li.cur').length === 0){
			obj.find('.outlink').trigger('click');
		}else{
			obj.find('li.cur').trigger('click');
		}
	},
	outlink:function(e){
		Backbone.history.navigate('!/' + OUT_CHAIN + '/outlink',true);
	},
	uploadlink:function(e){
		Backbone.history.navigate('!/' + OUT_CHAIN + '/uploadlink',true);
	},
	// starFile:function(e){
	// 	Backbone.history.navigate('!/星标文件',true);
	// },
	recycleBin:function(e){
		Backbone.history.navigate('!/' + RECYCLE_BIN,true);
	}
});

/**
 * 我的文件
 * @class MyFileView
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.MyFileView = Backbone.View.extend({/** @lends Sbox.Views.MyFileView*/
	className:'my-file',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.render();
	},
	render:function(){
		var op = new Sbox.Views.MainOperation({
			fileList : this.fileList,
			path : this.path
		});
		var path = new Sbox.Views.PathView({
			model : this.path
		}); 
		var cv = new Sbox.Views.ViewChangeView({
			fileList : this.fileList
		});
		var manage = new Sbox.Views.FileManage({
			fileList : this.fileList,
			path : this.path
		})
		this.$el.append(op.render().el)
				.append(path.render().el)
				.append(cv.render().el)
				.append(manage.render().el)
				.appendTo($('#main'));
		return this;
	}
});

/**
 * 公共文件夹
 * @class ShareFileView
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.PublicFileView = Backbone.View.extend({/** @lends Sbox.Views.PublicFileView*/
	className:'public-file',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.render();
	},
	render:function(){
		var op = new Sbox.Views.MainOperation({
			fileList : this.fileList,
			path : this.path
		});
		var path = new Sbox.Views.PathView({
			model : this.path
		}); 
		var cv = new Sbox.Views.ViewChangeView({
			fileList : this.fileList
		});
		var manage = new Sbox.Views.FileManage({
			fileList : this.fileList,
			path : this.path
		})
		this.$el.append(op.render().el)
				.append(path.render().el)
				.append(cv.render().el)
				.append(manage.render().el)
				.appendTo($('#main'));
		return this;
	}
})
/**
 * 我收到的共享文件
 * @class ShareFileView
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.ShareFileView = Backbone.View.extend({/** @lends Sbox.Views.ShareFileView*/
	className:'share-file',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.render();
	},
	render:function(){
		var op = new Sbox.Views.MainOperation({
			fileList : this.fileList,
			path : this.path
		});
		var path = new Sbox.Views.PathView({
			model : this.path
		}); 
		var cv = new Sbox.Views.ViewChangeView({
			fileList : this.fileList
		});
		var manage = new Sbox.Views.FileManage({
			fileList : this.fileList,
			path : this.path
		})
		this.$el.append(op.render().el)
				.append(path.render().el)
				.append(cv.render().el)
				.append(manage.render().el)
				.appendTo($('#main'));
		return this;
	}
})

//上传&新建
/**
 * 上传&新建 等操作
 * @class MainOperation 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.MainOperation = Backbone.View.extend({/** @lends Sbox.Views.MainOperation*/
	className:'main-op',
	template:_.template($('#mainOperation-template').html()),
	events:{
		'click .upload':'upload',
		'click .create':'create'
	},
	initialize:function(){
		this.fileList = this.options.fileList; //传入fileList用于create操作
		this.path = this.options.path; //传入path用于upload操作
		//this.$el.attr('id','mainOperation');
		_.bindAll(this,'reset','render');
		this.fileList.bind('reset',this.reset);
	},
	render:function(){
		this.$el.html(this.template());
		this.$('a.upload').addClass('upload-disabled');
		this.$('a.create').addClass('create-disabled');
		return this;
	},
	upload:function(e){
		var target = $(e.currentTarget);
		if(target.hasClass('upload-disabled')) return;
		Sbox.Upload(this.path,'upload',this.fileList);
		e.preventDefault();
	},
	create:function(e){
		var target = $(e.currentTarget);
		if(target.hasClass('create-disabled')) return;
		var d = new Date(),
			time = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes()
		var file = new Sbox.Models.File({
			parentDir:this.path.get('pathId'),
			note:'',
			modifyTime:time,
			size:-1,
			shareFlag:0,
			name:''
		});
		this.fileList.add(file);
		this.$('a.upload').addClass('upload-disabled');
		this.$('a.create').addClass('create-disabled');
		e.preventDefault();
	},
	reset:function(){
		var path = this.path,
			type = path.get('type'),
			acl = path.get('acl');
		if((type === 'share' || type === 'public') && (acl === null || acl === 1)){
			this.$('a.upload').addClass('upload-disabled');
			this.$('a.create').addClass('create-disabled');
		}else if(acl === 2){	
			this.$('a.upload').removeClass('upload-disabled');
			this.$('a.create').addClass('create-disabled');
		}else if(acl === 3){	
			this.$('a.upload').removeClass('upload-disabled');
			this.$('a.create').removeClass('create-disabled');
		}else if(acl === 4){	
			this.$('a.upload').addClass('upload-disabled');
			this.$('a.create').addClass('create-disabled');
		}else if(acl === 5){	
			this.$('a.upload').removeClass('upload-disabled');
			this.$('a.create').addClass('create-disabled');
		}else if(acl === 6){	
			this.$('a.upload').removeClass('upload-disabled');
			this.$('a.create').addClass('create-disabled');
		}else{
			this.$('a.upload').removeClass('upload-disabled');
			this.$('a.create').removeClass('create-disabled');
		}
	}
})

//path
/**
 * 面包屑导航
 * @class PathView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.PathView = Backbone.View.extend({/** @lends Sbox.Views.PathView*/
	className:'navigation',
	template:_.template($('#navigation-template').html()),
	events:{
		'click .up a':'goback',
		'click .path a':'gopath'
	},
	initialize:function(){
		//this.$el.attr('id','navigation');
		_.bindAll(this,'render');
		this.model.bind('change',this.render); //以path作为model
		this.model.bind('path.load',this.render);
	},
	render:function(){
		var path = this.model.get('path');
		path = path.split('/').slice(1);
		this.path = path;
		this.$el.html(this.template({paths:path}));
		return this;
	},
	goback:function(e){
		var target = e.currentTarget;
		//console.log(target)
		if($(target).hasClass('disabled')) return;
		this.gopath(this.path.length - 1);
		//Backbone.history.navigate('!/' + this.path.join('/'),true);
		e.preventDefault();
	},
	gopath:function(e){
		var index;
		if($.isNumeric(e)){
			index = e - 1;
		}else{
			index = parseInt($(e.currentTarget).attr('_index'));
			e.preventDefault();
		}
		this.path = this.path.slice(0,index + 1);
		Backbone.history.navigate('!/' + this.path.join('/'),true);
	}
})

//change view
/**
 * 切换视图
 * @class ViewChangeView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.ViewChangeView = Backbone.View.extend({/** @lends Sbox.Views.ViewChangeView*/
	className:'view-change',
	template:_.template($('#view-change-template').html()),
	events:{
		'click a':'changeView'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
	},
	render:function(){
		this.$el.html(this.template());
		if($.cookie('showtype') === 'preview'){
			this.$('.pview').addClass('on');
		}else{
			this.$('.lview').addClass('on');
		}
		return this;
	},
	changeView:function(e){ //通过this.fileList.trigger('view.change',params)来切换
		var target = $(e.currentTarget);
		if(target.hasClass('on')) return;
		if(target.hasClass('lview')){
			this.fileList.trigger('view.change','listview');
			$.cookie('showtype','listview');
		}else{
			this.fileList.trigger('view.change','preview');
			$.cookie('showtype','preview');
		}
		this.$('.on').removeClass('on');
		target.addClass('on');
		e.preventDefault();
	}
})

//toolbar
/**
 * 工具栏
 * @class ToolBarView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.ToolBarView = Backbone.View.extend({/** @lends Sbox.Views.ToolBarView*/
	className:'toolbar',
	template:_.template($('#toolbar-template').html()),
	events:{
		'click .upload'				: 'upload',
		'click .quitshare'			: 'quitshare',
		'click .show-member'		: 'showMember',
		'click .share'				: 'share',
		'click .file-view'			: 'preview',
		'click .download'			: 'download',
		'click .outchain'			: 'createOutChain',
		'click .uploadlink' 		: 'createUploadLink',
		'click .remark'				: 'editRemark',
		'click .move'				: 'move',
		'click .copy'				: 'copy',
		'click .rename'				: 'rename',
		'click .delete'				: 'del',
		'click .history'			: 'checkHistory',
		'click .lock'				: 'lock',
		'click .setsize'			: 'setSize',
		'click .share-setting'		: 'setShare',
		'click .share-cancle'		: 'cancleShare',
		'click .outchain-setting'	: 'setOutChain',
		'click .outchain-cancle'	: 'cancleOutChain',
		'click .outchain-view'		: 'viewOutChain',
		'click .outchain-send'		: 'sendOutChain',
		'click .uploadlink-setting'	: 'setUploadLink',
		'click .uploadlink-cancle'	: 'cancleUploadLink',
		'click .uploadlink-view'	: 'viewUploadLink',
		'mouseenter li.has-sub' 	: 'showSubMenu',
		'mouseleave li.has-sub' 	: 'hideSubMenu'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.model = new Sbox.Models.ToolBar();

		_.bindAll(this,'render','select');
		this.model.bind('change',this.render);
		this.fileList.bind('change',this.select);
		this.fileList.bind('reset',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	select:function(){
		var files = this.fileList.getChecked();
		if(files.length === 0) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedFiles(files);
	},
	upload:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.Upload(file.get('id'),'upload',this.fileList);
		e.preventDefault();
	},
	share:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.Share(file);
		e.preventDefault();
	},
	quitshare:function(e){
		var files = this.fileList.getChecked();
		var _this = this;
		Sbox.Warning({
			title:'退出共享',
			message:'<p>您确定要退出该文件夹共享吗？</p><p class="tip">退出共享后该文件夹将被删除！</p>',
			callback:function(f){
				if(f){
					_this.fileList.quitshare(files);
				}
			}
		})
		e.preventDefault();
	},
	showMember:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.ViewShareMember(file);
		e.preventDefault();
	},
	editRemark:function(e){ //编辑备注
		var file = this.fileList.getChecked()[0];
		Sbox.EditRemark(file);
		e.preventDefault();
	},
	lock:function(e){//上锁
		var file = this.fileList.getChecked()[0];
		Sbox.Lock(file);
		e.preventDefault();
	},
	preview:function(e){
		var files = this.fileList.getChecked();
		if(isPreviewImgFile(files[0].get('name'),files[0].get('size'))){
			Sbox.Preview(files[0],this.fileList);
		}else{
			window.open('/getFileOnline/' + files[0].get('id'));
			//window.open('/GetFile!getFileOnLineLink.action?resourceId='+files[0].get('id'));	
		}
		e.preventDefault();
	},
	download:function(e){ //下载
		var files = this.fileList.getChecked();
		Sbox.Download(files);
		// _(files).each(function(file){
		// 	window.open('/GetFile!getFile.action?resourceId='+file.get('id')+'&length='+file.get('size'))
		// })
		e.preventDefault();
	},
	rename:function(e){ //重命名
		var file = this.fileList.getChecked()[0];
		Sbox.ReName(file);
		e.preventDefault();
	},
	move:function(e){ //移动
		var files = this.fileList.getChecked();
		Sbox.Move(files,false,this.fileList,this.path.get('type'));
		e.preventDefault();
	},
	copy:function(e){ //复制
		var files = this.fileList.getChecked();
		Sbox.Move(files,true,this.fileList,this.path.get('type'));
		e.preventDefault();
	},
	del:function(e){ //删除
		var files = this.fileList.getChecked();
		Sbox.DeleteFile(this.fileList,files);
		e.preventDefault();
	},
	checkHistory:function(e){ //查看历史版本
		//alert('历史版本')
		var file = this.fileList.getChecked()[0];
		window.open('/history/' + file.get('id') + '/' + file.get('versionNumber'));
		// window.open('/HistoryVersion!getHistory.action?resourceId=' + file.get('id') + '&versionNumber=' +  file.get('versionNumber') );
		e.preventDefault();
	},
	setSize:function(e){ //设置文件夹大小
		var file = this.fileList.getChecked()[0];
		Sbox.SetSize(file);
		e.preventDefault();
	},
	setShare:function(e){ //设置共享
		var file = this.fileList.getChecked()[0];
		Sbox.Share(file);
		e.preventDefault();
	},
	cancleShare:function(e){ //取消共享
		var file = this.fileList.getChecked()[0];
		Sbox.CancleShare(file);
		e.preventDefault();
	},
	createOutChain:function(e){ //生成外链
		var file = this.fileList.getChecked()[0];
		// file.createOutChain();
		Sbox.CreateOutChain(file)
		//file.getOutChain();
		e.preventDefault();
	},
	viewOutChain:function(e){ //查看外链
		var file = this.fileList.getChecked()[0];
		file.getOutChain();
		e.preventDefault();
	},
	setOutChain:function(e){ //设置外链
		var file = this.fileList.getChecked()[0];
		file.editOutChain();
		e.preventDefault();
	},
	cancleOutChain:function(e){ //取消外链
		var file = this.fileList.getChecked()[0];
		Sbox.DeleteOutChain([file],this.fileList);
		e.preventDefault();
	},
	sendOutChain:function(e){ //发送外链
		var file = this.fileList.getChecked()[0];
		Sbox.SendOutChain(file);
		e.preventDefault();
	},
	createUploadLink:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.CreateUploadLink(file);
		e.preventDefault();
	},
	setUploadLink:function(e){
		var file = this.fileList.getChecked()[0];
		file.editUploadLink();
		e.preventDefault();
	},
	cancleUploadLink:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.DeleteUploadLink([file],this.fileList);
		e.preventDefault();
	},
	viewUploadLink:function(e){
		var file = this.fileList.getChecked()[0];
		file.getUploadLink(); 
		e.preventDefault();
	},
	showSubMenu:function(e){ //显示下拉菜单
		var li = $(e.currentTarget);
		li.addClass('hover');
	},
	hideSubMenu:function(e){ //隐藏下拉菜单
		var li = $(e.currentTarget);
		li.removeClass('hover');
	}
})

//右键菜单
/**
 * 右键菜单
 * @class ContextMenu 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.ContextMenu = Backbone.View.extend({/** @lends Sbox.Views.ContextMenu*/
	className:'dropdown contextmenu',
	//template:_.template('<li class="download">下载</li><li class="copy">复制</li><li class="move">移动</li><li class="delete">删除</li>'),
	template:_.template($('#toolbar-template').html()),
	//template:_.template($('#file-context-menu').html()),
	events:{
		'click .upload'				:'upload',
		'click .quitshare'			:'quitshare',
		'click .show-member'		:'showMember',
		'click .share'				:'share',
		'click .file-view'			:'preview',
		'click .download'			:'download',
		'click .outchain'			:'createOutChain',
		'click .uploadlink' 		:'createUploadLink',
		'click .remark'				:'editRemark',
		'click .move'				:'move',
		'click .copy'				:'copy',
		'click .rename'				:'rename',
		'click .delete'				:'del',
		'click .history'			:'checkHistory',
		'click .lock'				:'lock',
		'click .setsize'			:'setSize',
		'click .share-manage'		:'stopPropagation',
		'click .outchain-manage'	:'stopPropagation',
		'click .share-setting'		:'setShare',
		'click .share-cancle' 		:'cancleShare',
		'click .outchain-setting'	:'setOutChain',
		'click .outchain-cancle'	:'cancleOutChain',
		'click .outchain-view'		:'viewOutChain',
		'click .outchain-send'		:'sendOutChain',
		'click .uploadlink-setting'	:'setUploadLink',
		'click .uploadlink-cancle'	:'cancleUploadLink',
		'click .uploadlink-view'	:'viewUploadLink',
		'mouseenter li.has-sub'		:'showSubMenu',
		'mouseleave li.has-sub'		:'hideSubMenu'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.model = new Sbox.Models.ContextMenu();

		_.bindAll(this,'render','select');
		this.model.bind('change',this.render);
		this.fileList.bind('contextmenu',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	stopPropagation:function(e){
		e.stopImmediatePropagation();
	},
	select:function(){
		var files = this.fileList.getChecked();
		if(files.length === 0) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedFiles(files);
	},
	upload:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.Upload(file.get('id'),'upload',this.fileList);
		e.preventDefault();
	},
	quitshare:function(e){
		var files = this.fileList.getChecked();
		var _this = this;
		Sbox.Warning({
			title:'退出共享',
			message:'您确定要退出该文件夹共享吗？',
			callback:function(f){
				if(f){
					_this.fileList.quitshare(files);
				}
			}
		})
		e.preventDefault();
	},
	showMember:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.ViewShareMember(file);
		e.preventDefault();
	},
	editRemark:function(e){ //编辑备注
		var file = this.fileList.getChecked()[0];
		Sbox.EditRemark(file);
		e.preventDefault();
	},
	lock:function(e){//上锁
		var file = this.fileList.getChecked()[0];
		Sbox.Lock(file);
		e.preventDefault();
	},
	preview:function(e){
		var files = this.fileList.getChecked();
		if(isPreviewImgFile(files[0].get('name'),files[0].get('size'))){
			Sbox.Preview(files[0],this.fileList);
		}else{
			window.open('/getFileOnline/' + files[0].get('id'));
			//window.open('/GetFile!getFileOnLineLink.action?resourceId='+files[0].get('id'));
		}
		e.preventDefault();
	},
	download:function(e){ //下载
		var files = this.fileList.getChecked();
		Sbox.Download(files);
		// _(files).each(function(file){
		// 	window.open('/GetFile!getFile.action?resourceId='+file.get('id')+'&length='+file.get('size'))
		// })
		e.preventDefault();
	},
	rename:function(e){ //重命名
		var file = this.fileList.getChecked()[0];
		Sbox.ReName(file);
		e.preventDefault();
	},
	move:function(e){ //移动
		var files = this.fileList.getChecked();
		Sbox.Move(files,false,this.fileList,this.path.get('type'));
		e.preventDefault();
	},
	copy:function(e){ //复制
		var files = this.fileList.getChecked();
		Sbox.Move(files,true,this.fileList,this.path.get('type'));
		e.preventDefault();
	},
	del:function(e){ //删除
		var files = this.fileList.getChecked();
		Sbox.DeleteFile(this.fileList,files);
		e.preventDefault();
	},
	checkHistory:function(e){ //查看历史版本
		//alert('历史版本')
		var file = this.fileList.getChecked()[0];
		window.open('/history/' + file.get('id') + '/' + file.get('versionNumber'));
		// window.open('/HistoryVersion!getHistory.action?resourceId=' + file.get('id') + '&versionNumber=' +  file.get('versionNumber') );
		e.preventDefault();
	},
	setSize:function(e){ //设置文件夹大小
		var file = this.fileList.getChecked()[0];
		Sbox.SetSize(file);
		e.preventDefault();
	},
	share:function(e){ //共享
		var file = this.fileList.getChecked()[0];
		Sbox.Share(file);
		e.preventDefault();
	},
	setShare:function(e){ //设置共享
		var file = this.fileList.getChecked()[0];
		Sbox.Share(file);
		e.preventDefault();
	},
	cancleShare:function(e){ //取消共享
		var file = this.fileList.getChecked()[0];
		Sbox.CancleShare(file);
		e.preventDefault();
	},
	createOutChain:function(e){ //生成外链
		var file = this.fileList.getChecked()[0];
		// file.createOutChain();
		Sbox.CreateOutChain(file)
		//file.getOutChain();
		e.preventDefault();
	},
	viewOutChain:function(e){ //查看外链
		var file = this.fileList.getChecked()[0];
		file.getOutChain(); 
		e.preventDefault();
	},
	setOutChain:function(e){ //设置外链
		var file = this.fileList.getChecked()[0];
		file.editOutChain();
		e.preventDefault();
	},
	cancleOutChain:function(e){ //取消外链
		var file = this.fileList.getChecked()[0];
		Sbox.DeleteOutChain([file],this.fileList);
		e.preventDefault();
	},
	sendOutChain:function(e){ //发送外链
		var file = this.fileList.getChecked()[0];
		Sbox.SendOutChain(file);
		e.preventDefault();
	},
	createUploadLink:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.CreateUploadLink(file)
		e.preventDefault();
	},
	setUploadLink:function(e){
		var file = this.fileList.getChecked()[0];
		file.editUploadLink();
		e.preventDefault();
	},
	cancleUploadLink:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.DeleteUploadLink([file],this.fileList);
		e.preventDefault();
	},
	viewUploadLink:function(e){
		var file = this.fileList.getChecked()[0];
		file.getUploadLink(); 
		e.preventDefault();
	},
	showSubMenu:function(e){ //显示二级菜单
		var li = $(e.currentTarget),
			subMenu = li.find('ul.dropdown');
		var winW = $(window).width(),
			winH = $(window).height(),
			pos = li.offset(),
			h = subMenu.height();
		subMenu.css('left',pos.left + 120 * 2 > winW - 10 ? -125 : 121);
		if(pos.top + h > winH){
			subMenu.css({
				top:'auto',
				bottom:-8
			})
		}else{
			subMenu.css({
				top:-8,
				bottom:'auto'
			})
		}

		li.addClass('hover');
	},
	hideSubMenu:function(e){ //隐藏二级菜单
		var li = $(e.currentTarget);
		li.removeClass('hover');
		li.find('ul.dropdown').css({
			left:-9999,
			top:-9999,
			bottom:'auto'
		})
	}
})

//sort
/**
 * 排序
 * @class FileSortView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.FileSortView = Backbone.View.extend({/** @lends Sbox.Views.FileSortView*/
	className:'list-header',
	template:_.template($('#file-sort-template').html()),
	events:{
		'click .checkbox':'checkAll',
		'click .name':'sortByName',
		'click .size':'sortBySize',
		'click .usedsize':'sortByUsedSize',
		'click .create-time':'sortByCreateTime',
		'click .expire-time':'sortByExpireTime',
		'click .down-count':'sortByDownCount',
		'click .time':'sortByTime'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		_.bindAll(this,'render','toggleChecked','cancelSort');
		this.fileList.bind('change',this.toggleChecked);
		this.fileList.bind('reset',this.toggleChecked);
		this.fileList.bind('path.load',this.cancelSort)
	},
	render:function(){
		this.$el.html(this.template({path:true}));
		return this;
	},
	toggleChecked:function(){
		var files = this.fileList.getChecked();
		if(this.fileList.length === 0 || (files.length !== this.fileList.length)) this.$el.find('.checkbox .icon').removeClass('icon-checked').addClass('icon-unchecked');
		else this.$el.find('.checkbox .icon').removeClass('icon-unchecked').addClass('icon-checked');
	},
	cancelSort:function(){
		this.$('.col').removeClass('asc').removeClass('desc');
	},
	checkAll:function(e){
		var target = $(e.currentTarget),
			checked = target.find('span').hasClass('icon-unchecked');
		checked ? this.fileList.checkAll() : this.fileList.uncheckAll();
	},
	sortByName:function(e){ //按名字排序
		var target = $(e.currentTarget);
		if(!(target.hasClass('asc') || target.hasClass('desc')))
			this.$el.find('.col').removeClass('asc').removeClass('desc');
		this.sortBy(e,'name');
	},
	sortBySize:function(e){ //按文件大小排序
		var target = $(e.currentTarget);
		if(!(target.hasClass('asc') || target.hasClass('desc')))
			this.$el.find('.col').removeClass('asc').removeClass('desc');
		this.sortBy(e,'size');
	},
	sortByUsedSize:function(e){ //按匿名上传大小排序
		var target = $(e.currentTarget);
		if(!(target.hasClass('asc') || target.hasClass('desc')))
			this.$el.find('.col').removeClass('asc').removeClass('desc');
		this.sortBy(e,'usedSize');
	},
	sortByTime:function(e){ //按文件修改时间排序
		var target = $(e.currentTarget);
		if(!(target.hasClass('asc') || target.hasClass('desc')))
			this.$el.find('.col').removeClass('asc').removeClass('desc');
		this.sortBy(e,'modifyTime');
	},
	sortByCreateTime:function(e){ //按创建时间排序
		var target = $(e.currentTarget);
		if(!(target.hasClass('asc') || target.hasClass('desc')))
			this.$el.find('.col').removeClass('asc').removeClass('desc');
		this.sortBy(e,'createTime');
		
	},
	sortByExpireTime:function(e){
		var target = $(e.currentTarget);
		if(!(target.hasClass('asc') || target.hasClass('desc')))
			this.$el.find('.col').removeClass('asc').removeClass('desc');
		this.sortBy(e,'expiredate')
	},
	sortByDownCount:function(e){
		var target = $(e.currentTarget);
		if(!(target.hasClass('asc') || target.hasClass('desc')))
			this.$el.find('.col').removeClass('asc').removeClass('desc');
		this.sortBy(e,'downCount')
	},
	sortBy:function(e,attr){
		var target = $(e.currentTarget),
			asc = target.hasClass('asc');
		var tmp = this.fileList.groupBy(function(file){
			return (typeof file.get('parentDir') !== 'undefined') ? 1 : 0;
		});
		for(var type in tmp){
			if(attr === 'size' && type === '1') continue;
			if(attr === 'name'){
				if(this.fileList.models[0].get(attr)){
					tmp[type].sort(function(file1,file2){
						return (asc ? 1 : -1) * file1.get(attr).localeCompare(file2.get(attr))
					});
				}else{
					tmp[type].sort(function(file1,file2){
						return (asc ? 1 : -1) * file1.get('nickName').localeCompare(file2.get('nickName'))
					});
				}

			}else if(attr === 'size' || attr === 'usedSize'){
				tmp[type].sort(function(file1,file2){
					return (asc ? 1 : -1) * (file1.get(attr) - file2.get(attr));
				})
			}else if(attr === 'modifyTime' || attr === 'createTime' || attr === 'expiredate'){
				tmp[type].sort(function(file1,file2){
					var d1 = file1.get(attr).split(' '),
						d2 = file2.get(attr).split(' ');
					d1 = d1[0].split('-').concat(d1[1].split(':'));
					d2 = d2[0].split('-').concat(d2[1].split(':'));
					d1[1] --;
					d2[1] --;
					return (asc ? 1 : -1) * (new Date(d1[0],d1[1],d1[2],d1[3],d1[4],d1[5]) - new Date(d2[0],d2[1],d2[2],d2[3],d2[4],d2[5]));
				})
			}else if(attr === 'downCount'){
				tmp[type].sort(function(file1,file2){
					var c1 = file1.get(attr) === '' ? 0 : parseInt(file1.get(attr)),
						c2 = file2.get(attr) === '' ? 0 : parseInt(file2.get(attr))
					return (asc ? 1 : -1) * (c1 - c2);

				})
			}
		}
		asc ? target.removeClass('asc').addClass('desc') : target.removeClass('desc').addClass('asc');
		this.fileList.models = [].concat(tmp['1'] || [],tmp['0'] || []);
		this.fileList.trigger('reset');
	}
})

//fileList
/**
 * 文件列表
 * @class FileListView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.FileListView = Backbone.View.extend({/** @lends Sbox.Views.FileListView*/
	className:'list-body',
	template:_.template($('#file-list-tempate').html()),
	events:{
		'mouseenter li.file'	: 'hover',
		'mouseleave li.file'	: 'leave',
		'click li.file'			: 'check',
		//'mousedown li.file'		: 'contextmenu',
		'contextmenu li.file'	: 'contextmenu',
		'dblclick li.file'		: 'gotoPath'
	},
	initialize:function(){
		var _this = this;
		this.currentElement = null;
		this.showType = this.options.showType || $.cookie('showtype') || 'listview';
		this.fileList = this.options.fileList;
		this.path = this.options.path;

		_.bindAll(this,'render','addOne','addAll','refresh','loading','changeView','deleteStart','deleteEnd','copyStart','copyEnd','moveStart','moveEnd','quitBegin','quitEnd','deleteOutChainBegin','deleteOutChainEnd','deleteUploadLinkBegin','deleteUploadLinkEnd');
		this.fileList.bind('add',this.addOne);
		this.fileList.bind('reset',this.addAll);
		this.fileList.bind('delete.start',this.deleteStart);
		this.fileList.bind('delete.end',this.deleteEnd);
		this.fileList.bind('copy.start',this.copyStart);
		this.fileList.bind('copy.end',this.copyEnd);
		this.fileList.bind('move.start',this.moveStart);
		this.fileList.bind('move.end',this.moveEnd);
		this.fileList.bind('quit.begin',this.quitBegin);
		this.fileList.bind('quit.end',this.quitEnd);
		this.fileList.bind('view.change',this.changeView);
		//this.fileList.bind('change',this.render);
		this.path.bind('path.load',this.refresh);
		this.fileList.bind('reload',this.refresh);
		this.fileList.bind('loading',this.loading);

		this.fileList.bind('deleteoutchain.begin',this.deleteOutChainBegin);
		this.fileList.bind('deleteoutchain.end',this.deleteOutChainEnd);
		this.fileList.bind('deleteuploadlink.begin',this.deleteUploadLinkBegin);
		this.fileList.bind('deleteuploadlink.end',this.deleteUploadLinkEnd);
		this.fileList.bind('hidecontexmenu',function(){
			_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
		})

		$(document).on('click',function(){
			_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
		})

		//this.refresh();
	},
	render:function(){
		var _this = this;
		this.$el.html(this.template({showtype:111})); //默认显示listview
		var ulist = this.$('.files');
		this.$('.files').attr('class','files clearfix ' + this.showType);


		this.$el.find('ul.files').mousedown(function(e){
            if((e.target || e.srcElement) === this){
            	_this.currentElement = null;
                setTimeout(function(){
                	_this.fileList.uncheckAll();
                },20);
            }
            if(!$(e.target).is('input') && _this.$el.find('.active')[0]){
            	_this.$el.find('.active input').blur();
            	e.preventDefault();
            	e.stopImmediatePropagation();
            }

        })
		this.$el.find('ul.files').on('mousedown','li.selected',function(e){
			var files = _this.fileList.getChecked();
			if(files[0].get('acl') || files[0].get('email') || files[0].get('isShareFile') || files[0].get('power') === 1 || files[0].get('power') === 2) return; //如果是共享根目录，或者是用户，或者是共享下的文件，那么不能移动；
			if($(e.target).is('input')) return; //如果是输入框，那么不拖放
			_this.isDraggingFile = true;

			if(!_this.dragFileTip){
				_this.dragFileTip = $('<div class="drag-file-info"><span></span><em></em></div>').appendTo($('body'));
			}
			_this.dragFileTip.find('em').text(_this.fileList.getChecked().length);
			_this.dragFileTip.css({
				left:-9999,
				top:-9999
			});
			// $('li.isfile,li.isfile a,li.isfile .icon,li.selected,li.selected a,li.selected .icon').css({
			// 	cursor:'no-drop'
			// })
		})
		$(document).on('mousemove',function(e){
			if(!_this.isDraggingFile) return;
			var left = e.pageX,top = e.pageY;
			_this.dragFileTip.css({
				left:left + 2,
				top:top + 2
			})
			e.stopImmediatePropagation();
		}).on('mouseup','li.file',function(e){
			if(_this.isDraggingFile){
				var id = $(this).attr('_id'),
					files = _this.fileList.getChecked();
				var flag = true;
				_(files).each(function(file){ 
					if(file.get('id') === id) flag = false; //如果目标是选中的文件夹 则不移动
					if(file.get('shareFlag')) flag = false; //选中的文件中有被共享的文件夹  则不移动
				})
				if(!_this.fileList.get(id).get('parentDir')) flag = false; //目标是文件

				if(flag){
					_this.fileList.moveFiles(files,false,id);
				}
			}

		}).on('mouseup',function(){
			_this.isDraggingFile = false;
			if(_this.dragFileTip){
				_this.dragFileTip.css({
					left:-9999,
					top:-9999
				})
			}
			// $('li.isfile,li.isfile a,li.isfile .icon,li.selected,li.selected a,li.selected .icon').css({
			// 	cursor:''
			// })
		})
		if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
			this.$el.find('ul.files')
			.drag("start",function( ev, dd ){
				var target = ev.target || ev.srcElement;
				if($(target).hasClass('icon') || $(target).is('a') || $(target).hasClass('file-type')) return false;
				_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
				if(_this.$el.find('.active')[0]){
					return false;
				}
				if(_this.isDraggingFile) return false;

				_this.isDragging = true;

				if(!ev.ctrlKey && !ev.shiftKey){
	            	_this.fileList.uncheckAll();
	            }

				return $('<div class="selection" />')
					.css('opacity', .65 )
					.appendTo( document.body );
			})
			.drag(function( ev, dd ){
				$( dd.proxy ).css({
					top: Math.min( ev.pageY, dd.startY ),
					left: Math.min( ev.pageX, dd.startX ),
					height: Math.abs( ev.pageY - dd.startY ),
					width: Math.abs( ev.pageX - dd.startX )
				});
			})
			.drag("end",function( ev, dd ){

				_this.isDragging = false;
				$( dd.proxy ).remove();
			});

        	$.drop({ multi: true });
		} 

		if(supportHtml5){
			try{
				ulist[0].addEventListener('dragleave',function(e){
		            e.preventDefault();
		            e.stopPropagation();
					var path = _this.path,
						type = path.get('type'),
						acl = path.get('acl');
					if(type === 'share' && (acl === null || acl === 1 || acl === 4)) return;
					$(this).css({
		        		border:'none',
		        		margin:0
		        	})
		        })

		        ulist[0].addEventListener('dragenter',function(e){
		            e.preventDefault();
		            e.stopPropagation();
					var path = _this.path,
						type = path.get('type'),
						acl = path.get('acl');
					if(type === 'share' && (acl === null || acl === 1 || acl === 4)) return;
		        	$(this).css({
		        		border:'2px dashed #BCE',
		        		margin:'-2px 0'
		        	})
		        })

		        ulist[0].addEventListener("dragover", function(e){  
				    e.stopPropagation();  
				    e.preventDefault();  
				    var path = _this.path,
						type = path.get('type'),
						acl = path.get('acl');
					if(type === 'share' && (acl === null || acl === 1 || acl === 4)) return;
		        	$(this).css({
		        		border:'2px dashed #BCE',
		        		margin:'-2px 0'
		        	})
				}); 

		        ulist[0].addEventListener('drop',function(e){
		            e.preventDefault();
		            e.stopPropagation();
					$(this).css({
		        		border:'none',
		        		margin:0
		        	})

		            var files = e.dataTransfer.files;
		            console.log(files)
		            if(files.length === 0) return;
					var path = _this.path,
						type = path.get('type'),
						acl = path.get('acl');
					if(type === 'share' && (acl === null || acl === 1 || acl === 4)) return;
		            Sbox.Upload(_this.path,'upload',_this.fileList,files)
		            
		        })
			}catch(e){}
		}

		return this
	},
	addOne:function(file){ //新建的时候
		var _this = this;
		if(this.fileList.length === 1){
			this.$('.files').empty();
			this.$('.files').attr('class','files clearfix ' + this.showType);
		}
		file.set({
			power:_this.path.get('acl'),
			isShareFile:_this.path.get('type') === 'share'
		})
		var fileItemView = new Sbox.Views.FileItemView({model:file,type:this.showType,fileList:this.fileList,path:this.path});
		this.$('.files').prepend(fileItemView.render().el);

		var parent = this.path.get('pathId');
		var filename = fileItemView.$el.find('.file-name'),
			input = filename.find('input');
		filename.addClass('active');
		setTimeout(function(){
			input.focus();
			input.select();
		},30)

		if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
			fileItemView.$el.drop("start",function(){
	            $( this ).addClass("active");
	        })
	        .drop(function( ev, dd ){
	            var id = $(this).attr('_id');
	            _this.fileList.toggelCheckById(id);
	        })
	        .drop("end",function(){
	            $( this ).removeClass("active");
	        });
	    }
	},
	addAll:function(){ //刷新的时候
		var _this = this;
		this.currentElement = null;
		if(this.fileList.length > 0){
			this.$('.files').attr('class','files clearfix ' + this.showType);
			if(this.fileList.at(0).get('code')){
				Sbox.Login();
				return;
			}
			var pathId = this.path.get('pathId'),
				uId = this.path.get('uid'),
				file0 = this.fileList.at(0),
				isUser = file0.get('email'),
				isDir = file0.get('parentDir'),
				parentDirId;

				if(isUser){ //如果是用户列表，那么parentDirId就是root
					parentDirId = 'root';
				}else if(isDir){//如果第一个是文件夹，那么parentDirId就是该文件夹的parentDir属性
					parentDirId = isDir;
				}else{//否则是文件，那么parentDirId就是该文件夹的belongDir属性
					parentDirId = file0.get('belongDir');
					parentDirId = parentDirId == userId ? 'root' : parentDirId;//如果文件的belongDir是用户的id，那么将id替换成root
				}
			//console.log('pathId=' + pathId + ' uId=' + uId + ' parentDirId=' + parentDirId);
			if(parentDirId != pathId && parentDirId != uId && !(this.path.get('type') === 'public' && pathId === 'public')) return;  //当前选中的文件夹id跟最后返回过来的数据的父目录id进行对比，如果不一样，那就什么都不做
																	 //解决多个目录切换过快的时候先点击的文件夹的数据比后点击的文件夹的数据后返回的问题
			this.$('.files').empty();
			this.fileList.each(function(file){
				file.set({
					power:_this.path.get('acl'),
					isShareFile:_this.path.get('type') === 'share'
				})
				var fileItemView = new Sbox.Views.FileItemView({model:file,type:_this.showType,fileList:_this.fileList,path:_this.path});
				_this.$('.files').append(fileItemView.render().el);
			})

			if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
				this.$el.find('.file')
		        .drop("start",function(){
		            $( this ).addClass("active");
		        })
		        .drop(function( ev, dd ){
		            var id = $(this).attr('_id');
		            _this.fileList.toggelCheckById(id);
		        })
		        .drop("end",function(){
		            $( this ).removeClass("active");
		        });

		        $.drop({ multi: true });
		    }
		}else{
			//如果没有文件呢，操。
			this.$('.files').empty();
			this.$('.files').attr('class','files');
			if(this.path.get('type') === 'share' && this.path.get('pathId') === 'root'){
				this.$('.files').append($('<li class="not-get-shared">您还没有收到共享文件！ </li>'))
			}else{
				this.$('.files').append($('<li style="text-align:center; padding:20px 0; color:gray; font-size:16px;">该目录下还没有文件！ </li>'))	
			}
		}
	},
	refresh:function(){
		var fileList = this.fileList;
		fileList.trigger('loading');
		fileList.fetch({
			data:{
				id:this.path.get('pathId') === '' ? 'root' : this.path.get('pathId'),
				uid:this.path.get('uid'),
				acl:this.path.get('acl'),
				_t:Math.random()
			}
		})
	},
	loading:function(){
		this.$('.files').empty();
		this.$('.files').attr('class','files');
		this.$('.files').append($('<li style="text-align:center; padding:20px 0; color:gray;"><span class="icon icon-loading"></span> 正在加载...</li>'))
	},
	deleteStart:function(){
		this.loading = Sbox.Loading('正在删除请稍候...');
	},
	deleteEnd:function(r){
		var _this = this,
			c = this.fileList,
			m;
		var succFiles = [], failFiles = [];
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code === 200){
				m = c.get(file.id);
				c.remove(m);
				succFiles.push(m);
			}else{
				failFiles.push(c.get(file.id));
			}
		});
		this.loading.remove();
		if(failFiles.length === 0){
			Sbox.Success('删除成功');
		}else{
			Sbox.Fail('文件删除失败。');
		}
		Sbox.deleteNodeToTree(succFiles);

		c.trigger('reset');
		Sbox.RefreshUsage();
	},
	copyStart:function(){
		this.loading = Sbox.Loading('正在复制请稍候...');
	},
	copyEnd:function(r,targetId){
		var _this = this,
			c = this.fileList,
			m,copy;
		var succFiles = [], failFiles = [],copyFiles = [],failCode;
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code === 200){
				m = c.get(file.id);
				succFiles.push(m);
				copy = m.clone();
				copy.set({
					id:file.result.newId
				},{silent:true});
				copyFiles.push(copy);
			}else{
				if(!failCode) failCode = file.result.code;
				failFiles.push(c.get(file.id));
			}
		});
		this.loading.remove();
		if(failFiles.length === 0){
			Sbox.Success('复制成功');
		}else {
			if(failCode === 302){
				Sbox.Fail(failFiles.length + '个文件复制失败，目标目录已存在同名文件',2);
			}else if(failCode === 500 || failCode === 501){
				Sbox.Fail('不能将文件复制到自己或其子目录下',2)
			}else{
				Sbox.Fail('复制失败');
			}
		}
		Sbox.addNodeToTree(targetId,copyFiles,'mine');
		c.trigger('reset');
	},
	moveStart:function(){
		this.loading = Sbox.Loading('正在移动请稍候...');
	},
	moveEnd:function(r,targetId){
		var _this = this,
			c = this.fileList,
			m;
		var targetDir = c.get(targetId);
		var succFiles = [], failFiles = [],failCode;
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code === 200){
				m = c.get(file.id);
				m.set('name',file.name);
				if(m.get('parentDir') && targetDir && !targetDir.get('hasSon')){
					targetDir.set({hasSon:1},{silent:true});
				}
				c.remove(m);
				succFiles.push(m);
			}else{
				if(!failCode) failCode = file.result.code;
				failFiles.push(c.get(file.id));
			}
		});
		this.loading.remove();
		if(failFiles.length === 0){
			Sbox.Success('移动成功');
		}else{
			if(failCode === 503){
				Sbox.Fail(failFiles.length + '个文件移动失败，目标目录已存在同名文件',2);
			}else if(failCode === 500 || failCode === 501 || failCode === 601){
				Sbox.Fail('不能将文件移动到自己或其子目录下',2)
			}else if(failCode === 504){
				Sbox.Fail('空间不足')
			}else{
				Sbox.Fail('移动失败');
			}
		}
		Sbox.deleteNodeToTree(succFiles);
		Sbox.addNodeToTree(targetId,succFiles,'mine');
		Sbox.addNodeToTree(targetId,succFiles,'public');
		c.trigger('reset');
	},
	quitBegin:function(){
		this.loading = Sbox.Loading('正在退出...');
	},
	quitEnd:function(r){
		var _this = this,
			c = this.fileList,
			m;
		var succFiles = [], failFiles = [];
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code === 200){
				m = c.get(file.id);
				c.remove(m);
				succFiles.push(m);
			}else{
				failFiles.push(c.get(file.id));
			}
		});
		this.loading.remove();
		if(failFiles.length === 0){
			Sbox.Success('退出共享成功');
		}else{
			Sbox.Fail('退出共享失败。');
		}
		Sbox.deleteNodeToTree(succFiles);

		c.trigger('reset');
	},
	deleteOutChainBegin:function(){
		this.loading = Sbox.Loading('正在取消请稍候...');
	},
	deleteOutChainEnd:function(r){
		var _this = this,
			c = this.fileList,
			m;
		var flag = true;
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code !== 200){
				flag = false;
			}else{
				c.get(file.id).set({hasOutChain:false,outlink:null,hasPassword:0});
			}
		});
		this.loading.remove();
		if(flag){
			Sbox.Success('取消外链成功');
		}else{
			Sbox.Fail('取消外链失败。');
		}
	},
	deleteUploadLinkBegin:function(){
		this.loading = Sbox.Loading('正在关闭请稍候...');
	},
	deleteUploadLinkEnd:function(r){
		var _this = this,
			c = this.fileList,
			m;
		var flag = true;
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code !== 200){
				flag = false;
			}else{
				c.get(file.id).set({anonymousUpload:false,uploadlink:null});
			}
		});
		this.loading.remove();
		if(flag){
			Sbox.Success('关闭匿名上传成功');
		}else{
			Sbox.Fail('关闭匿名上传失败。');
		}
	},
	changeView:function(type){
		this.showType = type;
		this.fileList.trigger('reset');
	},
	hover:function(e){
		if(this.isDragging) return;
		var target = $(e.currentTarget);
		target.addClass('hover');
		if(target.hasClass('ismine')){
			target.addClass('ismine-hover')	
		}
	},
	leave:function(e){
		var target = $(e.currentTarget);
		target.removeClass('hover');
		if(target.hasClass('ismine')){
			target.removeClass('ismine-hover')	
		}
		target.find('.more-operation').hide();
	},
	check:function(e){
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id),
			items = this.$el.find('.list-item');
		if(!m) return;

		var srcTarget = e.target || e.srcElement;
		if($(srcTarget).hasClass('icon-checked') || $(srcTarget).hasClass('icon-unchecked')){
			//m.set({checked:checked});
			return;
		}else{
			if(!e.ctrlKey && !e.shiftKey || this.currentElement === null){ //如果没有按住ctrl 或者 shift 或者是第一次点击，那么记录当前的element
                this.currentElement = target;
                if(!e.ctrlKey && !e.shiftKey){
                	if(m.get('checked') && (c.getChecked().length === 1)){
		                
		                setTimeout(function(){
		                	m.set({checked:false});
		                },30)
                	}else{
		                setTimeout(function(){
		                	c.uncheckAll();
		                	m.set({checked:true});
		                },30)
                	}
                }
            }
            if(e.ctrlKey){ //如果按住了ctrl，切换选中状态。
                m.set({checked:!m.get('checked')});
            }
            if(e.shiftKey){
                var start = c.getIndexOfById(this.currentElement.attr('_id')),
                    end = c.getIndexOfById(target.attr('_id'));
                if(start > end){
                    start = start + end;
                    end = start - end;
                    start = start - end;
                }
	            c.each(function(v,i){
	                if(i >= start && i <= end){
	                    c.at(i).set({checked:true})
	                }else{
	                    c.at(i).set({checked:false})
	                }
	            })
            }
		}
	},
	contextmenu:function(e){
		if($(e.target || e.srcElement).is('input')) return;
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id),
			items = this.$el.find('.list-item');
		if(!m) return;

    	if(!m.get('checked')){
        	c.uncheckAll();
        	m.set({checked:true});
    	}

    	if(!this.contextMenuElement){
        	this.contextMenuElement = new Sbox.Views.ContextMenu({fileList:this.fileList,path:this.path});
        	$(this.contextMenuElement.el).css({
        		position:'absolute',
        		zIndex:99,
        		left:-9999,
        		top:-9999
        	}).appendTo($('body'));
    	}
        this.fileList.trigger('contextmenu');
        var el = $(this.contextMenuElement.el)
		var x = e.pageX,
			y = e.pageY,
			winH = $(window).height(),
			winW = $(window).width(),
			w = el.width(),
			h = el.height(),
			top,left;
		left = (x + w > winW - 10 ? x - w - 3 : x + 1);
		top  = (y + h > winH - 10 ? y - h - 13 : y + 1);
		if(el.find('li')[0]){
			el.css({
				top:top,
				left:left
			}).show();
		}else{
			el.hide();
		}
		e.stopImmediatePropagation();
		e.preventDefault();
	},
	gotoPath:function(e){
		//双击目录
		if($(e.target).is('input')) return; //如果双击输入框
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id);
		if(!m) return;
		if(typeof m.get('parentDir') !== 'undefined'){
			c.trigger('loading');
			var path = this.path.get('path') + '/' + m.get('name');
			this.path.addCache([path]);
			Sbox.addNodeToTree(this.path.get('pathId') || this.path.get('uid'),[m],this.path.get('type'),'update');
			Backbone.history.navigate( '!' + path,true);
		}else if(m.get('email')){
			c.trigger('loading');
			var path = this.path.get('path') + '/' + m.get('nickName') ;//+ '<' + m.get('email') + '>';
			this.path.addCache([path]);
			Sbox.addNodeToTree(this.path.get('pathId'),[m],this.path.get('type'),'update');
			Backbone.history.navigate( '!' + path,true);
		}else{
			//文件
		}
	}
})

//fileitem
/**
 * 文件
 * @class FileItemView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.FileItemView = Backbone.View.extend({/** @lends Sbox.Views.FileItemView*/
	tagName:'li',
	className:'file',
	listTemplate:_.template($('#listview-file-template').html()),
	previewTemplate:_.template($('#preview-file-template').html()),
	events:{ //各种快捷操作的点击事件绑定
		'click .checkbox'			: 'check',
		'click .file-name a'		: 'openFile',
		'click .file-icon a'		: 'openFile',
		//'click .star'				: 'toggleStar',
		'click .remark'				: 'editRemark',
		'click .lock'				: 'lock',
		'click .unlock'				: 'lock',
		'click .download'			: 'download',
		'click .outchain'			: 'createOutChain',
		'click .rename'				: 'rename',
		'click .move'				: 'move',
		'click .copy'				: 'copy',
		'click .delete'				: 'del',
		'click .history'			: 'checkHistory',
		'click .setsize'			: 'setSize',
		'click .upload'				: 'upload',
		'click .share'				: 'share',
		'click .more'				: 'showMore',
		'click .file-remark input'	: 'stopPropagation',
		'click .file-name input'	: 'stopPropagation',
		'blur .file-remark input'	: 'onBlurUpdateRemark',
		'keypress .file-remark input'	: 'onEnterUpdateRemark',
		'blur .file-name input' 	: 'onBlurUpdateName',
		'keypress .file-name input'	: 'onEnterUpdateName'
	},
	initialize:function(){
		this.type = this.options.type;
		this.fileList  = this.options.fileList;
		this.path = this.options.path;
		_.bindAll(this,'render',
			'updateName',
			'addFail',
			'addSuccess',
			'renameFail',
			'renameSuccess',
			'updateRemark',
			'remarkFail',
			'remarkSuccess',
			'setSizeBegin',
			'setSizeEnd',
			'lockBegin',
			'lockEnd',
			'unLockBegin',
			'unLockEnd',
			'getOutChainBegin',
			'getOutChainEnd',
			'createOutChainBegin',
			'createOutChainEnd',
			'sendOutChainBegin',
			'sendOutChainEnd',
			'beforeEdit',
			'editOutChainBegin',
			'editOutChainEnd',
			'getUploadLinkBegin',
			'getUploadLinkEnd',
			'createUploadLinkBegin',
			'createUploadLinkEnd',
			'editUploadLinkBefore',
			'editUploadLinkBegin',
			'editUploadLinkEnd');
		this.model.bind('change',this.render);
		// this.model.bind('change:name',this.updateName);
		this.model.unbind('change:note');
		this.model.bind('change:note',this.updateRemark);
		this.model.unbind('add.fail');
		this.model.bind('add.fail',this.addFail);
		this.model.unbind('add.success');
		this.model.bind('add.success',this.addSuccess);
		this.model.unbind('rename.fail');
		this.model.bind('rename.fail',this.renameFail);
		this.model.unbind('rename.success');
		this.model.bind('rename.success',this.renameSuccess);
		this.model.unbind('remark.fail');
		this.model.bind('remark.fail',this.remarkFail);
		this.model.unbind('remark.success');
		this.model.bind('remark.success',this.remarkSuccess);
		this.model.unbind('setsize.begin');
		this.model.bind('setsize.begin',this.setSizeBegin);
		this.model.unbind('setsize.end');
		this.model.bind('setsize.end',this.setSizeEnd);
		this.model.unbind('lock.begin');
		this.model.bind('lock.begin',this.lockBegin);
		this.model.unbind('lock.end');
		this.model.bind('lock.end',this.lockEnd);
		this.model.unbind('unlock.begin');
		this.model.bind('unlock.begin',this.unLockBegin);
		this.model.unbind('unlock.end');
		this.model.bind('unlock.end',this.unLockEnd);

		this.model.unbind('getoutchain.begin');
		this.model.bind('getoutchain.begin',this.getOutChainBegin);
		this.model.unbind('getoutchain.end');
		this.model.bind('getoutchain.end',this.getOutChainEnd);
		this.model.unbind('createoutchain.begin');
		this.model.bind('createoutchain.begin',this.createOutChainBegin);
		this.model.unbind('createoutchain.end');
		this.model.bind('createoutchain.end',this.createOutChainEnd);
		this.model.unbind('sendoutchain.begin');
		this.model.bind('sendoutchain.begin',this.sendOutChainBegin);
		this.model.unbind('sendoutchain.end');
		this.model.bind('sendoutchain.end',this.sendOutChainEnd);
		this.model.unbind('beforeedit');
		this.model.bind('beforeedit',this.beforeEdit);
		this.model.unbind('editoutchain.begin',this.editOutChainBegin);
		this.model.bind('editoutchain.begin',this.editOutChainBegin);
		this.model.unbind('editoutchain.end',this.editOutChainEnd);
		this.model.bind('editoutchain.end',this.editOutChainEnd);

		this.model.unbind('getuploadlink.begin');
		this.model.bind('getuploadlink.begin',this.getUploadLinkBegin);
		this.model.unbind('getuploadlink.end');
		this.model.bind('getuploadlink.end',this.getUploadLinkEnd);
		this.model.unbind('createuploadlink.begin');
		this.model.bind('createuploadlink.begin',this.createUploadLinkBegin);
		this.model.unbind('createuploadlink.end');
		this.model.bind('createuploadlink.end',this.createUploadLinkEnd);
		this.model.unbind('edituploadlink.before');
		this.model.bind('edituploadlink.before',this.editUploadLinkBefore);
		this.model.unbind('edituploadlink.begin',this.editUploadLinkBegin);
		this.model.bind('edituploadlink.begin',this.editUploadLinkBegin);
		this.model.unbind('edituploadlink.end',this.editUploadLinkEnd);
		this.model.bind('edituploadlink.end',this.editUploadLinkEnd);
	},
	render:function(){
		var type = this.type;
		if(type === 'listview'){
			this.$el.html(this.listTemplate(this.model.toJSON()));
		}else{
			this.$el.html(this.previewTemplate(this.model.toJSON()));
		}
		if(!this.model.isNew()){
			this.$el.attr('_id',this.model.id);
			this.$el.attr('id',this.model.id);
			this.$el.removeClass('isnew');
		}else{
			this.$el.addClass('isnew');
		}

		if(this.model.get('power')) this.$el.addClass('power' + this.model.get('power'));
		//console.log(this.model.get('power'))
		if(this.model.get('creatorId') === userId && this.model.get('power') != 6 && this.model.get('power') != 5 && this.model.get('power') != 1) this.$el.addClass('ismine');
		if(!this.model.get('parentDir')) this.$el.addClass('isfile');

		this.model.get('checked') ? this.$el.addClass('selected'):this.$el.removeClass('selected');

		if(type === 'listview') this.$el.addClass('list-item');
		else this.$el.addClass('preview-item');
		return this;
	},
	addFail:function(){
		this.$('.file-name').addClass('active');
		setTimeout(function(){
			this.$('.file-name input').focus();
		},20)
	},
	addSuccess:function(){
		$('.main-op a.upload').removeClass('upload-disabled');
		$('.main-op a.create').removeClass('create-disabled');
		Sbox.addNodeToTree(this.path.get('pathId'),[this.model],'mine');
		Sbox.addNodeToTree(this.path.get('pathId'),[this.model],'public');
		this.fileList.trigger('restat');
	},
	renameFail:function(){
		this.$('.file-name').addClass('active');
		setTimeout(function(){
			this.$('.file-name input').focus();//.val(_this.model.get('name'))
		},20)
	},
	renameSuccess:function(){
		if(typeof this.model.get('parentDir') !== 'undefined'){
			Sbox.renameNodeToTree(this.model.get('id'),this.model);
		}
	},
	remarkFail:function(){
	    this.$('.file-remark').addClass('active');
	    setTimeout(function(){
	    	this.$('.file-remark input').focus();
	    })
	},
	remarkSuccess:function(){
		//成功
	},
	setSizeBegin:function(){
		this.loading = Sbox.Loading('正在设置请稍候...');
	},
	setSizeEnd:function(r,size){
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			Sbox.Success('设置成功');
			this.model.set({
				size:size * 1024 * 1024
			},{silent:true});
		}else if(r.code === 501){
			Sbox.Fail('设置失败，用户总空间不足');
		}else if(r.code === 502){
			Sbox.Fail('设置失败，不是共享文件夹');
		}else if(r.code === 503){
			Sbox.Fail('设置的大小小于该目录已使用空间');
		}else{
			Sbox.Fail('设置失败');
		}
		this.loading.remove();
	},
	lockBegin:function(){
		this.loading = Sbox.Loading('正在上锁请稍候...');
	},
	lockEnd:function(r){
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.loading.remove();
			Sbox.Success('上锁成功');
			this.model.set({
				lock:1,
				locker:userId
			});
		}
	},
	unLockBegin:function(){
		this.loading = Sbox.Loading('正在解锁请稍候...');
	},
	unLockEnd:function(r){
		this.loading.remove();
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			Sbox.Success('解锁成功');
			this.model.set({
				lock:0
			});
		}else if(r.code === 500){
			Sbox.Fail('只有上锁的用户才有解锁权限')
		}
	},
	getOutChainBegin:function(){
		this.loading = Sbox.Loading('正在获取外链...');
	},
	getOutChainEnd:function(r){
		if(!r){
			Sbox.ShowOutChain(this.model);
			return;
		}
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			//如果已经生成功
			this.loading.remove();
			var outchain = r.outSideChain;
			this.model.set({
				outlink:outchain.outchainStr,
				expiredate:outchain.expiredate,
				memo:outchain.memo,
				password:outchain.password,
				hasPassword:outchain.hasPassword,
				sharePrivilege:outchain.sharePrivilege,
				language:outchain.language
			},{silent:true});
			Sbox.ShowOutChain(this.model)
		}
	},
	beforeEdit:function(r){
		if(!r){
			Sbox.CreateOutChain(this.model);
			return;
		}
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			//如果已经生成功
			var outchain = r.outSideChain;
			this.model.set({
				outlink:outchain.outchainStr,
				expiredate:outchain.expiredate,
				memo:outchain.memo,
				password:outchain.password,
				hasPassword:outchain.hasPassword,
				sharePrivilege:outchain.sharePrivilege,
				language:outchain.language
			},{silent:true});
			Sbox.CreateOutChain(this.model)
		}
	},
	createOutChainBegin:function(){
		this.loading = Sbox.Loading('正在生成外链...');
	},
	createOutChainEnd:function(r,needPass,p,time,note,power,language){
		this.loading.remove();
		var d = new Date();
		d = d.valueOf() + 30 * 24 * 60 * 60 * 1000; //默认过期时间是一个月
		d = new Date(d);
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.model.set({
				outlink:r.outSideChain,
				expiredate:time,
				hasPassword:needPass,
				password:p,
				memo:note,
				sharePrivilege:power,
				language:language,
				hasOutChain:true
			});
			Sbox.ShowOutChain(this.model);
		}else{
			Sbox.Fail('生成失败。');
		}
		console.log(this.model)
	},
	sendOutChainBegin:function(){
		this.loading = Sbox.Loading('正在发送请稍候...');
	},
	sendOutChainEnd:function(r){
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.loading.remove();
			Sbox.Success('发送成功');
		}
	},
	editOutChainBegin:function(){
		this.loading = Sbox.Loading('正在保存请稍候...');
	},
	editOutChainEnd:function(r,needPass,p,time,note,power,language){
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.loading.remove();
			this.model.set({
				hasPassword:needPass,
				password:p,
				expiredate:time,
				memo:note,
				sharePrivilege:power,
				language:language
			},{silent:true});
			Sbox.Success('修改成功');
		}else{
			//Sbox.Alert(r.message);
		}
	},

	getUploadLinkBegin:function(){
		this.loading = Sbox.Loading('正在获取匿名上传链接...');
	},
	getUploadLinkEnd:function(r){
		if(!r){
			Sbox.ShowUploadLink(this.model);
			return;
		}
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			//如果已经生成功
			this.loading.remove();
			var uploadlink = r.outSideChain;
			this.model.set({
				uploadlink:uploadlink.outchainStr,
				expiredate:uploadlink.expiredate,
				password:uploadlink.password
			},{silent:true});
			Sbox.ShowUploadLink(this.model)
		}
	},
	editUploadLinkBefore:function(r){
		if(!r){
			Sbox.CreateUploadLink(this.model);
			return;
		}
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			//如果已经生成功
			var uploadlink = r.outSideChain;
			this.model.set({
				uploadlink:uploadlink.outchainStr,
				expiredate:uploadlink.expiredate,
				password:uploadlink.password
			},{silent:true});
			Sbox.CreateUploadLink(this.model)
		}
	},
	createUploadLinkBegin:function(){
		this.loading = Sbox.Loading('正在生成匿名上传链接...');
	},
	createUploadLinkEnd:function(r,p,time){
		this.loading.remove();
		var d = new Date();
		d = d.valueOf() + 7 * 24 * 60 * 60 * 1000; //默认过期时间是一个月
		d = new Date(d);
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.model.set({
				uploadlink:r.outSideChain,
				expiredate:time,
				password:p,
				anonymousUpload:true
			});
			Sbox.ShowUploadLink(this.model);
		}else{
			Sbox.Fail('生成失败。');
		}
	},
	editUploadLinkBegin:function(){
		this.loading = Sbox.Loading('正在保存请稍候...');
	},
	editUploadLinkEnd:function(r,p,time){
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.loading.remove();
			this.model.set({
				password:p,
				expiredate:time
			},{silent:true});
			Sbox.Success('修改成功');
		}else{
			Sbox.Fail('修改失败');
		}
	},

	check:function(e){//点击复选框时触发，选中当前项，同时阻止时间冒泡以防止触发li上的click事件
		var target = $(e.currentTarget);
		if(target.find('.icon').hasClass('icon-unchecked')){
			this.model.set({checked:true});
		}else{
			this.model.set({checked:false});
		}
		this.fileList.trigger('hidecontexmenu');
		e.stopImmediatePropagation();
	},
	//  toggleStar:function(){ //星标/取消星标
	// 	isStar = this.model.get('star')
	// 	//TODO model需要保存，或者调用model方法
	// 	this.model.set({star:!isStar});
	// },
	openFile:function(e){
		var _this = this;
		if(this.model.get('name') === '') return; //如果点击新建文件夹 fix PAN-1294 @2013-08-30
		if(this.model.get('parentDir')){//如果是目录
			setTimeout(function(){
				_this.fileList.trigger('loading');
			},20)
			var path = this.path.get('path') + '/' + this.model.get('name');
			this.path.addCache([path]);
			Sbox.addNodeToTree(this.path.get('pathId') || this.path.get('uid'),[this.model],this.path.get('type'),'update');
			Backbone.history.navigate( '!' + path,true);
			e.preventDefault();
		}else if(this.model.get('email')){
			setTimeout(function(){
				_this.fileList.trigger('loading');
			},20)
			var path = this.path.get('path') + '/' + this.model.get('nickName') + (this.model.get('isOutDomain') ? '<' + this.model.get('email') + '>' : '');// + '<' + this.model.get('email') + '>';
			this.path.addCache([path]);
			Sbox.addNodeToTree(this.path.get('pathId'),[this.model],this.path.get('type'),'update');
			Backbone.history.navigate( '!' + path,true);
			e.preventDefault();
		}else{
			var filetype = getFileType(this.model.get('name'));
			if(isPreviewImgFile(this.model.get('name'),this.model.get('size'))){ //如果是图片预览
				if(this.path.get('acl') !== 5){ //不能预览的权限
					Sbox.Preview(this.model,this.fileList);	
				}
				e.preventDefault();
			}
			else if(!previewFileType.test(filetype)){
				//Sbox.Fail('不支持该类型文件的在线预览');
				e.preventDefault();
			}else if(this.model.get('size') === 0){
				Sbox.Fail('空文件不支持在线预览');
				e.preventDefault();
			}

		}
	},
	editRemark:function(e){ //编辑备注
		Sbox.EditRemark(this.model);
		//this.$el.removeClass('hover');
		e.stopImmediatePropagation();
		e.preventDefault();
	},
	lock:function(e){//上锁
		Sbox.Lock(this.model);
		e.preventDefault();
	},
	download:function(){ //下载
		//alert('下载')
	},
	createOutChain:function(e){ //生成外链
		this.model.getOutChain();
		e.preventDefault();
	},
	rename:function(e){ //重命名
		Sbox.ReName(this.model);
		this.$('.more-operation').hide();
		e.stopImmediatePropagation();
		e.preventDefault();
	},
	move:function(e){ //移动
		Sbox.Move([this.model],false,this.fileList,this.path.get('type'));
		e.preventDefault();
	},
	copy:function(e){ //复制
		Sbox.Move([this.model],true,this.fileList,this.path.get('type'));
		e.preventDefault();
	},
	del:function(e){ //删除
		file = this.model;
		Sbox.DeleteFile(this.fileList,[file]);
		e.preventDefault();
	},
	checkHistory:function(){ //查看历史版本
		//alert('历史版本')
	},
	setSize:function(e){ //设置文件夹大小
		Sbox.SetSize(this.model);
		e.preventDefault();
	},
	upload:function(e){
		Sbox.Upload(this.model.get('id'),'upload',this.fileList)
		e.preventDefault();
	},
	share:function(e){
		Sbox.Share(this.model);
		e.preventDefault();
	},
	showMore:function(e){
		var op = this.$('.more-operation');
		if(op.is(':hidden')){
			op.show();
		}else{
			op.hide();
		}
		e.stopImmediatePropagation();
		e.preventDefault();
	},
	stopPropagation:function(e){
		e.stopImmediatePropagation();
	},
	updateRemark:function(){
		//this.model.updateRemark();
	},
	onBlurUpdateRemark:function(e){
		var target = $(e.currentTarget),
			val = target.val();
		if(this.model.get('note') === val){
			this.model.trigger('reset');
			return;
		}
		if(val.length > 140){
			Sbox.Error({
				message:'备注不得超过140字',
				callback:function(){
					target.focus();
				}
			})
			return;
		}
		this.model.updateRemark(val);
	},
	onEnterUpdateRemark:function(e){
		if(e.keyCode === 13){
			e.currentTarget.blur();
		}
	},
	updateName:function(){
		//this.model.update();
	},
	onBlurUpdateName:function(e){
		var _this = this;
		var target = $(e.currentTarget);
		var val = $.trim(target.val());
		if(this.model.get('name') !== '' && this.model.get('name') === val){
			 this.model.trigger('reset');
			 return;
		}
		if(notAllow.test(val)){
			Sbox.Error({
				message:'文件名不能包含以下字符 \\ \/ \: \* \? \" \< \> \|',
				onHide:function(){
					target.focus();//.val(_this.model.get('name'))
				}
			});
			return;
		}else if(val.charAt(val.length - 1) === '.'){
			Sbox.Error({
				message:'文件名不能以“.”结尾',
				onHide:function(){
					target.focus();//.val(_this.model.get('name'))
				}
			});
			return;

		}else if(val === ''){
			Sbox.Error({
				message:'文件名不能为空',
				onHide:function(){
					target.focus();//.val(_this.model.get('name'))
				}
			});
			return;
		}else if(val.lastIndexOf('.') >= 0 && val.substring(0,val.lastIndexOf('.')) === ''){
			Sbox.Error({
				message:!this.model.get('parentDir') ? '文件名不能为空' : '文件夹不能以“.”开头',
				onHide:function(){
					target.focus();//.val(_this.model.get('name'))
				}
			});
			return;
		}else if(/^(CON|AUX|COM1|COM2|COM3|COM4|LPT1|LPT2|LPT3|PRN|NUL)$|^(CON|AUX|COM1|COM2|COM3|COM4|LPT1|LPT2|LPT3|PRN|NUL)\./i.test(val)){
			//不能以这些词为文件名，也不能以这些词加“.”开头
			Sbox.Error({
				message:'不允许的文件名',
				onHide:function(){
					target.focus();//.val(_this.model.get('name'))
				}
			})
			return;
		}else if(val.length > 100){
			Sbox.Error({
				message:'文件名不能超过100字',
				onHide:function(){
					target.focus();//.val(_this.model.get('name'))
				}
			})
			return;
		}
		var flag = true;
		this.fileList.each(function(file){
			if(file !== _this.model){
				if(val.toLocaleLowerCase() === file.get('name').toLocaleLowerCase()){
					flag = false;
				}
			}
		});
		if(!flag){
			Sbox.Error({
				message:'该目录已存在同名文件（夹）',
				onHide:function(){
					target.focus();//.val(_this.model.get('name'))
				}
			})
			return;
		}
		if((this.model.get('parentDir') === 'root' || this.model.get('parentDir') == userId) && (val.toLocaleLowerCase() === '我收到的共享文件' || val.toLocaleLowerCase() === '企业共享')){
			Sbox.Error({
				message:'文件名不合法',
				onHide:function(){
					target.focus();//.val(_this.model.get('name'))
				}
			})
			return;
		}

		if(!this.model.isNew() && !this.model.get('parentDir') && getFileType(val) !== getFileType(this.model.get('name'))){
			Sbox.Warning({
				message:'确定修改文件类型？',
				onHide:function(f){
					target.focus();
					return;
				},
				callback:function(f){
					if(f){
						_this.model.update(val);
					}
				}
			});
			return;
		}
		this.model.update(val);
	},
	onEnterUpdateName:function(e){
		if(e.keyCode === 13){
			e.currentTarget.blur();
		}
	}
})
//filestat
/**
 * 当前文件夹状态统计
 * @class FileStatView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.FileStatView = Backbone.View.extend({/** @lends Sbox.Views.FileStatView*/
	className:'file-stat',
	template:_.template($('#file-stat-template').html()),
	initialize:function(){
		this.fileList = this.options.fileList;
		_.bindAll(this,'render');
		this.fileList.bind('reset',this.render);
		this.fileList.bind('restat',this.render);
	},
	render:function(){
		// 先得到文件夹个数，文件个数，然后render
		var folderNum = this.fileList.getFoldNum(),
			fileNum = this.fileList.getFileNum();
		this.$el.html(this.template({
			folderNum:folderNum,
			fileNum:fileNum
		}));
		return this;
	}
})

//filemanage
/**
 * 文件管理
 * @class FileManage 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.FileManage = Backbone.View.extend({/** @lends Sbox.Views.FileManage*/
	className:'list-table file-manage',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
	},
	render:function(){
		var toolbar = new Sbox.Views.ToolBarView({
			fileList : this.fileList,
			path : this.path
		});
		var sort = new Sbox.Views.FileSortView({
			fileList : this.fileList,
			path : this.path
		}); 
		var filelist = new Sbox.Views.FileListView({
			fileList : this.fileList,
			path : this.path
		});
		var filestat = new Sbox.Views.FileStatView({
			fileList : this.fileList
		})
		this.$el.append(toolbar.render().el)
				.append(sort.render().el)
				.append(filelist.render().el)
				.append(filestat.render().el);
		return this;
	}
})

//tree
/**
 * 左侧树形菜单导航
 * @class TreeView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.TreeView = Backbone.View.extend({/** @lends Sbox.Views.TreeView*/
	initialize:function(){
		var _this = this;
		this.type = this.options.type;
		var treeContainer = $('<ul id="'+ this.$el.attr('id') +'Tree" class="ztree">').appendTo(this.$el);
		treeContainer.append('<li style="padding:20px;text-align:center;" class="tree-loading"><span class="icon icon-loading"></span></li>');
		var url;
		if(this.type === 'mine') {
			url = '/GetService!getService.action?_t=' + new Date().valueOf();
		}else if(this.type === 'share'){
			url = '/GetShareDir!getTree.action?_t=' + new Date().valueOf();
		}else if(this.type === 'public'){
			url = '/GetPublicNodeList!getAllnode.action?_t=' + new Date().valueOf();
		}
		var setting = {
            view: {
                autoCancelSelected:false, //是否支持ctrl反选
                dblClickExpand:false, //是否双击打开
                expandSpeed:'fast',//("slow", "normal", or "fast") or 1000
                nameIsHTML:false,//name是否允许html
                selectedMulti:false, //是否支持多选
                showIcon:true,//是否显示icon
                showLine:false,//是否显示虚线
                showTitle:true //是否显示title
            },
            data: {
                keep:{
                    leaf:false, //如果为true则所有子节点都无法添加子节点
                    parent:false //如果为true则表示即使所有子节点全部移除依旧保持父节点状态
                                //所以根据需求这两参数应该不用变了
                },
                key:{ //将各关键属性作一个映射
                    // children:'nodes',//zTree 节点数据中保存子节点数据的属性名称。默认值："children"。
                    //                 //意思就是，将children指定的属性作为节点名称，如{nodes:{...}}
                    // name:'ename', //同上，默认为'name',将ename作为name使用,
                    //title:'title'   //同上,默认为空，自动设置为name名字,否则用fullName替代title
                    // url:'xUrl' //同上，默认为'url'，使用xUrl替代url
                },
                simpleData: { //简单数据相关设置
                    // enable: true, //是否使用简单数据
                    // idKey:'id',     //idKey字段的映射
                    // pIdKey:'pId',   //pIdKey字段的映射
                    // rootPid:1    //修正根节点数据，默认为null
                }
            },
            async:{//异步加载所需参数
                autoParam : ['uid','id'],//需要提交的参数如id=1&name=test，可以修改参数别名如['id=tid']将提交tid=1
                //contentType : "application/x-www-form-urlencoded",//默认的'application/x-www-form-urlencoded'可以满足大部分需要，'application/json'可以进行json数据的提交
                dataFilter : function(treeId,parentNode,childNodes){
                	var _childNodes = []
                	if(childNodes.code === 701 || childNodes.code === 403){
                		Sbox.Login();
                	}else{
	                	_(childNodes).each(function(node){
	                		var o = {}
	                		if(node.email){
	                			o.id = '';
	                			o.uid = node.id;
	                			o.name = node.isOutDomain ? (node.nickName + '<' + node.email + '>') : node.nickName ;//+ '<' + node.email + '>';
	                			o.isParent = true;
	                			o.acl = 1;
	                		}else{
	                			o.uid = '';
		                		o.id = node.id;
		                		o.name = node.name;
		                		o.isParent = node.hasSon  || node.hsaSon ? true : false;
		                		if(parentNode) o.acl =  parentNode.acl;
		                		else if(_this.type === 'public' && userPublicAcl) o.acl = userPublicAcl
		                		if(node.acl) o.acl = node.acl;
	                		}
	                		_childNodes.push(o);
	                	})
                	}
                	return _childNodes;
                }, //对返回的节点数据进行预处理。
                //dataType : "text", //返回的数据类型，一般为text。与jQuery.ajax类型一致。
                enable : true, //是否开启异步加载
                //otherParam : {},//其他自定义的参数如{a:1,b:2}或['a','1','b','2'];
                //type : "post", //请求方式
                url : url
            },
            callback:{ //各种回调
                onClick:function(e,treeId,treeNode){
                    _this.setPath(treeNode);
                    updateWidth();
                },
                onAsyncSuccess:function(e,treeId,treeNode,msg){ //总是在展开成功后,将treeNode交给checkNode处理
				//   if(treeNode && treeNode.children.length === 0){
				// 		treeNode.isParent = false;
				// 		_this.tree.updateNode(treeNode);
				//   }

                    if(!_this.loaded){ //第一次加载成功之后
                        _this.loaded = true;
                    }else{
                        _this.expandNode();
                    }
                    treeNode && (treeNode.loaded = true); //已经加载过的标记为已加载

                    updateWidth();

                    treeContainer.find('li.tree-loading').remove();
                },
                onExpand:function(){
                	updateWidth();
                }
            }
        };
        this.tree = $.fn.zTree.init(treeContainer, setting);

        Sbox.addTree({type:this.type,tree:this.tree});

        this.pathModel = this.options.path;

        _.bindAll(this,'render','expandNode');
        this.pathModel.bind('change',this.render);


        function updateWidth(){
        	var divs = treeContainer.find('.treenode_bg'),
        		width = 216;
        	divs.each(function(){
        		var div = $(this),
        			a = div.find('a'),
        			w = parseInt(div.css('paddingLeft')) + 18 + a.width();
        		if(w > width) width = w;
        	})
        	if(treeContainer.height() > treeContainer.parent().height() && width == 216){
        		width = width - 20;
        	}
        	treeContainer.width(width);
        }
	},
	render:function(){
        var _this = this;
        //每次change都会生成这样一个path
        var path = this.pathModel.get('path');
        this.tmpPath = path;
        path = path.split('/');
        this.path = path.slice(2);
        this.parentNode = null;
        setTimeout(function(){
            if(!_this.loaded){
            	if(!_this.loadTime){
            		_this.loadTime = 1;	
            	}
            	else{
            		_this.loadTime++;
            	}
            	if(_this.loadTime >= 2000){
            		Sbox.Fail('加载失败，请刷新后重试');
            		return;
            	}
                _this.render();
            }else{
		    	if(_this.path.length === 0){
		    		_this.tree.cancelSelectedNode(_this.tree.getSelectedNodes()[0]);
		            _this.pathModel.set({pathId:(_this.type === 'public' ? 'public' : 'root'),uid:'',acl:(_this.type === 'public' && userPublicAcl ? userPublicAcl : null)},{silent:true});
		            _this.pathModel.trigger('path.load');
		    	}
            	_this.expandNode();
            }
        },10);
	},
	expandNode:function(){
        if(!this.path || this.path.length === 0){
            return;
        }
        var name = this.path.shift(),
            parentNode = this.parentNode;
        var node = this.tree.getNodesByFilter(function(node){
            return (node.level === (parentNode?(parentNode.level + 1):0)) && (node.name === name);
        },true,parentNode);

    	if(!node){ //如果找不到下一层，那么不需要在继续向下展开。
    		if(this.parentNode){
	            this.tree.selectNode(this.parentNode);
	           	this.pathModel.set({pathId:this.parentNode.id,uid:this.parentNode.uid},{silent:true});
    		}else{
    			this.tree.cancelSelectedNode(this.tree.getSelectedNodes()[0]);
    			this.pathModel.set({pathId:(this.type === 'public' ? 'public' : 'root'),uid:'',acl:(this.type === 'public' && userPublicAcl ? userPublicAcl : null)},{silent:true});
    		}

           	if(this.parentNode && this.parentNode.acl){
           		this.pathModel.set({acl:this.parentNode.acl},{silent:true});
           	}
           	var correctPath = this.tmpPath.split(name)[0];
           	correctPath = correctPath.substring(0,correctPath.length-1)
           	Backbone.history.navigate('!' + correctPath,false);
           	this.pathModel.set({path:correctPath},{silent:true});
           	this.pathModel.trigger('path.load');
            return;
    	}
        this.parentNode = node;
        if(this.path.length === 0){
            this.tree.selectNode(this.parentNode);
           	this.pathModel.set({pathId:this.parentNode.id,uid:this.parentNode.uid},{silent:true});
           	if(this.parentNode.acl){
           		this.pathModel.set({acl:this.parentNode.acl},{silent:true});
           	}
           	this.pathModel.trigger('path.load');
            return;
        }
        if(node.loaded){
            this.expandNode()
        }else{
        	if(!node.isParent){
	           	var correctPath = this.tmpPath.split(name)[0];
	           	correctPath = correctPath.substring(0,correctPath.length) + name;
	           	Backbone.history.navigate('!' + correctPath,false);
	            this.tree.selectNode(this.parentNode);
	           	this.pathModel.set({pathId:this.parentNode.id,uid:this.parentNode.uid},{silent:true});
	           	this.pathModel.set({path:correctPath},{silent:true});
	           	this.pathModel.trigger('path.load');
	           	return;
        	}
        	this.tree.reAsyncChildNodes(node,'refresh',true); 
        }
	},
    setPath:function(treeNode){
        var path = [], curRoot = this.pathModel.get('path').split('/')[1];
        while(treeNode/* && treeNode.level !== 0*/){
            path.push(treeNode.name);
            treeNode = treeNode.getParentNode();
        }
        path = path.length === 0 ? '!/' + curRoot :'!/'+ curRoot +'/' + path.reverse().join('/');
        this.pathModel.addCache([path.substr(1)]); //如果能够点击，那么肯定是已经从服务器取来的，直接加入缓存
        // this.pathModel.set({pathId:treeNode.id});
        if('#' + path === location.hash){
        	this.pathModel.trigger('path.load');
        }else{
        	Backbone.history.navigate(path,true);
        }
        return path;
    },
    addNode:function(){

    },
    delNode:function(){

    }
});

/**
 * 外链文件
 * @class LinkItemView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.LinkItemView = Backbone.View.extend({/** @lends Sbox.Views.LinkItemView*/
	tagName:'li',
	className:'file',
	template:_.template($('#link-item-template').html()),
	events:{
		'click .checkbox'			: 'check',
		//'click .file-name a'		: 'openFile',
		'click .send'				: 'send',
		'click .copy'				: 'copy',
		'click .edit'				: 'edit',
		'click .del'				: 'del'
	},
	initialize:function(){
		this.type = this.options.type;
		this.fileList  = this.options.fileList;
		_.bindAll(this,'render','sendOutChainBegin','sendOutChainEnd','editOutChainBegin','editOutChainEnd');
		this.model.bind('change',this.render);
		this.model.bind('sendoutchain.begin',this.sendOutChainBegin);
		this.model.bind('sendoutchain.end',this.sendOutChainEnd);
		this.model.bind('editoutchain.begin',this.editOutChainBegin);
		this.model.bind('editoutchain.end',this.editOutChainEnd);
	},
	render:function(){
		var type = this.type;
		this.$el.html(this.template(this.model.toJSON()))
		this.$el.attr('_id',this.model.id);
		this.$el.attr('id','outlink' + this.model.id);
		this.model.get('checked') ? this.$el.addClass('selected'):this.$el.removeClass('selected');
		this.$el.addClass('list-item');
		// if(type === 'listview') this.$el.addClass('list-item');
		// else this.$el.addClass('preview-item');
		return this;
	},
	check:function(e){//点击复选框时触发，选中当前项，同时阻止时间冒泡以防止触发li上的click事件
		var target = $(e.currentTarget);
		if(target.find('.icon').hasClass('icon-unchecked')){
			this.model.set({checked:true});
		}else{
			this.model.set({checked:false});
		}
		this.fileList.trigger('hidecontexmenu');
		e.stopImmediatePropagation();
	},
	sendOutChainBegin:function(){
		this.loading = Sbox.Loading('正在发送请稍候...');
	},
	sendOutChainEnd:function(r){
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.loading.remove();
			Sbox.Success('发送成功');
		}
	},
	editOutChainBegin:function(){
		this.loading = Sbox.Loading('正在保存请稍候...');
	},
	editOutChainEnd:function(r,needPass,p,time,note,power,language){
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.loading.remove();
			this.model.set({
				hasPassword:needPass,
				password:p,
				expiredate:time,
				memo:note,
				sharePrivilege:power,
				language:language
			});
			Sbox.Success('修改成功');
			//Sbox.ShowOutChain(this.model);
		}else{
			//Sbox.Alert(r.message);
		}
	},
	send:function(e){
		Sbox.SendOutChain(this.model);
		e.preventDefault();
	},
	copy:function(e){
		Sbox.ShowOutChain(this.model);
		e.preventDefault();
	},
	edit:function(e){
		Sbox.EditOutChain(this.model);
		e.preventDefault();
	},
	del:function(e){
		Sbox.DeleteOutChain([this.model],this.fileList);
		e.preventDefault();
	},
	stopPropagation:function(e){
		e.stopImmediatePropagation();
	}
});
/**
 * 外链右键菜单
 * @class LinkContextMenu 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.LinkContextMenu = Backbone.View.extend({/** @lends Sbox.Views.LinkContextMenu*/
	className:'dropdown contextmenu',
	template:_.template($('#outchain-toolbar-template').html()),
	events:{
		'click .copy'		:'copy',
		'click .send'		:'send',
		'click .edit'		:'edit',
		'click .del'		:'del'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.model = new Sbox.Models.LinkContextMenu();

		_.bindAll(this,'render','select');
		this.model.bind('change',this.render);
		this.fileList.bind('contextmenu',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	select:function(){
		var files = this.fileList.getChecked();
		if(files.length === 0) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedOutChains(files);
	},
	copy:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.ShowOutChain(file);
		e.preventDefault();
	},
	send:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.SendOutChain(file);
		e.preventDefault();
	},
	edit:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.EditOutChain(file);
		e.preventDefault();
	},
	del:function(e){
		var files = this.fileList.getChecked();
		Sbox.DeleteOutChain(files,this.fileList);
		e.preventDefault();
	}

})
/**
 * 外链列表
 * @class LinkListView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.LinkListView = Backbone.View.extend({/** @lends Sbox.Views.LinkListView*/
	className:'list-body',
	template:_.template($('#file-list-tempate').html()),
	events:{
		'mouseenter li.file'	: 'hover',
		'mouseleave li.file'	: 'leave',
		'click li.file'			: 'check',
		'contextmenu li.file'	: 'contextmenu'
	},
	initialize:function(){
		var _this = this;
		this.currentElement = null;
		this.showType = this.options.showType || 'listview';
		this.fileList = this.options.fileList;

		_.bindAll(this,'render','addAll','deleteBegin','deleteEnd');
		this.fileList.bind('add',this.addOne);
		this.fileList.bind('reset',this.addAll);
		this.fileList.bind('deleteoutchain.begin',this.deleteBegin);
		this.fileList.bind('deleteoutchain.end',this.deleteEnd);

		this.fileList.bind('hidecontexmenu',function(){
			_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
		})

		$(document).on('click',function(){
			_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
		})
	},
	render:function(){
		var _this = this;
		this.$el.html(this.template({showtype:111})); //默认显示listview
		this.$('.files').attr('class','files ' + this.showType);

		this.$el.find('ul.files').mousedown(function(e){
            if((e.target || e.srcElement) === this){
            	_this.currentElement = null;
                _this.fileList.uncheckAll();
            }
        })

		if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
			this.$el.find('ul.files')
			.drag("start",function( ev, dd ){
				var target = ev.target || ev.srcElement;
				if($(target).hasClass('icon') || $(target).is('a')) return false;
				_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
				_this.isDragging = true;

				if(!ev.ctrlKey && !ev.shiftKey){
	            	_this.fileList.uncheckAll();
	            }

				return $('<div class="selection" />')
					.css('opacity', .65 )
					.appendTo( document.body );
			})
			.drag(function( ev, dd ){
				$( dd.proxy ).css({
					top: Math.min( ev.pageY, dd.startY ),
					left: Math.min( ev.pageX, dd.startX ),
					height: Math.abs( ev.pageY - dd.startY ),
					width: Math.abs( ev.pageX - dd.startX )
				});
			})
			.drag("end",function( ev, dd ){

				_this.isDragging = false;
				$( dd.proxy ).remove();
			});

	        $.drop({ multi: true });
	    }

		return this
	},
	deleteBegin:function(){
		this.loading = Sbox.Loading('正在取消请稍候...');
	},
	deleteEnd:function(r){
		var _this = this,
			c = this.fileList,
			m;
		var succFiles = [], failFiles = [];
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code === 200){
				m = c.get(file.id);
				c.remove(m);
				succFiles.push(m);
			}else{
				failFiles.push(c.get(file.id));
			}
		});
		this.loading.remove();
		if(failFiles.length === 0){
			Sbox.Success('取消外链成功');
		}else{
			Sbox.Fail('取消外链失败');
		}
		
		c.trigger('reset');
	},
	addAll:function(){ //刷新的时候
		var _this = this;
		this.$('.files').empty();
		this.currentElement = null;
		if(this.fileList.length > 0){
			this.$('.files').attr('class','files ' + this.showType);
			if(this.fileList.at(0).get('code')){
				Sbox.Login();
				return;
			}
			this.fileList.each(function(link){
				link.set({
					hasPassword:link.get('password')
				},{silent:true});
				var linkItemView = new Sbox.Views.LinkItemView({model:link,fileList:_this.fileList});
				_this.$('.files').append(linkItemView.render().el);
			})

			if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
				this.$el.find('.file')
		        .drop("start",function(){
		            $( this ).addClass("active");
		        })
		        .drop(function( ev, dd ){
		            var id = $(this).attr('_id');
		            _this.fileList.toggelCheckById(id);
		        })
		        .drop("end",function(){
		            $( this ).removeClass("active");
		        });

		        $.drop({ multi: true });
		    }
		}else{
			//如果没有文件呢，操。
			this.$('.files').attr('class','files');
			this.$('.files').append($('<li class="not-create-outlink">您还没有生成过外链哦！</li>'))
		}
	},
	hover:function(e){
		if(this.isDragging) return;
		var target = e.currentTarget;
		$(target).addClass('hover');
	},
	leave:function(e){
		var target = $(e.currentTarget);
		target.removeClass('hover');
		target.find('.more-operation').hide();
	},
	check:function(e){
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id),
			items = this.$el.find('.list-item');
		if(!m) return;

		var srcTarget = e.target || e.srcElement;
		if($(srcTarget).hasClass('icon-checked') || $(srcTarget).hasClass('icon-unchecked')){
			//m.set({checked:checked});
			return;
		}else{
			if(!e.ctrlKey && !e.shiftKey || this.currentElement === null){ //如果没有按住ctrl 或者 shift 或者是第一次点击，那么记录当前的element
                this.currentElement = target;
                if(!e.ctrlKey && !e.shiftKey){
                	if(m.get('checked') && (c.getChecked().length === 1)){
		                
		                setTimeout(function(){
		                	m.set({checked:false});
		                },30)
                	}else{
		                setTimeout(function(){
		                	c.uncheckAll();
		                	m.set({checked:true});
		                },30)
                	}
                }
            }
            if(e.ctrlKey){ //如果按住了ctrl，切换选中状态。
                m.set({checked:!m.get('checked')});
            }
            if(e.shiftKey){
                var start = c.getIndexOfById(this.currentElement.attr('_id')),
                    end = c.getIndexOfById(target.attr('_id'));
                if(start > end){
                    start = start + end;
                    end = start - end;
                    start = start - end;
                }
	            c.each(function(v,i){
	                if(i >= start && i <= end){
	                    c.at(i).set({checked:true})
	                }else{
	                    c.at(i).set({checked:false})
	                }
	            })
            }
		}
	},
	contextmenu:function(e){
		if($(e.target || e.srcElement).is('input')) return;
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id),
			items = this.$el.find('.list-item');
		if(!m) return;

    	if(!m.get('checked')){
        	c.uncheckAll();
        	m.set({checked:true});
    	}

    	if(!this.contextMenuElement){
        	this.contextMenuElement = new Sbox.Views.LinkContextMenu({fileList:this.fileList,path:this.path});
        	$(this.contextMenuElement.el).css({
        		position:'absolute',
        		zIndex:99,
        		left:-9999,
        		top:-9999
        	}).appendTo($('body'));
    	}
        this.fileList.trigger('contextmenu');
        var el = $(this.contextMenuElement.el)
		var x = e.pageX,
			y = e.pageY,
			winH = $(window).height(),
			winW = $(window).width(),
			w = el.width(),
			h = el.height(),
			top,left;
		left = (x + w > winW - 10 ? x - w - 3 : x + 1);
		top  = (y + h > winH - 10 ? y - h - 13 : y + 1);
		if(el.find('li')[0]){
			el.css({
				top:top,
				left:left
			}).show();
		}else{
			el.hide();
		}
		e.stopImmediatePropagation();
		e.preventDefault();
	}
});
/**
 * 外链工具栏
 * @class LinkToolBarView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.LinkToolBarView = Backbone.View.extend({/** @lends Sbox.Views.LinkToolBarView*/
	className:'toolbar',
	template:_.template($('#outchain-toolbar-template').html()),
	events:{
		'click .send'		:'send',
		'click .copy'		:'copy',
		'click .edit'		:'edit',
		'click .del'		:'del'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.model = new Sbox.Models.LinkToolbar();

		_.bindAll(this,'render','select');
		this.model.bind('change',this.render);
		this.fileList.bind('change',this.select);
		this.fileList.bind('reset',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	select:function(){
		var links = this.fileList.getChecked();
		if(links.length === 0) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedOutChains(links);
	},
	send:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.SendOutChain(file);
		e.preventDefault();
	},
	copy:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.ShowOutChain(file);
		e.preventDefault();
	},
	edit:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.EditOutChain(file);
		e.preventDefault();
	},
	del:function(e){
		var files = this.fileList.getChecked();
		Sbox.DeleteOutChain(files,this.fileList);
		e.preventDefault();
	}
});
/**
 * 外联文件排序
 * @class LinkSortView 
 * @extends Sbox.Views.FileSortView
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.LinkSortView = Sbox.Views.FileSortView.extend({/** @lends Sbox.Views.LinkSortView*/
	template:_.template($('#link-sort-template').html())
})
/**
 * 外联文件管理
 * @class LinkManageView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.LinkManageView = Backbone.View.extend({/** @lends Sbox.Views.LinkManageView*/
	className:'list-table link-manage',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
	},
	render:function(){
		var toolbar = new Sbox.Views.LinkToolBarView({
			fileList : this.fileList
		});
		var sort = new Sbox.Views.LinkSortView({
			fileList : this.fileList
		}); 
		var filelist = new Sbox.Views.LinkListView({
			fileList : this.fileList
		});
		this.$el.append(toolbar.render().el)
				.append(sort.render().el)
				.append(filelist.render().el);
		return this;
	}
});
/**
 * 外联管理视图
 * @class LinkView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.LinkView = Backbone.View.extend({/** @lends Sbox.Views.LinkView*/
	className:'outchain',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.render();
	},
	render:function(){
		var manage = new Sbox.Views.LinkManageView({
			fileList : this.fileList
		})
		this.$el.append(manage.render().el)
				.appendTo($('#main'));
		return this;
	}
});
/**
 * 匿名上传
 * @class UploadLinkItemView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.UploadLinkItemView = Backbone.View.extend({/** @lends Sbox.Views.UploadLinkItemView*/
	tagName:'li',
	className:'file',
	template:_.template($('#uploadlink-item-template').html()),
	events:{
		'click .checkbox'			: 'check'
	},
	initialize:function(){
		this.type = this.options.type;
		this.fileList  = this.options.fileList;
		_.bindAll(this,'render','editUploadLinkBegin','editUploadLinkEnd');
		this.model.bind('change',this.render);
		this.model.bind('edituploadlink.begin',this.editUploadLinkBegin);
		this.model.bind('edituploadlink.end',this.editUploadLinkEnd);
	},
	render:function(){
		var type = this.type;
		this.$el.html(this.template(this.model.toJSON()))
		this.$el.attr('_id',this.model.id);
		this.$el.attr('id','uploadlink' + this.model.id);
		this.model.get('checked') ? this.$el.addClass('selected'):this.$el.removeClass('selected');
		this.$el.addClass('list-item');
		return this;
	},
	check:function(e){//点击复选框时触发，选中当前项，同时阻止时间冒泡以防止触发li上的click事件
		var target = $(e.currentTarget);
		if(target.find('.icon').hasClass('icon-unchecked')){
			this.model.set({checked:true});
		}else{
			this.model.set({checked:false});
		}
		this.fileList.trigger('hidecontexmenu');
		e.stopImmediatePropagation();
	},
	editUploadLinkBegin:function(){
		this.loading = Sbox.Loading('正在保存请稍候...');
	},
	editUploadLinkEnd:function(r,p,time){
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			this.loading.remove();
			this.model.set({
				password:p,
				expiredate:time
			});
			Sbox.Success('修改成功');
		}else{
			Sbox.Fail('修改失败');
		}
	},
	stopPropagation:function(e){
		e.stopImmediatePropagation();
	}
});
/**
 * 匿名上传右键菜单
 * @class UploadLinkContextMenu 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.UploadLinkContextMenu = Backbone.View.extend({/** @lends Sbox.Views.UploadLinkContextMenu*/
	className:'dropdown contextmenu',
	template:_.template($('#uploadlink-toolbar-template').html()),
	events:{
		'click .copy'		:'copy',
		'click .edit'		:'edit',
		'click .del'		:'del'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.model = new Sbox.Models.UploadLinkContextMenu();

		_.bindAll(this,'render','select');
		this.model.bind('change',this.render);
		this.fileList.bind('contextmenu',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	select:function(){
		var files = this.fileList.getChecked();
		if(files.length === 0) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedUploadLinks(files);
	},
	copy:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.ShowUploadLink(file);
		e.preventDefault();
	},
	edit:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.EditUploadLink(file);
		e.preventDefault();
	},
	del:function(e){
		var files = this.fileList.getChecked();
		Sbox.DeleteUploadLink(files,this.fileList);
		e.preventDefault();
	}

})
/**
 * 外链列表
 * @class UploadLinkListView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.UploadLinkListView = Backbone.View.extend({/** @lends Sbox.Views.UploadLinkListView*/
	className:'list-body',
	template:_.template($('#file-list-tempate').html()),
	events:{
		'mouseenter li.file'	: 'hover',
		'mouseleave li.file'	: 'leave',
		'click li.file'			: 'check',
		'contextmenu li.file'	: 'contextmenu'
	},
	initialize:function(){
		var _this = this;
		this.currentElement = null;
		this.showType = this.options.showType || 'listview';
		this.fileList = this.options.fileList;

		_.bindAll(this,'render','addAll','deleteBegin','deleteEnd');
		this.fileList.bind('add',this.addOne);
		this.fileList.bind('reset',this.addAll);
		this.fileList.bind('deleteuploadlink.begin',this.deleteBegin);
		this.fileList.bind('deleteuploadlink.end',this.deleteEnd);

		this.fileList.bind('hidecontexmenu',function(){
			_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
		})

		$(document).on('click',function(){
			_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
		})
	},
	render:function(){
		var _this = this;
		this.$el.html(this.template({showtype:111})); //默认显示listview
		this.$('.files').attr('class','files ' + this.showType);

		this.$el.find('ul.files').mousedown(function(e){
            if((e.target || e.srcElement) === this){
            	_this.currentElement = null;
                _this.fileList.uncheckAll();
            }
        })

		if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
			this.$el.find('ul.files')
			.drag("start",function( ev, dd ){
				var target = ev.target || ev.srcElement;
				if($(target).hasClass('icon') || $(target).is('a')) return false;
				_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
				_this.isDragging = true;

				if(!ev.ctrlKey && !ev.shiftKey){
	            	_this.fileList.uncheckAll();
	            }

				return $('<div class="selection" />')
					.css('opacity', .65 )
					.appendTo( document.body );
			})
			.drag(function( ev, dd ){
				$( dd.proxy ).css({
					top: Math.min( ev.pageY, dd.startY ),
					left: Math.min( ev.pageX, dd.startX ),
					height: Math.abs( ev.pageY - dd.startY ),
					width: Math.abs( ev.pageX - dd.startX )
				});
			})
			.drag("end",function( ev, dd ){

				_this.isDragging = false;
				$( dd.proxy ).remove();
			});

	        $.drop({ multi: true });
	    }

		return this
	},
	deleteBegin:function(){
		this.loading = Sbox.Loading('正在关闭请稍候...');
	},
	deleteEnd:function(r){
		var _this = this,
			c = this.fileList,
			m;
		var succFiles = [], failFiles = [];
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code === 200){
				m = c.get(file.id);
				c.remove(m);
				succFiles.push(m);
			}else{
				failFiles.push(c.get(file.id));
			}
		});
		this.loading.remove();
		if(failFiles.length === 0){
			Sbox.Success('关闭匿名上传成功');
		}else{
			Sbox.Fail('关闭匿名上传失败');
		}
		
		c.trigger('reset');
	},
	addAll:function(){ //刷新的时候
		var _this = this;
		this.$('.files').empty();
		this.currentElement = null;
		if(this.fileList.length > 0){
			this.$('.files').attr('class','files ' + this.showType);
			if(this.fileList.at(0).get('code')){
				Sbox.Login();
				return;
			}
			this.fileList.each(function(link){
				var uploadlinkItemView = new Sbox.Views.UploadLinkItemView({model:link,fileList:_this.fileList});
				_this.$('.files').append(uploadlinkItemView.render().el);
			})

			if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
				this.$el.find('.file')
		        .drop("start",function(){
		            $( this ).addClass("active");
		        })
		        .drop(function( ev, dd ){
		            var id = $(this).attr('_id');
		            _this.fileList.toggelCheckById(id);
		        })
		        .drop("end",function(){
		            $( this ).removeClass("active");
		        });

		        $.drop({ multi: true });
		    }
		}else{
			//如果没有文件呢，操。
			this.$('.files').attr('class','files');
			this.$('.files').append($('<li class="not-create-outlink">您还没有生成过匿名上传链接哦！</li>'))
		}
	},
	hover:function(e){
		if(this.isDragging) return;
		var target = e.currentTarget;
		$(target).addClass('hover');
	},
	leave:function(e){
		var target = $(e.currentTarget);
		target.removeClass('hover');
		target.find('.more-operation').hide();
	},
	check:function(e){
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id),
			items = this.$el.find('.list-item');
		if(!m) return;

		var srcTarget = e.target || e.srcElement;
		if($(srcTarget).hasClass('icon-checked') || $(srcTarget).hasClass('icon-unchecked')){
			//m.set({checked:checked});
			return;
		}else{
			if(!e.ctrlKey && !e.shiftKey || this.currentElement === null){ //如果没有按住ctrl 或者 shift 或者是第一次点击，那么记录当前的element
                this.currentElement = target;
                if(!e.ctrlKey && !e.shiftKey){
                	if(m.get('checked') && (c.getChecked().length === 1)){
		                
		                setTimeout(function(){
		                	m.set({checked:false});
		                },30)
                	}else{
		                setTimeout(function(){
		                	c.uncheckAll();
		                	m.set({checked:true});
		                },30)
                	}
                }
            }
            if(e.ctrlKey){ //如果按住了ctrl，切换选中状态。
                m.set({checked:!m.get('checked')});
            }
            if(e.shiftKey){
                var start = c.getIndexOfById(this.currentElement.attr('_id')),
                    end = c.getIndexOfById(target.attr('_id'));
                if(start > end){
                    start = start + end;
                    end = start - end;
                    start = start - end;
                }
	            c.each(function(v,i){
	                if(i >= start && i <= end){
	                    c.at(i).set({checked:true})
	                }else{
	                    c.at(i).set({checked:false})
	                }
	            })
            }
		}
	},
	contextmenu:function(e){
		if($(e.target || e.srcElement).is('input')) return;
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id),
			items = this.$el.find('.list-item');
		if(!m) return;

    	if(!m.get('checked')){
        	c.uncheckAll();
        	m.set({checked:true});
    	}

    	if(!this.contextMenuElement){
        	this.contextMenuElement = new Sbox.Views.UploadLinkContextMenu({fileList:this.fileList,path:this.path});
        	$(this.contextMenuElement.el).css({
        		position:'absolute',
        		zIndex:99,
        		left:-9999,
        		top:-9999
        	}).appendTo($('body'));
    	}
        this.fileList.trigger('contextmenu');
        var el = $(this.contextMenuElement.el)
		var x = e.pageX,
			y = e.pageY,
			winH = $(window).height(),
			winW = $(window).width(),
			w = el.width(),
			h = el.height(),
			top,left;
		left = (x + w > winW - 10 ? x - w - 3 : x + 1);
		top  = (y + h > winH - 10 ? y - h - 13 : y + 1);
		if(el.find('li')[0]){
			el.css({
				top:top,
				left:left
			}).show();
		}else{
			el.hide();
		}
		e.stopImmediatePropagation();
		e.preventDefault();
	}
});
/**
 * 外链工具栏
 * @class UploadLinkToolBarView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.UploadLinkToolBarView = Backbone.View.extend({/** @lends Sbox.Views.UploadLinkToolBarView*/
	className:'toolbar',
	template:_.template($('#uploadlink-toolbar-template').html()),
	events:{
		'click .copy'		:'copy',
		'click .edit'		:'edit',
		'click .del'		:'del'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.model = new Sbox.Models.UploadLinkToolbar();

		_.bindAll(this,'render','select');
		this.model.bind('change',this.render);
		this.fileList.bind('change',this.select);
		this.fileList.bind('reset',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	select:function(){
		var links = this.fileList.getChecked();
		if(links.length === 0) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedUploadLinks(links);
	},
	copy:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.ShowUploadLink(file);
		e.preventDefault();
	},
	edit:function(e){
		var file = this.fileList.getChecked()[0];
		Sbox.EditUploadLink(file);
		e.preventDefault();
	},
	del:function(e){
		var files = this.fileList.getChecked();
		Sbox.DeleteUploadLink(files,this.fileList);
		e.preventDefault();
	}
});
/**
 * 外联文件排序
 * @class UploadLinkSortView 
 * @extends Sbox.Views.FileSortView
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.UploadLinkSortView = Sbox.Views.FileSortView.extend({/** @lends Sbox.Views.UploadLinkSortView*/
	template:_.template($('#uploadlink-sort-template').html())
})
/**
 * 外联文件管理
 * @class UploadLinkManageView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.UploadLinkManageView = Backbone.View.extend({/** @lends Sbox.Views.UploadLinkManageView*/
	className:'list-table uploadlink-manage',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
	},
	render:function(){
		var toolbar = new Sbox.Views.UploadLinkToolBarView({
			fileList : this.fileList
		});
		var sort = new Sbox.Views.UploadLinkSortView({
			fileList : this.fileList
		}); 
		var filelist = new Sbox.Views.UploadLinkListView({
			fileList : this.fileList
		});
		this.$el.append(toolbar.render().el)
				.append(sort.render().el)
				.append(filelist.render().el);
		return this;
	}
});
/**
 * 外联管理视图
 * @class UploadLinkView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.UploadLinkView = Backbone.View.extend({/** @lends Sbox.Views.UploadLinkView*/
	className:'uploadlink',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.render();
	},
	render:function(){
		var manage = new Sbox.Views.UploadLinkManageView({
			fileList : this.fileList
		})
		this.$el.append(manage.render().el)
				.appendTo($('#main'));
		return this;
	}
});

/**
 * 回收站文件
 * @class RecycleItemView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */

Sbox.Views.RecycleItemView = Backbone.View.extend({/** @lends Sbox.Views.RecycleItemView*/
	tagName:'li',
	className:'file',
	template:_.template($('#recycle-item-template').html()),
	events:{
		'click .checkbox'			: 'check',
		'click .reduce'				: 'reduce',
		'click .del'				: 'del'
	},
	initialize:function(){
		this.type = this.options.type;
		this.fileList  = this.options.fileList;
		_.bindAll(this,'render');
		this.model.bind('change',this.render);
	},
	render:function(){
		var type = this.type;
		this.$el.html(this.template(this.model.toJSON()))
		this.$el.attr('_id',this.model.id);
		this.$el.attr('id',this.model.id);
		this.model.get('checked') ? this.$el.addClass('selected'):this.$el.removeClass('selected');
		this.$el.addClass('list-item')
		return this;
	},
	check:function(e){//点击复选框时触发，选中当前项，同时阻止时间冒泡以防止触发li上的click事件
		var target = $(e.currentTarget);
		if(target.find('.icon').hasClass('icon-unchecked')){
			this.model.set({checked:true});
		}else{
			this.model.set({checked:false});
		}
		this.fileList.trigger('hidecontexmenu');
		e.stopImmediatePropagation();
	},
	reduce:function(e){
		Sbox.Restore([this.model],this.fileList);
		e.preventDefault();
	},
	del:function(e){
		Sbox.CompleteDelete([this.model],this.fileList);
		e.preventDefault();
	},
	stopPropagation:function(e){
		e.stopImmediatePropagation();
	}
});

/**
 * 回收站右键菜单
 * @class RecycleContextMenu 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleContextMenu = Backbone.View.extend({/** @lends Sbox.Views.RecycleContextMenu*/
	className:'dropdown contextmenu',
	template:_.template($('#recycle-toolbar-template').html()),
	events:{
		'click .reduce'		:'reduce',
		'click .del'		:'del'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.model = new Sbox.Models.RecycleContextMenu();

		_.bindAll(this,'render','select');
		this.model.bind('change',this.render);
		this.fileList.bind('contextmenu',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	select:function(){
		var files = this.fileList.getChecked();
		if(files.length === 0) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedOutChains(files);
	},
	reduce:function(e){
		var files = this.fileList.getChecked();
		Sbox.Restore(files,this.fileList);
		e.preventDefault();
	},
	del:function(e){
		var files = this.fileList.getChecked();
		Sbox.CompleteDelete(files,this.fileList);
		e.preventDefault();
	}

})
/**
 * 回收站文件列表
 * @class RecycleListView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleListView = Backbone.View.extend({/** @lends Sbox.Views.RecycleListView*/
	className:'list-body',
	template:_.template($('#file-list-tempate').html()),
	events:{
		'mouseenter li.file'	: 'hover',
		'mouseleave li.file'	: 'leave',
		'click li.file'			: 'check',
		'contextmenu li.file'	: 'contextmenu'
	},
	initialize:function(){
		var _this = this;
		this.currentElement = null;
		this.showType = this.options.showType || 'listview';
		this.fileList = this.options.fileList;

		_.bindAll(this,'render','addAll','restoreBegin','restoreEnd','completeDeleteBegin','completeDeleteEnd','emptyBegin','emptyEnd');
		this.fileList.bind('add',this.addOne);
		this.fileList.bind('reset',this.addAll);
		this.fileList.bind('restore.begin',this.restoreBegin);
		this.fileList.bind('restore.end',this.restoreEnd);
		this.fileList.bind('completedelete.begin',this.completeDeleteBegin);
		this.fileList.bind('completedelete.end',this.completeDeleteEnd);
		this.fileList.bind('empty.begin',this.emptyBegin);
		this.fileList.bind('empty.end',this.emptyEnd);

		this.fileList.bind('hidecontexmenu',function(){
			_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
		})

		$(document).on('click',function(){
			_this.contextMenuElement && $(_this.contextMenuElement.el).hide();
		})
	},
	render:function(){
		var _this = this;
		this.$el.html(this.template({showtype:111})); //默认显示listview
		this.$('.files').attr('class','files ' + this.showType);

		this.$el.find('ul.files').mousedown(function(e){
            if((e.target || e.srcElement) === this){
            	_this.currentElement = null;
                _this.fileList.uncheckAll();
            }
        })

		if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
			this.$el.find('ul.files')
			.drag("start",function( ev, dd ){
				var target = ev.target || ev.srcElement;
				if($(target).hasClass('icon') || $(target).is('a')) return false;
				_this.contextMenuElement && $(_this.contextMenuElement.el).hide();

				_this.isDragging = true;

				if(!ev.ctrlKey && !ev.shiftKey){
	            	_this.fileList.uncheckAll();
	            }

				return $('<div class="selection" />')
					.css('opacity', .65 )
					.appendTo( document.body );
			})
			.drag(function( ev, dd ){
				$( dd.proxy ).css({
					top: Math.min( ev.pageY, dd.startY ),
					left: Math.min( ev.pageX, dd.startX ),
					height: Math.abs( ev.pageY - dd.startY ),
					width: Math.abs( ev.pageX - dd.startX )
				});
			})
			.drag("end",function( ev, dd ){

				_this.isDragging = false;
				$( dd.proxy ).remove();
			});

	        $.drop({ multi: true });
	    }
		return this
	},
	restoreBegin:function(){
		this.loading = Sbox.Loading('正在还原请稍候...');
	},
	// restoreEnd:function(r){
	// 	var _this = this,
	// 		c = this.fileList,
	// 		m;
	// 	var succFiles = [], failFiles = [],failCode;
	// 	if(r.code === 701){
	// 		Sbox.Loading().remove();
	// 		Sbox.Login();
	// 	}
	// 	_(r).each(function(file){
	// 		if(file.result.code === 200){
	// 			m = c.get(file.id);
	// 			c.remove(m);
	// 			//m.set({id:file.id},{silent:true});
	// 			Sbox.reduceToTree(file.result.belongDir,m);
	// 			succFiles.push(m);
	// 		}else{
	// 			failFiles.push(c.get(file.id));
	// 			if(!failCode) failCode = file.result.code;
	// 		}
	// 	});
	// 	this.loading.remove();
	// 	if(failFiles.length === 0){
	// 		Sbox.Success('还原成功');
	// 	}else{
	// 		if(failCode === 501){
	// 			Sbox.Fail('还原失败，还原位置已包含同名文件');
	// 		}else if(failCode === 503){
	// 			Sbox.Fail('还原失败，空间不足');
	// 		}else{
	// 			Sbox.Fail('文件还原失败');	
	// 		}
	// 	}
	// 	c.trigger('reset');
	// 	Sbox.RefreshUsage();
	// },
	restoreEnd:function(r,targetId){
		var _this = this,
			c = this.fileList,
			m;
		var targetDir = c.get(targetId);
		var succFiles = [], failFiles = [],failCode;
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code === 200){
				m = c.get(file.id);
				m.set('name',file.name);
				if(m.get('parentDir') && targetDir && !targetDir.get('hasSon')){
					targetDir.set({hasSon:1},{silent:true});
				}
				c.remove(m);
				succFiles.push(m);
			}else{
				if(!failCode) failCode = file.result.code;
				failFiles.push(c.get(file.id));
			}
		});
		this.loading.remove();
		if(failFiles.length === 0){
			Sbox.Success('还原成功');
		}else{
			// if(failCode === 503){
			// 	Sbox.Fail(failFiles.length + '个文件移动失败，目标目录已存在同名文件',2);
			// }else 
			if(failCode === 504){
				Sbox.Fail('还原失败，空间不足')
			}else{
				Sbox.Fail('文件还原失败');
			}
		}

		Sbox.addNodeToTree(targetId,succFiles,'mine');
		Sbox.addNodeToTree(targetId,succFiles,'public');
		c.trigger('reset');
		Sbox.RefreshUsage();
	},
	completeDeleteBegin:function(){
		this.loading = Sbox.Loading('正在删除请稍候...');
	},
	completeDeleteEnd:function(r){
		var _this = this,
			c = this.fileList,
			m;
		var succFiles = [], failFiles = [], failCode;
		if(r.code === 701){
			Sbox.Loading().remove();
			Sbox.Login();
			return;
		}
		_(r).each(function(file){
			if(file.result.code === 200){
				m = c.get(file.id);
				c.remove(m);
				succFiles.push(m);
			}else{
				if(!failCode) failCode = file.result.code;
				failFiles.push(c.get(file.id));
			}
		});
		this.loading.remove();

		if(failCode === 702){
			Sbox.ValidateDeletePassword(function(){
				c.completeDelete(c.getChecked());
			})
			return;
		}

		if(failFiles.length === 0){
			Sbox.Success('删除成功');
		}else{
			Sbox.Fail('文件删除失败。');
		}
		// Sbox.deleteNodeToTree(succFiles);

		c.trigger('reset');
	},
	emptyBegin:function(){
		this.loading = Sbox.Loading('正在清空回收站...');
	},
	emptyEnd:function(r){
		var _this = this;
		this.loading.remove();
		if(r.code === 701 || r.code === 403){
			Sbox.Login();
		}else if(r.code === 200){
			Sbox.Success('回收站已清空');
		}else if(r.code === 702){
			Sbox.ValidateDeletePassword(function(){
				_this.fileList.empty();
			})
		}else{
			Sbox.Fail('清空回收站失败')
		}
		this.fileList.fetch({
			data:{
				_t:Math.random()
			}
		});
	},
	addAll:function(){ //刷新的时候
		var _this = this;
		this.$('.files').empty();
		this.currentElement = null;
		if(this.fileList.length > 0){
			this.$('.files').attr('class','files ' + this.showType);
			if(this.fileList.at(0).get('code')){
				Sbox.Login();
				return;
			}
			this.fileList.each(function(link){
				var linkItemView = new Sbox.Views.RecycleItemView({model:link,fileList:_this.fileList});
				_this.$('.files').append(linkItemView.render().el);
			})

			if($.browser.msie || !document.hasOwnProperty('ontouchstart')){ //触屏浏览器不需要框选，否则不能滚动
				this.$el.find('.file')
		        .drop("start",function(){
		            $( this ).addClass("active");
		        })
		        .drop(function( ev, dd ){
		            var id = $(this).attr('_id');
		            _this.fileList.toggelCheckById(id);
		        })
		        .drop("end",function(){
		            $( this ).removeClass("active");
		        });

		        $.drop({ multi: true });
		    }
		}else{
			//如果没有文件呢，操。
			this.$('.files').attr('class','files');
			this.$('.files').append($('<li style="text-align:center; padding:20px 0; color:gray;font-size:16px;">回收站里还没有文件！</li>'))
		}
	},
	hover:function(e){
		if(this.isDragging) return;
		var target = e.currentTarget;
		$(target).addClass('hover');
	},
	leave:function(e){
		var target = $(e.currentTarget);
		target.removeClass('hover');
		target.find('.more-operation').hide();
	},
	check:function(e){
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id),
			items = this.$el.find('.list-item');
		if(!m) return;

		var srcTarget = e.target || e.srcElement;
		if($(srcTarget).hasClass('icon-checked') || $(srcTarget).hasClass('icon-unchecked')){
			//m.set({checked:checked});
			return;
		}else{
			if(!e.ctrlKey && !e.shiftKey || this.currentElement === null){ //如果没有按住ctrl 或者 shift 或者是第一次点击，那么记录当前的element
                this.currentElement = target;
                if(!e.ctrlKey && !e.shiftKey){
                	if(m.get('checked') && (c.getChecked().length === 1)){
		                setTimeout(function(){
		                	m.set({checked:false});
		                },30)
                	}else{
		                setTimeout(function(){
		                	c.uncheckAll();
		                	m.set({checked:true});
		                },30)
                	}
                }
            }
            if(e.ctrlKey){ //如果按住了ctrl，切换选中状态。
                m.set({checked:!m.get('checked')});
            }
            if(e.shiftKey){
                var start = c.getIndexOfById(this.currentElement.attr('_id')),
                    end = c.getIndexOfById(target.attr('_id'));
                if(start > end){
                    start = start + end;
                    end = start - end;
                    start = start - end;
                }
	            c.each(function(v,i){
	                if(i >= start && i <= end){
	                    c.at(i).set({checked:true})
	                }else{
	                    c.at(i).set({checked:false})
	                }
	            })
            }
		}
	},
	contextmenu:function(e){
		if($(e.target || e.srcElement).is('input')) return;
		var target = $(e.currentTarget),
			id = target.attr('_id'),
			c = this.fileList,
			m = c.get(id),
			items = this.$el.find('.list-item');
		if(!m) return;

    	if(!m.get('checked')){
        	c.uncheckAll();
        	m.set({checked:true});
    	}

    	if(!this.contextMenuElement){
        	this.contextMenuElement = new Sbox.Views.RecycleContextMenu({fileList:this.fileList,path:this.path});
        	$(this.contextMenuElement.el).css({
        		position:'absolute',
        		zIndex:99,
        		left:-9999,
        		top:-9999
        	}).appendTo($('body'));
    	}
        this.fileList.trigger('contextmenu');
        var el = $(this.contextMenuElement.el)
		var x = e.pageX,
			y = e.pageY,
			winH = $(window).height(),
			winW = $(window).width(),
			w = el.width(),
			h = el.height(),
			top,left;
		left = (x + w > winW - 10 ? x - w - 3 : x + 1);
		top  = (y + h > winH - 10 ? y - h - 13 : y + 1);
		if(el.find('li')[0]){
			el.css({
				top:top,
				left:left
			}).show();
		}else{
			el.hide();
		}
		e.stopImmediatePropagation();
		e.preventDefault();
	}
});
/**
 * 回收站警告信息
 * @class RecycleWarningView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleWarningView = Backbone.View.extend({/** @lends Sbox.Views.RecycleWarningView*/
	className:'warning',
	template:_.template($('#recycle-warning-template').html()),
	initialize:function(){
		this.render();
	},
	render:function(){
		this.$el.html(this.template());
		return this;
	}
});
/**
 * 回收站密码设置
 * @class RecycleSettingView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleSettingView = Backbone.View.extend({/** @lends Sbox.Views.RecycleWarningView*/
	className:'r-setting',
	template:_.template($('#recycle-setting-template').html()),
	events:{
		'click .setting-delpass':'settingDelpass',
		'click .change-delpass' :'changeDelpass'
	},
	initialize:function(){
		this.render();
	},
	render:function(){
		this.$el.html(this.template());
		return this;
	},
	settingDelpass:function(){
		var _this = this;
		Sbox.SetDeletePassword(function(){
			open_delete_password = 1;
			_this.render();
		})
	},
	changeDelpass:function(){
		var _this = this;
		Sbox.ChangeDeletePassword();
	}
});
/**
 * 回收站操作，如清空 etc.
 * @class RecycleOpView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleOpView = Backbone.View.extend({/** @lends Sbox.Views.RecycleOpView*/
	className:'main-op',
	template:_.template($('#recycle-mainop-remplate').html()),
	events:{
		'click #empty':'empty'
	},
	initialize:function(){
		this.fileList = this.options.fileList; //传入fileList用于create操作
		//this.$el.attr('id','mainOperation');
		//_.bindAll(this,'reset');
		//this.fileList.bind('reset',this.reset);
	},
	render:function(){
		this.$el.html(this.template());
		return this;
	},
	empty:function(e){
		var _this = this;
		if(this.fileList.length === 0){
			Sbox.Error('回收站里还没有文件！');
			return;
		}
		Sbox.EmptyRecyclebin(this.fileList);
		e.preventDefault();
	}
});
/**
 * 回收站工具栏
 * @class RecycleToolbarView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleToolbarView = Backbone.View.extend({/** @lends Sbox.Views.RecycleToolbarView*/
	className:'toolbar',
	template:_.template($('#recycle-toolbar-template').html()),
	events:{
		'click .reduce'		:'reduce',
		'click .del'		:'del'
	},
	initialize:function(){
		this.fileList = this.options.fileList;
		this.model = new Sbox.Models.RecycleToolbar();

		_.bindAll(this,'render','select');
		this.model.bind('change',this.render);
		this.fileList.bind('change',this.select);
		this.fileList.bind('reset',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	select:function(){
		var links = this.fileList.getChecked();
		if(links.length === 0) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedOutChains(links);
	},
	reduce:function(e){
		var files = this.fileList.getChecked();
		Sbox.Restore(files, this.fileList);
		e.preventDefault();
	},
	del:function(e){
		var files = this.fileList.getChecked();
		Sbox.CompleteDelete(files,this.fileList);
		e.preventDefault();
	}
});
/**
 * 回收站文件排序
 * @class RecycleSortView 
 * @extends Sbox.Views.FileSortView
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleSortView = Sbox.Views.FileSortView.extend({/** @lends Sbox.Views.RecycleSortView*/
	template:_.template($('#recycle-sort-template').html())
})
/**
 * 回收站文件管理
 * @class RecycleManageView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleManageView = Backbone.View.extend({/** @lends Sbox.Views.RecycleManageView*/
	className:'list-table recyclebin-manage',
	initialize:function(){
		this.fileList = this.options.fileList;
	},
	render:function(){
		var toolbar = new Sbox.Views.RecycleToolbarView({
			fileList : this.fileList
		});
		var sort = new Sbox.Views.RecycleSortView({
			fileList : this.fileList
		}); 
		var filelist = new Sbox.Views.RecycleListView({
			fileList : this.fileList
		});
		this.$el.append(toolbar.render().el)
				.append(sort.render().el)
				.append(filelist.render().el);
		return this;
	}
});
/**
 * 回收站管理视图
 * @class RecycleManageView 
 * @extends Sbox.Views.FileSortView
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.RecycleView = Backbone.View.extend({/** @lends Sbox.Views.RecycleView*/
	className:'recyclebin',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.render();
	},
	render:function(){
		var warning = new Sbox.Views.RecycleWarningView();
		var setting = new Sbox.Views.RecycleSettingView();
		var op = new Sbox.Views.RecycleOpView({
			fileList : this.fileList
		});
		var manage = new Sbox.Views.RecycleManageView({
			fileList : this.fileList
		})
		this.$el.append(op.render().el)
				.append(setting.render().el)
				.append(warning.render().el)
				.append(manage.render().el)
				.appendTo($('#main'));
		return this;
	}
})

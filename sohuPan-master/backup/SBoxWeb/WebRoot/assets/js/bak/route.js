/**
 * @fileOverview 启动文件，定义router，访问路径路由
 * @author angelscat angelscat@vip.qq.com
 * 
 */

Sbox.Controllers.Router = Backbone.Router.extend({
	routes:{
		'' : 'home',
		'!/我的文件*actions' : 'netdisk',
		'!/企业共享*actions':'publicdisk',
		'!/共享文件*actions':'share',
		//'!/星标文件':'starfile',
		'!/外链管理/:type':'outchain',
		'!/回收站' : 'recyclebin',
		//'!/search/:query':'search',
		//'!/日志管理' : 'log',
		"*actions":'defaultAction'
	},

	initialize:function(){
		var _this = this;
		new Sbox.Views.Layout();
		Sbox.RefreshUsage();
		$(window).bind('resize',function(){
			_this.resize();
		})

		// this.pathView = this.pathView || new Sbox.Views.PathView({model:this.pathModel});//初始化path
		// this.treeView = this.treeView || new Sbox.Views.TreeView({model:this.pathModel});//初始化treeview
		// this.fileListView = this.fileListView || new Sbox.Views.FileListView({model:this.pathModel});//初始化filelist

	},

	home:function(p){ //访问首页或者其他不符合条件的页面自动跳转到'我的文件'
		Backbone.history.navigate('!/' + MY_DISK_NAME, true);
	},
	defaultAction:function(p){
		if(this.loaded) return;
		try{
			if(decodeURIComponent(p) === p){ //某些SB的双核浏览器切换模式的时候中文会乱码。
				Backbone.history.navigate('',true);
				return;
			}
			Backbone.history.navigate(decodeURIComponent(p),true);	
		}catch(e){ //safari的中文编码比较坑爹。。。
			Backbone.history.navigate('',true);
		}
		this.loaded = true;
	},

	netdisk:function(path){ //初始化我的文件管理页面
		if(path !== '' && path.indexOf('/') !== 0){
			Backbone.history.navigate('!/' + MY_DISK_NAME, true);
			return ;
		}
		
		this.reset();
		this.myFilePathModel = this.myFilePathModel || new Sbox.Models.Path({type:'mine'});
		this.myFileList = this.myFileList || new Sbox.Collections.FileList([],{type:'mine'})
		this.myFileView = this.myFileView || new Sbox.Views.MyFileView({path:this.myFilePathModel,fileList:this.myFileList});
		this.myFileTree = this.myFileTree || new Sbox.Views.TreeView({el:$('#myFileBody'),path:this.myFilePathModel,fileList:this.myFileList,type:'mine'});


		this.myFileView.$el.show();
		$('#sidebar .mine').addClass('on');

		this.resize();

		var _this = this;
		if(path.charAt(path.length - 1) === '/') path = path.substring(0,path.length - 1);
		path = '/' + MY_DISK_NAME + path; 	//这个可能是不可靠的path  
											//如果想简单，那就直接先检查这个path是否正确，如果不正确，返回最符合要求的path
											//否则只能一层层来检测是否存在某一级目录
											//但是如果本身就是没有树形菜单的呢？所以感觉还是直接检测path并返回最符合要求的path的filelist，然后才去展开树形菜单

		var pathModel = this.myFilePathModel;

		//console.log(path,pathModel.cache[path]);

		//确保输入的path是正确的，包括从缓存确认和服务器确认
		// if(!pathModel.cache[path]){ //如果没有缓存过，那么到服务器请求检查path是否正确
		// 	// pathModel.fetch({
		// 	// 	url:'checkPath.json?path='+path,
		// 	// 	success:function(){
		// 	// 		var correctPath = pathModel.get('path');
		// 	// 		Backbone.history.navigate('!' + correctPath,false);
		// 	// 		pathModel.addCache([correctPath]);

		// 	// 	}
		// 	// })
		// 	Backbone.history.navigate('!/' + MY_DISK_NAME, true);
		// }else{ //否则直接设置该path
		// 	pathModel.set({
		// 		path:path
		// 	})
		// }
		pathModel.set({
			path:path
		},{silent:true})
		pathModel.trigger('change');




		// //一层层的向下展开，以获得最终的path，最后设置pathView,toolBar,listView等界面的path
		// //this.treeView.expandNode(path);


		// // this.pathView.setPath(path); //更新path
		// // this.toolBar.setPath(path); //更新toolBar记录的当前path
		// //this.treeView.setPath(path);
	},
	share:function(path){ //我收到的共享文件
		if(path !== '' && path.indexOf('/') !== 0){
			Backbone.history.navigate('!/' + MY_DISK_NAME, true);
			return ;
		}

		this.reset();
		this.shareFilePathModel = this.shareFilePathModel || new Sbox.Models.Path({type:'share'});
		this.shareFileList = this.shareFileList || new Sbox.Collections.FileList([],{type:'share'});
		this.shareFileView = this.shareFileView || new Sbox.Views.ShareFileView({path:this.shareFilePathModel,fileList:this.shareFileList});
		this.shareFileTree = this.shareFileTree || new Sbox.Views.TreeView({el:$('#shareFileBody'),path:this.shareFilePathModel,fileList:this.shareFileList,type:'share'});

		this.shareFileView.$el.show();
		$('#sidebar .shared').addClass('on');


		this.resize();


		var _this = this;
		if(path.charAt(path.length - 1) === '/') path = path.substring(0,path.length - 1);
		path = '/' + SHARE_DISK_NAME + path; 	//这个可能是不可靠的path  
											//如果想简单，那就直接先检查这个path是否正确，如果不正确，返回最符合要求的path
											//否则只能一层层来检测是否存在某一级目录
											//但是如果本身就是没有树形菜单的呢？所以感觉还是直接检测path并返回最符合要求的path的filelist，然后才去展开树形菜单

		var pathModel = this.shareFilePathModel;

		

		//确保输入的path是正确的，包括从缓存确认和服务器确认
		// if(!pathModel.cache[path]){ //如果没有缓存过，那么到服务器请求检查path是否正确
		// 	// pathModel.fetch({
		// 	// 	url:'checkPath.json?path='+path,
		// 	// 	success:function(){
		// 	// 		var correctPath = pathModel.get('path');
		// 	// 		Backbone.history.navigate('!' + correctPath,false);
		// 	// 		pathModel.addCache([correctPath]);

		// 	// 	}
		// 	// })
		// 	Backbone.history.navigate('!/' + SHARE_DISK_NAME, true);
		// }else{ //否则直接设置该path
		// 	pathModel.set({
		// 		path:path
		// 	})
		// }
		pathModel.set({
			path:path
		},{silent:true})
		pathModel.trigger('change');

	},
	publicdisk:function(path){
		if(path !== '' && path.indexOf('/') !== 0){
			Backbone.history.navigate('!/' + PUBLIC_DISK_NAME, true);
			return ;
		}

		this.reset();
		this.publicFilePathModel = this.publicFilePathModel || new Sbox.Models.Path({type:'public'});
		this.publicFileList = this.publicFileList || new Sbox.Collections.FileList([],{type:'public'});
		this.publicFileView = this.publicFileView || new Sbox.Views.PublicFileView({path:this.publicFilePathModel,fileList:this.publicFileList});
		this.publicFileTree = this.publicFileTree || new Sbox.Views.TreeView({el:$('#publicFileBody'),path:this.publicFilePathModel,fileList:this.publicFileList,type:'public'});

		this.publicFileView.$el.show();
		$('#sidebar .public').addClass('on');


		this.resize();


		var _this = this;
		if(path.charAt(path.length - 1) === '/') path = path.substring(0,path.length - 1);
		path = '/' + PUBLIC_DISK_NAME + path; 	//这个可能是不可靠的path  
											//如果想简单，那就直接先检查这个path是否正确，如果不正确，返回最符合要求的path
											//否则只能一层层来检测是否存在某一级目录
											//但是如果本身就是没有树形菜单的呢？所以感觉还是直接检测path并返回最符合要求的path的filelist，然后才去展开树形菜单

		var pathModel = this.publicFilePathModel;

		pathModel.set({
			path:path
		},{silent:true})
		pathModel.trigger('change');
	},
	outchain:function(type){ //外链管理
		this.reset();
		$('#sidebar .outchain').addClass('on');
		$('#sidebar .outchain li').removeClass('cur')

		if(type === 'outlink'){
			$('#sidebar .outchain .outlink').addClass('cur');
			this.linkList = this.linkList || new Sbox.Collections.FileList([],{type:'outchain'});
			this.linkView = this.linkView || new Sbox.Views.LinkView({fileList:this.linkList});
			this.linkView.$el.show();

			this.linkList.fetch({
				data:{
					_t:Math.random()
				}
			})
		}else if(type === 'uploadlink'){
			$('#sidebar .outchain .uploadlink').addClass('cur');
			this.uploadlinkList = this.uploadlinkList || new Sbox.Collections.FileList([],{type:'uploadlink'});
			this.uploadlinkView = this.uploadlinkView || new Sbox.Views.UploadLinkView({fileList:this.uploadlinkList});
			this.uploadlinkView.$el.show();

			this.uploadlinkList.fetch({
				data:{
					_t:Math.random()
				}
			})
		}else{
			Backbone.history.navigate('!/' + OUT_CHAIN + '/outlink',true);
		}
		this.resize();
	},

	recyclebin:function(){//回收站列表
		this.reset();

		this.recycleList = this.recycleList || new Sbox.Collections.FileList([],{type:'recyclebin'});
		this.recicleView = this.recicleView || new Sbox.Views.RecycleView({fileList:this.recycleList});
		this.recicleView.$el.show();
		$('#sidebar .recyclebin').addClass('on');

		this.resize();

		this.recycleList.fetch({
			data:{
				_t:Math.random()
			}
		})
	},
	log:function(){ //日志管理

	},
	reset:function(){
		if(this.myFileView) this.myFileView.$el.hide();
		if(this.publicFileView) this.publicFileView.$el.hide();
		if(this.shareFileView) this.shareFileView.$el.hide();
		if(this.linkView) this.linkView.$el.hide();
		if(this.uploadlinkView) this.uploadlinkView.$el.hide();
		if(this.recicleView) this.recicleView.$el.hide();
		$('#sidebar .on').removeClass('on');
	},
	resize:function(){ //窗口大小改变时调整页面内容的宽高
		var treeContainer = $('#sidebar .mod-bd'),
			fileListContainer = $('#main .my-file .list-body,#main .share-file .list-body,,#main .public-file .list-body'),
			outchainFileListContainer = $('#main .outchain .list-body'),
			recycleFileListContainer = $('#main .recyclebin .list-body'),
			sidebar = $('#sidebar'),
			navigation = $('#main .navigation');

		var winHeight = $(window).height(),
			winWidth = $(window).width(),
			headHeight = $('#header').outerHeight(true),
			treeHeight = winHeight - headHeight - $('#sidebar .mod').length * 46 - 88, //总高度 - 头部高度 - 4×左侧模块头部高度 - 其他附加高度如padding border等 
			fileListHeight = winHeight - headHeight - 48 - 48 - 46, //总高度 - 头部高度 - (上传/新建高度 & 面包屑导航高度) - 表格头高度 - 底部统计个数高度
			outchainFileListHeight = winHeight - headHeight - 48,
			recycleFileListHeight = winHeight - headHeight - 36 - 48 -48,
			sidebarHeight = winHeight - headHeight - 107;

		if(treeContainer[0]){
			_(treeContainer).each(function(v){
				$(v).height(treeHeight);
			})
		}

		if(fileListContainer[0]){
			_(fileListContainer).each(function(v){
				$(v).height(fileListHeight);
			})
		}

		if(outchainFileListContainer[0]){
			outchainFileListContainer.height(outchainFileListHeight);
		}

		if(recycleFileListContainer[0]){
			recycleFileListContainer.height(recycleFileListHeight);
		}
		if(sidebar[0]){
			sidebar.height(sidebarHeight);
		}

		navigation.width((winWidth > 1000 ? winWidth : 1000) - 570);

	}
})


$(document).ready(function(){

	new Sbox.Controllers.Router();
	Backbone.history.start();
})
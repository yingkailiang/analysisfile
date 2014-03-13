 /**
 * @fileOverview 文件夹外链页面使用
 * @author angelscat@vip.qq.com
 */

//language

var outlinkLanguage = {
	'ch-zn':{
		passwordEmpty:'请输入密码',
		passwordError:'密码错误',
		emptyFile:'空文件不支持在线预览',
		emptyFolder:'该目录下还没有文件！',
		loading:'正在加载...'
	},
	'en':{
		passwordEmpty:'Enter password',
		passwordError:'Password incorrect',
		emptyFile:'Empty file can\'t preview',
		emptyFolder:'This folder is empty',
		loading:'Loading...'
	}
}

if(outLinkInfo.language == 0){
	outLinkInfo.language = 'ch-zn';
}else if(outLinkInfo.language == 1){
	outLinkInfo.language = 'en';
}else{ //default
	outLinkInfo.language = 'ch-zn';
}


//path
/**
 * 文件夹外链面包屑导航
 * @class OutLinkPathView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.OutLinkPathView = Backbone.View.extend({/** @lends Sbox.Views.OutLinkPathView*/
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
		var path = this.model.get('path'),
			pathIds = this.model.get('pathIds');
		path = path.split('/').slice(1);
		this.path = path;
		this.pathIds = pathIds;
		this.$el.html(this.template({paths:path,pathIds:pathIds}));
		return this;
	},
	goback:function(e){
		var target = e.currentTarget;
		//console.log(target)
		if($(target).hasClass('disabled')) return;
		this.gopath(this.path.length - 1);
		e.preventDefault();
	},
	gopath:function(e){ //TODO test
		var index;
		if($.isNumeric(e)){
			index = e - 1;
		}else{
			index = parseInt($(e.currentTarget).attr('_index'));
			e.preventDefault();
		}
		this.path = this.path.slice(0,index + 1);
		this.pathIds = this.pathIds.slice(0,index + 1);
		//Backbone.history.navigate('!/' + this.path.join('/'),true);
		this.model.set({
			path:'/' + this.path.join('/'),
			pathId:this.pathIds[index],
			pathIds:this.pathIds
		})
		this.model.trigger('path.load');
	}
})

//sort
/**
 * 文件夹外链排序
 * @class OutLinkFileSortView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.OutLinkFileSortView = Backbone.View.extend({/** @lends Sbox.Views.OutLinkFileSortView*/
	className:'list-header',
	template:_.template($('#file-sort-template').html()),
	events:{
		'click .checkbox':'checkAll',
		'click .name':'sortByName',
		'click .size':'sortBySize',
		'click .create-time':'sortByCreateTime',
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
		this.$el.find('.size,.time,.create-time').removeClass('asc').removeClass('desc');
		this.sortBy(e,'name');
	},
	sortBySize:function(e){ //按文件大小排序
		this.$el.find('.name,.time,.create-time').removeClass('asc').removeClass('desc');
		this.sortBy(e,'size');
	},
	sortByTime:function(e){ //按文件修改时间排序
		this.$el.find('.name,.size,.create-time').removeClass('asc').removeClass('desc');
		this.sortBy(e,'modifyTime');
	},
	sortByCreateTime:function(e){ //按创建时间排序
		this.$el.find('.name,.size,.time').removeClass('asc').removeClass('desc');
		this.sortBy(e,'createTime');
		
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

			}else if(attr === 'size'){
				tmp[type].sort(function(file1,file2){
					return (asc ? 1 : -1) * (file1.get(attr) - file2.get(attr));
				})
			}else if(attr === 'modifyTime' || attr === 'createTime'){
				tmp[type].sort(function(file1,file2){
					var d1 = file1.get(attr).split(' '),
						d2 = file2.get(attr).split(' ');
					d1 = d1[0].split('-').concat(d1[1].split(':'));
					d2 = d2[0].split('-').concat(d2[1].split(':'));
					d1[1] --;
					d2[1] --;
					return (asc ? 1 : -1) * (new Date(d1[0],d1[1],d1[2],d1[3],d1[4],d1[5]) - new Date(d2[0],d2[1],d2[2],d2[3],d2[4],d2[5]));
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
 * 文件夹外链文件列表
 * @class OutLinkFileListView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.OutLinkFileListView = Backbone.View.extend({/** @lends Sbox.Views.OutLinkFileListView*/
	className:'list-body',
	template:_.template($('#file-list-tempate').html()),
	events:{
		'mouseenter li.file'	: 'hover',
		'mouseleave li.file'	: 'leave',
		'click li.file'			: 'check',
		'dblclick li.file'		: 'gotoPath'
	},
	initialize:function(){
		var _this = this;
		this.currentElement = null;
		this.showType = 'listview';
		this.fileList = this.options.fileList;
		this.path = this.options.path;

		_.bindAll(this,'render','addOne','addAll','refresh','loading','changeView');
		this.fileList.bind('add',this.addOne);
		this.fileList.bind('reset',this.addAll);
		this.fileList.bind('view.change',this.changeView);
		//this.fileList.bind('change',this.render);
		this.path.bind('path.load',this.refresh);
		this.fileList.bind('reload',this.refresh);
		this.fileList.bind('loading',this.loading);

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

		return this
	},
	addOne:function(file){ //新建的时候
		var _this = this;
		if(this.fileList.length === 1){
			this.$('.files').empty();
			this.$('.files').attr('class','files clearfix ' + this.showType);
		}
		file.set({
			power:_this.path.get('acl')
		})
		var fileItemView = new Sbox.Views.OutLinkFileItemView({model:file,type:this.showType,fileList:this.fileList,path:this.path});
		this.$('.files').prepend(fileItemView.render().el);

		var parent = this.path.get('pathId');
		var filename = fileItemView.$el.find('.file-name'),
			input = filename.find('input');
		filename.addClass('active');
		setTimeout(function(){
			input.focus();
			input.select();
		},30)
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
					//parentDirId = parentDirId == userId ? 'root' : parentDirId;//如果文件的belongDir是用户的id，那么将id替换成root
				}
			//console.log('pathId=' + pathId + ' uId=' + uId + ' parentDirId=' + parentDirId);
			if(parentDirId != pathId && parentDirId != uId) return;  //当前选中的文件夹id跟最后返回过来的数据的父目录id进行对比，如果不一样，那就什么都不做
																	 //解决多个目录切换过快的时候先点击的文件夹的数据比后点击的文件夹的数据后返回的问题
			this.$('.files').empty();
			this.fileList.each(function(file){
				file.set({
					power:_this.path.get('acl')
				})
				var fileItemView = new Sbox.Views.OutLinkFileItemView({model:file,type:_this.showType,fileList:_this.fileList,path:_this.path});
				_this.$('.files').append(fileItemView.render().el);
			})

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
		}else{
			//如果没有文件呢，操。
			this.$('.files').empty();
			this.$('.files').attr('class','files');
			if(this.path.get('type') === 'share' && this.path.get('pathId') === 'root'){
				this.$('.files').append($('<li class="not-get-shared">您还没有收到共享文件！ </li>'))
			}else{
				this.$('.files').append($('<li style="text-align:center; padding:20px 0; color:gray; font-size:16px;">'+ outlinkLanguage[outLinkInfo.language].emptyFolder +' </li>'))	
			}
		}
	},
	refresh:function(){
		var fileList = this.fileList;
		fileList.trigger('loading');
		fileList.fetch({
			data:{
				id:this.path.get('pathId') === '' ? 'root' : this.path.get('pathId'),
				userId:outLinkInfo.userId,
				date:outLinkInfo.date,
				sign:outLinkInfo.sign,
				_t:Math.random()
			}
		})
	},
	loading:function(){
		this.$('.files').empty();
		this.$('.files').attr('class','files');
		this.$('.files').append($('<li style="text-align:center; padding:20px 0; color:gray;"><span class="icon icon-loading"></span> '+ outlinkLanguage[outLinkInfo.language].loading +'</li>'))
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
			var path = this.path.get('path') + '/' + m.get('name'),
				pathIds = this.path.get('pathIds');
			pathIds.push(id);
			//this.path.addCache([path]);
			//Sbox.addNodeToTree(this.path.get('pathId') || this.path.get('uid'),[m],this.path.get('type'),'update');
			//Backbone.history.navigate( '!' + path,true);
			this.path.set({
				path:path,
				pathId:id,
				pathIds:pathIds
			})
			this.path.trigger('path.load')
		}
	}
})

//fileitem
/**
 * 文件夹外链文件
 * @class OutLinkFileItemView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.OutLinkFileItemView = Backbone.View.extend({/** @lends Sbox.Views.OutLinkFileItemView*/
	tagName:'li',
	className:'file',
	listTemplate:_.template($('#listview-file-template').html()),
	events:{ //各种快捷操作的点击事件绑定
		'click .checkbox'			: 'check',
		'click .file-name a'		: 'openFile',
		'click .file-icon a'		: 'openFile'
	},
	initialize:function(){
		this.type = this.options.type;
		this.fileList  = this.options.fileList;
		this.path = this.options.path;
		_.bindAll(this,'render');
		this.model.bind('change',this.render);
		// this.model.bind('change:name',this.updateName);
	},
	render:function(){
		var type = this.type;
		if(type === 'listview'){
			this.$el.html(this.listTemplate(this.model.toJSON()));
		}else{
			//this.$el.html(this.previewTemplate(this.model.toJSON()));
		}
		if(!this.model.isNew()){
			this.$el.attr('_id',this.model.id);
			this.$el.attr('id',this.model.id);
			this.$el.removeClass('isnew');
		}else{
			this.$el.addClass('isnew');
		}

		if(this.model.get('power')) this.$el.addClass('power' + this.model.get('power'));
		//if(this.model.get('creatorId') === userId) this.$el.addClass('ismine');
		if(!this.model.get('parentDir')) this.$el.addClass('isfile');

		this.model.get('checked') ? this.$el.addClass('selected'):this.$el.removeClass('selected');

		if(type === 'listview') this.$el.addClass('list-item');
		else this.$el.addClass('preview-item');
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
	openFile:function(e){
		var _this = this;
		if(this.model.get('parentDir')){//如果是目录
			setTimeout(function(){
				_this.fileList.trigger('loading');
			},20)
			var path = this.path.get('path') + '/' + this.model.get('name'),
				pathIds = this.path.get('pathIds'),
				id = this.model.get('id');
			pathIds.push(id)
			//this.path.addCache([path]);
			//Sbox.addNodeToTree(this.path.get('pathId') || this.path.get('uid'),[this.model],this.path.get('type'),'update');
			//Backbone.history.navigate( '!' + path,true);
			this.path.set({
				path:path,
				pathId:id,
				pathIds:pathIds
			},{silent:true})
			this.path.trigger('path.load')
			e.preventDefault();
			e.stopImmediatePropagation();
		}else{
			var filetype = getFileType(this.model.get('name'));
			if(isPreviewImgFile(this.model.get('name'),this.model.get('size'))){ //如果是图片预览
				Sbox.Preview(this.model,this.fileList);
				e.preventDefault();
			}
			else if(!previewFileType.test(filetype)){
				//Sbox.Fail('不支持该类型文件的在线预览');
				e.preventDefault();
			}else if(this.model.get('size') === 0){
				Sbox.Fail(outlinkLanguage[outLinkInfo.language].emptyFile);
				e.preventDefault();
			}

		}
	}
})
//filestat
/**
 * 文件夹外链文件状态统计
 * @class OutLinkFileStatView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.OutLinkFileStatView = Backbone.View.extend({/** @lends Sbox.Views.OutLinkFileStatView*/
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

/**
 * 文件夹外链文件管理
 * @class OutLinkFileManage 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.OutLinkFileManage = Backbone.View.extend({/** @lends Sbox.Views.OutLinkFileManage*/
	className:'list-table file-manage',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
	},
	render:function(){
		var sort = new Sbox.Views.OutLinkFileSortView({
			fileList : this.fileList,
			path : this.path
		}); 
		var filelist = new Sbox.Views.OutLinkFileListView({
			fileList : this.fileList,
			path : this.path
		});
		var filestat = new Sbox.Views.OutLinkFileStatView({
			fileList : this.fileList
		})
		this.$el.append(sort.render().el)
				.append(filelist.render().el)
				.append(filestat.render().el);
		return this;
	}
})
/**
 * 文件夹外链管理视图
 * @class OutLinkFileView 
 * @extends Backbone.View
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Views.OutLinkFileView = Backbone.View.extend({/** @lends Sbox.Views.OutLinkFileView*/
	className:'outlink-file',
	initialize:function(){
		this.fileList = this.options.fileList;
		this.path = this.options.path;
		this.render();
	},
	render:function(){
		var path = new Sbox.Views.OutLinkPathView({
			model : this.path
		}); 
		var manage = new Sbox.Views.OutLinkFileManage({
			fileList : this.fileList,
			path : this.path
		})
		this.$el.append(path.render().el)
				.append(manage.render().el)
				.appendTo($('#fileExplorer'));
		return this;
	}
});

/**
 * 文件夹外链驱动
 * @class OutLinkRouter 
 * @extends Backbone.Router
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Controllers.OutLinkRouter = Backbone.Router.extend({/** @lends Sbox.Controllers.OutLinkRouter*/
	// routes:{
	// 	'':''
	// },

	initialize:function(){
		var _this = this;
		$(window).bind('resize',function(){
			_this.resize();
		})

		this.outlinkPathModel = new Sbox.Models.linkPath();

		this.outlinkPathModel.set({ //初始化的时候初始外链文件夹信息
			path:'/' + outLinkInfo.name,
			pathId:outLinkInfo.id,
			pathIds:[outLinkInfo.id]
		})

		this.outlinkFileList = new Sbox.Collections.FileList([],{type:'outlink'})
		this.outlinkFileView = new Sbox.Views.OutLinkFileView({path:this.outlinkPathModel,fileList:this.outlinkFileList});

		var fileAction = $('#fileAction'),
			pass = fileAction.find('.file-pass input'),
			tips = fileAction.find('.file-pass .tips'),
			downloadBtn = fileAction.find('.file-btn input'),
			fileList = this.outlinkFileList,
			path = this.outlinkPathModel;

		if(!window.downloadForm){
			window.downloadForm = $('<form method="post" action="GetDirFiles!getFiles.action" style="display:none;"> \
				<input type="hidden" name="ids" /> \
				<input type="hidden" name="firstName" /> \
				<input type="hidden" name="resourceId" /> \
				<input type="hidden" name="fileId" /> \
				<input type="hidden" name="password" /> \
				<input type="hidden" name="userId" value="'+ outLinkInfo.userId +'" /> \
				<input type="hidden" name="sign" value="'+ outLinkInfo.sign +'" /> \
				<input type="hidden" name="date" value="'+ outLinkInfo.date +'" /> \
				<input type="hidden" name="sid" value="'+ outLinkInfo.sid +'" /></form>').appendTo($('body'));
		}

		fileList.bind('change',function(){
			if(fileList.getChecked().length === 0){
				downloadBtn.addClass('btn32-disabled');
			}else{
				downloadBtn.removeClass('btn32-disabled');
			}
		})
		fileList.bind('reset',function(){
			if(fileList.getChecked().length === 0){
				downloadBtn.addClass('btn32-disabled');
			}else{
				downloadBtn.removeClass('btn32-disabled');
			}
		})

		if(pass[0]){
			pass.on('keypress',function(e){
				if(e.keyCode === 13){
					downloadBtn.trigger('click');
				}
			})
		}

		downloadBtn.on('click',function(){ //下载
			var ids = [],firstName;; //fix bug @ 2013-02-20
			var files = fileList.getChecked(),
				n = files.length,
				len = fileList.length;
			if(n === 0) return;
			if(n === 1 && !files[0].get('parentDir')){ //如果只选择了一个文件
				downloadForm.find('input').eq(0).val('');
				downloadForm.find('input').eq(1).val('');
				downloadForm.find('input').eq(2).val('');
				downloadForm.find('input').eq(3).val(files[0].get('id'));
			}else if(n === len){ //如果全选
				downloadForm.find('input').eq(0).val('');
				downloadForm.find('input').eq(1).val('');
				downloadForm.find('input').eq(2).val(path.get('pathId'));
				downloadForm.find('input').eq(3).val('');
			}else{ //否则就是普通的多选
				firstName = files[0].get('name');
				_(files).each(function(file){
					ids.push({
						resourceId:file.get('id'),
						flag:file.get('parentDir') ? 1 : 0
					})
				})
				downloadForm.find('input').eq(0).val(jsonToString(ids));
				downloadForm.find('input').eq(1).val(firstName);
				downloadForm.find('input').eq(2).val('');
				downloadForm.find('input').eq(3).val('');
			}

			if(pass[0]){ //如果有密码，那么需要先校验密码，然后把密码代入进去
				var password = pass.val();
				if(password === ''){
					tips.html('<span class="error">'+ outlinkLanguage[outLinkInfo.language].passwordEmpty +'</span>');
				}else{
					$.post('/CheckShareDirPassword!share.action',{
						password:password,
						resourceId:outLinkInfo.id,
						userId:outLinkInfo.userId,
						sign:outLinkInfo.sign,
						date:outLinkInfo.date
					},function(r){
						if(r.code === 200){
							tips.empty();
							downloadForm.find('input').eq(4).val(password);
							downloadForm.submit();
						}else{
							tips.html('<span class="error">'+ outlinkLanguage[outLinkInfo.language].passwordError +'</span>');
						}
					},'json')
				}
			}else{
				downloadForm.submit();
			}

		})

		this.outlinkFileView.$el.show();
		this.outlinkPathModel.trigger('path.load');

		this.resize();
	},
	resize:function(){
		var fileContainer = $('#fileExplorer .list-body'),
			fileAction = $('#fileAction')

		var winHeight = $(window).height(),
			headHeight = $('#header').outerHeight(true),
			fileActionHeight = fileAction.height(),
			fileListHeight = winHeight - headHeight - fileActionHeight- 250;

		fileContainer.height(fileListHeight);
	}
})


$(document).ready(function(){
	new Sbox.Controllers.OutLinkRouter();
	//Backbone.history.start();
})
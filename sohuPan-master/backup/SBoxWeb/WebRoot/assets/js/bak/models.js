/**
 * @fileOverview 主要model定义
 * @author angelscat angelscat@vip.qq.com
 * 
 */

//文件
/**
 * 文件
 * @class File
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.File = Backbone.Model.extend({
	/** @lends Sbox.Models.File*/
	// type_mapping: {
	// 	image: ["jpg", "jpeg", "bmp", "gif", "tif", "png", "raw", "ai"],
	// 	audio: ["ogg", "wma", "wav", "ape", "acc", "mid", "ra", "mp3", "flac", "cue"],
	// 	video: ["mpeg", "mpg", "dat", "avi", "rm", "rmvb", "mov", "wmv", "asf", "3gp", "mp4", "swf", "flv", "mfv", "fla"],
	// 	document: ["doc", "ppt", "xls", "wps", "rtf", "txt", "pdf", "hlp", "chm", "dat", "utf", "psd"],
	// 	compress: ["tar", "zip", "rar", "tgz", "rpm", "gz", "cab", "lha", "ace", "iso", "bin", "arj"],
	// 	application: ["exe", "com", "msi", "bat", "reg", "scr", "sys"],
	// 	web: ["htm", "html", "asp", "aspx", "php", "jsp", "cgi", "css", "xml", "mht"]
	// },
	// type_info: {
	// 	image: {name: "图片"},
	// 	audio: {name: "音频"},
	// 	video: {name: "视频"},
	// 	document: {name: "文档"},
	// 	compress: {name: "压缩文档"},
	// 	application: {name: "应用"},
	// 	web: {name: "网页"},
	// 	Directory: {name: "文件夹"},
	// 	mine: {name: "文件夹"},
	// 	recive: {name: "文件夹"},
	// 	directory_share: {name: "文件夹"},
	// 	"default": {name: "文件"}
	// },

	/**
	 * 更新文件名，包括新建和重命名
	 * @param {String} name 重命名后的文件名
	 */
	update:function(name){
		var parent = this.get('parentDir') || 'root',
			//name = this.get('name'),
			//previousName = this.previous('name'),
			shareFlag = this.get('shareFlag'),
			type = (typeof this.get('parentDir') !== 'undefined') ? 'dir' : 'file',
			id = this.get('id');
		var _this = this;
		if(this.isRenaming) return; //如果正在重命名或者新建，那么就不再触发。
		if(this.isNew()){
			this.isRenaming = true;
			$.post('/CreateDir!createDir.action',{
				tagertId:parent,
				name:name,
				shareFlag: this.get('power')?1:shareFlag 
			},function(r){
				_this.isRenaming = false;
				if(r.code === 701 || r.code === 403){
					Sbox.Login();
				}else if(r.code === 500){
					Sbox.Error({
						message:'文件夹已存在',
						callback:function(){
							_this.set({name:''},{silent:true});
							_this.trigger('add.fail');
						}
					});
				}else if(!r.code){
					_this.set(r);
					_this.trigger('add.success');
				}else{
					Sbox.Error({
						message:'创建失败',
						callback:function(){
							_this.set({name:''},{silent:true});
							_this.trigger('add.fail');
						}
					})
				}
			},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			});
		}else{
			// 重命名
			this.isRenaming = true;
			$.post('/RenameResource!rename.action',{
				id:id,
				rename:name,
				type: type
			},function(r){
				_this.isRenaming = false;
				if(r.code === 701 || r.code === 403){
					Sbox.Login();
				}else if(r.code === 200){
					_this.set({name:name});
					_this.trigger('rename.success');
				}else if(r.code === 601){
					Sbox.Error({
						message:'文件名非法',
						onHide:function(){
							_this.trigger('rename.fail');
						}
					})
				}else{
					Sbox.Error({
						message:'重命名失败',
						onHide:function(){
							//_this.set({name:previousName});
							_this.trigger('rename.fail');
						}
					});
				}
			},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			})
		}
	},
	/**
	 * 更新备注
	 * @param {String} remark 备注
	 */
	updateRemark:function(remark){
		var parent = this.get('parentDir') || 'root',
            note = this.get('note'),
            type = (typeof this.get('parentDir') !== 'undefined') ? 'dir' : 'file',
            id = this.get('id');
        var _this = this;
     	
		if(this.remarking) return;//如果正在修改备注，那么就不再触发。
		this.remarking = true;
        $.post('/UpdateResource!update.action',{
            id:id,
            note:remark,
            type: type
        },function(r){
        	_this.remarking = false;
            if(r.code === 701 || r.code === 403){
				Sbox.Login();
			}else if(r.code === 200){
                _this.set({note:remark})
                _this.trigger('remark.success')
            }else{
                Sbox.Error({
                    message:r.message,
                    callback:function(){
                        //_this.set({note:_this.previous('note')});
                        _this.trigger('remark.fail');
                    }
                });
            }
        },'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 设置文件夹大小
	 * @param {Number} size 大小
	 */
	setsize:function(size){
		var type = this.get('parentDir') ? 'dir' : 'file',
			id = this.get('id');
		var _this = this;
		$.post('/UpdateResource!update.action',{
			id:id,
			dirSize:size,
			type:type
		},function(r){
			_this.trigger('setsize.end',r,size);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 上锁
	 * @param {String} time 时间
	 */
	lock:function(time){
		this.trigger('lock.begin');
		var id = this.get('id');
		var _this = this;
		$.post('/LockFile!lock.action',{
			resourceId:id,
			LockTime:time || ''
		},function(r){
			_this.trigger('lock.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 解锁
	 */
	unlock:function(){
		this.trigger('unlock.begin');
		var id = this.get('id');
		var _this = this;
		$.post('/UnLockFile!unLock.action',{
			resourceId:id
		},function(r){
			_this.trigger('unlock.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 获取外链
	 */
	getOutChain:function(type){ //获取外链
		if(this.get('hasOutChain') && this.get('outlink')){ //如果已经存在外链，那么直接显示
			this.trigger('getoutchain.end');
			return;
		}
		this.trigger('getoutchain.begin');
		var _this = this;
		$.get('/OutLink!get.action?id=' + this.get('id') + '&shareType='+ (this.get('parentDir') ? 1 : 0) +'&_t=' + Math.random(),function(r){
			_this.trigger('getoutchain.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 编辑外链信息
	 */
	editOutChain:function(){
		if(this.get('hasOutChain') && this.get('outlink')){ //如果已经存在外链，那么直接显示
			this.trigger('beforeedit');
			return;
		}
		var _this = this;
		Sbox.Loading('正在获取外链信息...');
		$.get('/OutLink!get.action?id=' + this.get('id') + '&shareType='+ (this.get('parentDir') ? 1 : 0) +'&_t=' + Math.random(),function(r){
			Sbox.Loading().remove();
			_this.trigger('beforeedit',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 创建外链
	 * @param {Boolean} needPass 是否需要密码
	 * @param {String} p 密码
	 * @param {String} time 失效时间
	 * @param {String} note 文件说明
	 */
	createOutChain:function(needPass,p,time,note,power,language){
		var _this = this;
		if(typeof needPass === 'undefined'){ //直接创建的情况下的默认值
			needpass = 0;
			p = '';
			var d = new Date();
			d = d.valueOf() + 30 * 24 * 60 * 60 * 1000; //默认过期时间是一个月
			d = new Date(d);
			time = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + '00:00:00';
			note = '';
		}
		//console.log(this.get('hasOutChain'))
		if(this.get('outlink')){ //设置外链
			this.trigger('editoutchain.begin');
			$.post('/OutLink!update.action',{
				id:this.get('id'),
				needpass:needPass,
				password:p,
				expiredate:time,
				note:note,
				shareType:this.get('parentDir') ? 1 : 0,
				sharePrivilege:power,
				language:language
			},function(r){
				_this.trigger('editoutchain.end',r,needPass,p,time,note,power,language)
			},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			})
		}else{//生成外链
			this.trigger('createoutchain.begin');
			$.post('/OutLink!create.action',{
				id:this.get('id'),
				password:p,
				expiredate:time,
				note:note,
				shareType:this.get('parentDir') ? 1 : 0,
				sharePrivilege:power,
				language:language
			},function(r){
				_this.trigger('createoutchain.end',r,needPass,p,time,note,power,language);
			},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			})
		}
	},
	/**
	 * 发送外链
	 * @param {Array} mails 邮箱列表
	 * @param {String} content 邮件说明
	 */
	sendOutChain:function(mails,content){
		this.trigger('sendoutchain.begin');
		var _this = this;
		var m =[];
		_(mails).each(function(mail){
			m.push($.trim(mail));
		})
		$.post('SendEmail!send.action',{
			id:this.get('id'),
			email:m.join(';'),
			body:content,
			shareType:this.get('parentDir') ? 1 : 0
		},function(r){
			_this.trigger('sendoutchain.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},

	//创建外链
	createUploadLink:function(linkinfo){
		var _this = this;

		if(this.get('uploadlink')){
			this.trigger('edituploadlink.begin');
			$.post('/OutLink!update.action',{ 
				id:this.get('id'),
				password:linkinfo.password,
				expiredate:linkinfo.time,
				shareType:2
			},function(r){
				_this.trigger('edituploadlink.end',r,linkinfo.password,linkinfo.time);
			},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			})
		}else{
			this.trigger('createuploadlink.begin');
			$.post('/OutLink!create.action',{
				id:this.get('id'),
				password:linkinfo.password,
				expiredate:linkinfo.time,
				shareType:2
			},function(r){
				_this.trigger('createuploadlink.end',r,linkinfo.password,linkinfo.time);
			},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			})
		}
	},
	editUploadLink:function(){
		if(this.get('anonymousUpload') && this.get('uploadlink')){
			this.trigger('edituploadlink.before');
			return;
		}

		var _this = this;
		Sbox.Loading('正在获取匿名上传链接信息...');
		$.get('/OutLink!get.action?id=' + this.get('id') + '&shareType=2&_t=' + Math.random(),function(r){
			Sbox.Loading().remove();
			_this.trigger('edituploadlink.before',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	getUploadLink:function(){
		if(this.get('anonymousUpload') && this.get('uploadlink')){
			this.trigger('getuploadlink.end');
			return;
		}
		this.trigger('getuploadlink.begin');
		var _this = this;
		$.get('/OutLink!get.action?id=' + this.get('id') + '&shareType=2&_t=' + Math.random(),function(r){
			// console.log(r);
			_this.trigger('getuploadlink.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	}
})

//pager
/**
 * 分页
 * @class Pager
 * @extends Backbone.Model
 * @constructor
 * @param {Object} opt
 */
Sbox.Models.Pager = Backbone.Model.extend({
	/** @lends Sbox.Models.Pager*/
	defaults:{
		curpage:1,
		total:1000,
		pagesize:20,
		middleCount:5
	},
	/**
	 * 获取总页码
	 */
	getPapeCount:function(){
		return Math.ceil(this.get('total') / this.get('pagesize'));
	}
})

//path
/**
 * path
 * @class Path
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.Path = Backbone.Model.extend({
	/** @lends Sbox.Models.Path*/
	defaults:{
		path:'/',
		pathId:'root',
		upload:true, //文件夹权限
		create:true
	},
	initialize:function(){
		// this.set({
			
		// },{silent:true})
		this.cache = {};
		this.cache['/' + MY_DISK_NAME] = true;
		this.cache['/' + SHARE_DISK_NAME] = true;
	},
	addCache:function(paths){ //增加路径缓存
		var cache = this.cache;
		_(paths).each(function(v,n){
			var path = v;
			do{
				cache[path] = true;
				path = path.substring(0,path.lastIndexOf('/'));
			}while(path)
		})
	},
	delCache:function(path){ //删除路径缓存，包括子目录
		var cache = this.cache;
		_(cache).each(function(v,n){
			if(n.indexOf(path) === 0){
				delete cache[n];
			}
		})
	}
})

/**
 * linkPath
 * @class linkPath
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.linkPath = Backbone.Model.extend({
	/** @lends Sbox.Models.linkPath*/
	defaults:{
		path:'',
		pathId:'',
		pathIds:''
	},
	initialize:function(){

	}
})

/**
 * ToolBar
 * @class ToolBar
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.ToolBar = Backbone.Model.extend({
	/** @lends Sbox.Models.ToolBar*/
	defaults:{
		//currentPath:'', //当前路径
		selectedFiles:[] //已选择的文件，最好能够传入models
	},
	initialize:function(){
		this.reset();
	},
	/**
	 * 设置文件列表，根据文件列表判断是否：单个文件/多个文件/单个文件夹/多个文件夹/文件夹和文件都有
	 * 然后设置不同的操作，然后才触发change通知界面修改
	 * @param {Array} files 文件列表
	 */
	setSelectedFiles:function(files){
		this.set({
			selectedFiles:files
		},{silent:true});

		this.reset();
		if(files.length === 0 ){ // 如果没有选择
			return;
		}else if(files.length === 1){ //如果是单个文件或文件夹
			var	isUser = files[0].get('email'),
				parentDir = files[0].get('parentDir'),
				isRoot = (parentDir == userId) || (parentDir === 'root'),
				fileType = !isUser && getFileType(files[0].get('name')),
				isPreview = previewFileType.test(fileType),
				shareFlag = files[0].get('shareFlag'),
				power = files[0].get('power'),
				isShareFile = files[0].get('isShareFile');
			if(fileType === 'rar' || fileType === 'zip'){
				if(files[0].get('size') * 1 > 100 * 1024 * 1024){
					isPreview = false;
				}
			}
			if(isUser){ //如果是共享用户，那么什么都不能操作；

			}else if(parentDir){ //如果是目录
				if(files[0].get('acl')){ //如果有ACL权限控制，那说明是共享目录的根目录，那么只显示退出
					this.set({
						quitshare:files[0].get('type') === 'p',
						showmember:true
					})

					if(files[0].get('acl') === 1 || files[0].get('acl') === 2 || files[0].get('acl') === 3){
						this.set({
							download:true,
							outchain:true,
							hasOutChain:files[0].get('hasOutChain')
						})
					}
				}else{
					if(!power){
						this.set({
							uploadlink:true,
							anonymousUpload:files[0].get('anonymousUpload')
						})
					}
					if(!power || (power === 2 && files[0].get('creatorId') === userId) || power === 3){ //否则如果是自己的文件夹，或者拥有全部操作权限
						this.set({
							upload:true,
							download:true,
							outchain:true,
							hasOutChain:files[0].get('hasOutChain'),
							share:isRoot,
							remark:true,
							move:isShareFile || shareFlag ? false : true, //我的共享文件无移动复制，或者共享目录也无移动操作
							//copy:power ? false : true,
							rename:true,
							del:true,
							size:shareFlag,
							hasShare:shareFlag
						})
					}else if(power === 4 || power === 5 || power === 6){ //文件夹无操作
					}else{
						this.set({
							download:true,
							outchain:true,
							hasOutChain:files[0].get('hasOutChain')
						})
					}
					//1和2权限情况下，对文件夹都无任何操作权限。
				}
			}else{ //如果是文件
				if(!power || (power === 2 && files[0].get('creatorId') === userId) || power === 3){ //如果是自己的文件，或者拥有全部操作权限
					this.set({
						preview:isPreview,
						download:true,
						outchain:true,
						remark:true,
						move:isShareFile ? false : true,//我的共享文件无移动复制
						//copy:power ? false : true,
						rename:true,
						del:true,
						history:true,
						//lock:!files[0].get('lock'),
						//unlock:files[0].get('lock') && files[0].get('locker') === userId,
						hasOutChain:files[0].get('hasOutChain')
					})
				}else if(power === 4 || power === 6){ //仅上传和预览上传 只有有预览权限；
					this.set({
						preview:isPreview
					})
				}else if(power === 2 || power === 1){ //可查看、可查看上传 权限；
					this.set({
						preview:isPreview,
						download:true,
						outchain:true,
						hasOutChain:files[0].get('hasOutChain')
					})
				}
			}
		}else{ //如果是多文件或文件夹
			var	isUser = files[0].get('email'),
				allIsFile = true, //是否全部是文件
				allIsMine = true, //是否全部都是我的文件
				hasShareFolder = false, //是否有共享目录
				power = files[0].get('power'), //同一个目录下的权限肯定相同
				isShareFile = files[0].get('isShareFile'),
				dir = null; 
			_(files).each(function(file){ 
				if(typeof file.get('parentDir') !== 'undefined'){ //遍历检查是否全部是文件
					allIsFile = false;
					if(!dir) dir = file; //将第一个不是文件的文件夹缓存
				}
				if(!(!files[0].get('power') || (files[0].get('power') === 2 && file.get('creatorId') === userId))){ //如果不是我的文件或文件夹
					allIsMine = false;
				}
				if(file.get('shareFlag')){
					hasShareFolder = true;
				}

			})
			if(isUser){ //如果是共享用户，那么什么都不能操作；

			}else if(allIsFile){ //如果全部是文件
				if(allIsMine || power === 3){ //如果全都是我的，或者都拥有全部权限
					this.set({
						download:true,
						move:isShareFile ? false : true,
						//copy:power ? false : true,
						del:true
					})
				}else if(power === 6 || power === 5 || power === 4){

				}else if(power === 2 || power === 1){ //否则，只能下载
					this.set({
						download:true
					})
				}
			}else{ //如果不全都是文件，包括全部是文件夹或者文件文件夹的组合
				if(dir.get('acl')){ //如果选中的第一个文件夹拥有acl权限控制，那么肯定是在共享文件根目录下的多选
					if(dir.get('acl') <= 3){ //1，2，3才能下载
						this.set({
							//quitshare:true,
							download:true
						})
					}
				}else{ //否则
					if(allIsMine || power === 3){ //如果全部是我自己的，或者拥有全部权限
						this.set({
							download:true,
							move:isShareFile || hasShareFolder ? false : true,
							//copy:power ? false : true,
							del:true
						})
					}else if(power >= 4){ //4，5，6没有操作

					}else if(power === 1 || power === 2){ //1,2 只能下载
						this.set({
							download:true
						})
					}
				}
			}
		}

		this.trigger('change');
	},
	reset:function(){
		this.set({
			upload:false,
			quitshare:false, //显示退出共享
			showmember:false,//显示成员
			preview:false, //显示预览
			download:false, //是否显示下载
			share:false, //是否显示共享
			outchain:false, //是否显示外链
			uploadlink:false,//是否显示匿名上传
			remark:false, //是否显示备注
			move:false, //是否显示移动
			copy:false, //是否显示复制
			rename:false, //是否显示重命名
			del:false, //是否显示删除
			history:false, //是否显示版本
			lock:false, //是否显示上锁
			unlock:false,//是否显示解锁
			size:false, //是否显示设置文件夹大小,
			hasShare:false,
			hasOutChain:false,
			anonymousUpload:false
		},{silent:true})
	}
})

/**
 * ContextMenu
 * @class ContextMenu
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.ContextMenu = Sbox.Models.ToolBar.extend({

})

/**
 * LinkToolbar
 * @class LinkToolbar
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.LinkToolbar = Backbone.Model.extend({
	/** @lends Sbox.Models.LinkToolbar*/
	defaults:{
		selectedFiles : []
	},
	initialize:function(){
		this.reset();
	},
	/**
	 * 设置文件列表，根据文件列表判断是否：单个文件/多个文件/单个文件夹/多个文件夹/文件夹和文件都有
	 * 然后设置不同的操作，然后才触发change通知界面修改
	 * @param {Array} files 文件列表
	 */
	setSelectedOutChains:function(files){
		this.set({
			selectedFiles:files
		},{silent:true});

		this.reset();

		if(files.length === 0) return;
		if(files.length === 1){
			this.set({
				send:true,
				copy:true,
				edit:true,
				del:true
			})
		}else{
			this.set({
				del:true
			})
		}

		this.trigger('change');
	},
	reset:function(){
		this.set({
			send:false,
			copy:false,
			edit:false,
			del:false
		},{silent:true});
	}
})

/**
 * LinkContextMenu
 * @class LinkContextMenu
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.LinkContextMenu = Sbox.Models.LinkToolbar.extend({

})

/**
 * UploadLinkToolbar
 * @class LinkToolbar
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.UploadLinkToolbar = Backbone.Model.extend({
	/** @lends Sbox.Models.LinkToolbar*/
	defaults:{
		selectedFiles : []
	},
	initialize:function(){
		this.reset();
	},
	/**
	 * 设置文件列表，根据文件列表判断是否：单个文件/多个文件/单个文件夹/多个文件夹/文件夹和文件都有
	 * 然后设置不同的操作，然后才触发change通知界面修改
	 * @param {Array} files 文件列表
	 */
	setSelectedUploadLinks:function(files){
		this.set({
			selectedFiles:files
		},{silent:true});

		this.reset();

		if(files.length === 0) return;
		if(files.length === 1){
			this.set({
				copy:true,
				edit:true,
				del:true
			})
		}else{
			this.set({
				del:true
			})
		}

		this.trigger('change');
	},
	reset:function(){
		this.set({
			copy:false,
			edit:false,
			del:false
		},{silent:true});
	}
})

/**
 * LinkContextMenu
 * @class LinkContextMenu
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.UploadLinkContextMenu = Sbox.Models.UploadLinkToolbar.extend({

})
/**
 * RecycleToolbar
 * @class RecycleToolbar
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.RecycleToolbar = Backbone.Model.extend({
	/** @lends Sbox.Models.RecycleToolbar*/
	defaults:{
		selectedFiles : []
	},
	initialize:function(){
		this.reset();
	},
	/**
	 * 设置文件列表，根据文件列表判断是否：单个文件/多个文件/单个文件夹/多个文件夹/文件夹和文件都有
	 * 然后设置不同的操作，然后才触发change通知界面修改
	 * @param {Array} files 文件列表
	 */
	setSelectedOutChains:function(files){
		this.set({
			selectedFiles:files
		},{silent:true});

		this.reset();

		if(files.length === 0) return;
		if(files.length >= 1){
			this.set({
				reduce:true,
				del:true
			})
		}
		this.trigger('change');
	},
	reset:function(){
		this.set({
			reduce:false,
			del:false
		},{silent:true});
	}
})
/**
 * RecycleContextMenu
 * @class RecycleContextMenu
 * @extends Backbone.Model
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Models.RecycleContextMenu = Sbox.Models.RecycleToolbar.extend({

})

//文件列表
/**
 * 文件列表
 * @class FileList
 * @extends Backbone.Collection
 * @constructor
 * @param {Object} [opt]
 */
Sbox.Collections.FileList = Backbone.Collection.extend({
	/** @lends Sbox.Collections.FileList*/
	model:Sbox.Models.File,
	// url:function(){
	// 	return 'filelist.json';
	// },
	initialize:function(m,options){
		var type = options.type;
		if(type === 'mine'){
			this.url = '/GetNodeList!getService.action'
		}else if(type === 'public'){
			this.url = '/GetPublicNodeList!getService.action'
		}else if(type === 'share'){
			this.url = '/GetShareDir!getNodes.action'
		}else if(type === 'outchain'){
			this.url = '/OutLink!getAll.action'
		}else if(type === 'uploadlink'){
			this.url = '/OutLink!getAnonymousAll.action'
		}else if(type === 'recyclebin'){
			this.url = '/Trash!get.action'
		}else if(type === 'outlink'){
			this.url = '/GetDirAndFile!getService.action'
		}
	},
	// comparator:function(file){
		// return file.get('parentDir') !== 'undefined';
	// },

	/**
	 * 获取选中的文件列表
	 * @return {Array} files 文件列表
	 */
	getChecked:function(){
		var files = [];
		this.each(function(file){
			if(file.get('checked')) files.push(file)
		})
		return files;
	},
	/**
	 * 选中所有文件
	 */
	checkAll:function(){
		this.each(function(file){
			if(file.isNew()) return;
			file.set({checked:true});
		})
	},
	/**
	 * 不选所有文件
	 */
	uncheckAll:function(){
		this.each(function(file){
			if(file.isNew()) return;
			file.set({checked:false});
		})
	},
	/**
	 * 通过id选中某个文件
	 * @params {String} id 文件id
	 */
	checkById:function(id){
		this.get(id).set({checked:true});
	},
	/**
	 * 通过id不选中某个文件
	 * @params {String} id 文件id
	 */
	uncheckById:function(id){
		this.get(id).set({checked:false});
	},
	/**
	 * 通过id反选某个文件
	 * @params {String} id 文件id
	 */
	toggelCheckById:function(id){
		var checked = this.get(id).get('checked');
		checked ? this.uncheckById(id) : this.checkById(id);
	},
	/**
	 * 返回某id的文件的序号
	 * @params {String} id 文件id
	 * @return {Number} i 序号
	 */
	getIndexOfById:function(id){
		var file = this.get(id);
		return this.indexOf(file);
	},
	/**
	 * 获取该文件列表的文件夹个数
	 * @return {Number} n 个数
	 */
	getFoldNum:function(){
		var n = 0;
		this.each(function(file){
			if(file.isNew()) return;
			if(typeof file.get('parentDir') !== 'undefined' || typeof file.get('email') !== 'undefined') n++;
		})
		return n;
	},
	/**
	 * 获取该文件列表的文件个数
	 * @return {Number} n 个数
	 */
	getFileNum:function(){
		return this.length - this.getFoldNum();
	},
	/**
	 * 获取指定文件列表的的文件和文件夹id
	 * @params {Array} files 文件数组
	 * @return {Object} o 文件和文件夹ids
	 */
	getIds:function(files){
		var dirIds = [] , fileIds = [];
		_(files).each(function(file){
			if(typeof file.get('parentDir') !== 'undefined'){
				dirIds.push(file.get('id'));
			}else{
				fileIds.push(file.get('id'));
			}
		});

		return {
			dirIds:dirIds,
			fileIds:fileIds
		}
	},
	/**
	 * 删除指定的文件
	 * @params {Array} files 文件数组
	 */
	deleteFiles:function(files){
		var _this = this;
		this.trigger('delete.start');
		var ids = this.getIds(files);
		$.post('/DeleteObject!delete.action',{
			dirIds:ids.dirIds.join(','),
			fileIds:ids.fileIds.join(',')
		},function(r){
			_this.trigger('delete.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		});
	},
	/**
	 * 移动指定的文件
	 * @params {Array} files 文件数组
	 * @params {Boolean} keepOrigin 是否保留，保留为复制，不保留为移动
	 * @params {String} targetId 目标目录id
	 * @params {String} isReduce 是否是还原
	 */
	moveFiles:function(files,keepOrigin,targetId,isReduce){
		var _this = this;
		if(isReduce){
			url = '/MoveRestoreResource!move.action';
			this.trigger('restore.begin');
		}else if(keepOrigin){
			url = '/CopyResource!copy.action';
			this.trigger('copy.start');
		}else{
			url = '/MoveResource!move.action';
			this.trigger('move.start');
		}
		var ids = this.getIds(files);
		$.post(url,{
			targetId:targetId,
			dirIds:ids.dirIds.join(','),
			fileIds:ids.fileIds.join(',')
		},function(r){
			if(isReduce){
				_this.trigger('restore.end',r,targetId);
			}else if(keepOrigin){
				_this.trigger('copy.end',r,targetId);
			}else{
				_this.trigger('move.end',r,targetId);
			}
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 删除文件外链
	 * @params {Array} files 文件数组
	 */
	deleteOutchains:function(files){
		var _this = this;
		this.trigger('deleteoutchain.begin');
		var ids = this.getIds(files);
		//console.log(ids);
		$.post('/OutLink!delete.action',{
			dirIds:ids.dirIds.join(','),
			fileIds:ids.fileIds.join(',')
		},function(r){
			_this.trigger('deleteoutchain.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 删除匿名上传
	 * @params {Array} files 文件数组
	 */
	deleteUploadLinks:function(files){
		var _this = this;
		this.trigger('deleteuploadlink.begin');
		var ids = this.getIds(files)
		$.post('/OutLink!delete.action',{ //TODO 
			dirIds:ids.dirIds.join(','),
			fileIds:ids.fileIds.join(','),
			shareType:files[0].get('anonymousUpload') ? 2 : ''
		},function(r){
			_this.trigger('deleteuploadlink.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 还原文件
	 * @params {Array} files 文件数组
	 */
	restore:function(files){
		var _this = this;
		this.trigger('restore.begin');
		var ids = this.getIds(files);
		$.post('/Trash!regain.action',{
			dirIds:ids.dirIds.join(','),
			fileIds:ids.fileIds.join(',')
		},function(r){
			_this.trigger('restore.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		});
	},
	/**
	 * 彻底删除
	 * @params {Array} files 文件数组
	 */
	completeDelete:function(files){
		var _this = this;
		this.trigger('completedelete.begin')
		var ids = this.getIds(files);
		$.post('/Trash!delete.action',{
			dirIds:ids.dirIds.join(','),
			fileIds:ids.fileIds.join(',')
		},function(r){
			_this.trigger('completedelete.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 清空回收站
	 */
	empty:function(){
		var _this = this;
		this.trigger('empty.begin');
		$.post('/Trash!clear.action',function(r){
			_this.trigger('empty.end',r)
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	},
	/**
	 * 退出共享
	 * @params {Array} files 文件数组
	 */
	quitshare:function(files){
		var _this = this;
		this.trigger('quit.begin');
		var ids = this.getIds(files);
		$.post('/ShareDir!quit.action',{
			dirIds:ids.dirIds.join(',')
		},function(r){
			_this.trigger('quit.end',r);
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		});
	}
})

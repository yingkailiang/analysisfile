(function($,window){
	if(!window.com_sohupan) window.com_sohupan = {};
	//文件列表每个项
	var panItem = function(options) {
		//this.$el = $(options.el);
		this.data = options.data;
		this.direTemplate = $("#panDireItemTemplate").html();
		this.fileTemplate = $("#panFileItemTemplate").html();	
		this.initialize();
	};

	$.extend(panItem.prototype, {
		$ : function(ele) {
			return this.$el.find(ele);
		},
		initialize : function() {
			var self = this;
			self.structureIni();
			self.events();	
		},
		structureIni : function() {
			var self = this;
				data = self.data;
			//如果有parentDir，则说明为文件夹
			if(data.parentDir) {
				self.$el = $(self.direTemplate);
				self.$el.addClass("type-dire");
				//如果文件夹里面没有内容，把
				// if(!data.hasSon) {
				// 	self.$el.children(".pan-file-content").addClass("no-child");
				// }
			}
			//否则是普通文件
			else {
				var extName = self.getFileExt(data.name);
				self.$el = $(self.fileTemplate);
				if(extName) {
					self.$el.addClass("type-" + extName);
				}
			}
			self.$el.find(".pan-file-name").text(data.name);

			self.$content = this.$el.children(".pan-file-content");
		},
		events : function() {
			var self = this;
			if(data.parentDir) {
				self.expandFold();
			}
			else {
				self.selectFile();
			}
		},
		//打开文件夹
		expandFold : function() {
			var self = this;
			self.$el.children(".pan-file-content").not(".no-child").on("click", ".pan-tri", function(e) {
				var $ele = $(e.target);
				if(self.isExtend) {
					self.isExtend = false;
					self.$content.removeClass("expand");
					//$ele.removeClass("selected");
					self.$el.children(".pan-file-list").slideUp();
				}
				else{
					self.isExtend = true;
					self.$content.addClass("expand");
					//$ele.addClass("selected");
					//如果没有下载
					if(!self.isLoaded) {
						var fileList = new panList({el : "<ul class='pan-file-list'></ul>"});
						fileList.$el.on("fileList:loaded:start", $.proxy(self.listLoading, self));
						fileList.$el.on("fileList:loaded:success", $.proxy(self.listLoadSuccess, self));
						fileList.getList(self.data.id);
						self.isLoaded = true;
					}
					else {
						self.$el.children(".pan-file-list").slideDown();
					}
				}			
			});
		},
		//选中文件
		selectFile : function() {
			var self = this;
			self.$el.on("click", ".pan-checkbox", function(e) {
				var $ele = $(e.target);
				if(self.isSelected) {
					self.isSelected = false;
					self.$el.trigger("file:selectedCancel", self);
					$ele.removeClass("selected");
				}
				else{
					self.isSelected = true;
					self.$el.trigger("file:selected", self);
					$ele.addClass("selected");
				}			
			});
		},
		listLoading : function(e, $fileList) {
			var self = this;
			self.$el.addClass("loading");
		},
		listLoadEnd : function() {
			var self = this;
			self.$el.removeClass("loading");
		},
		//文件夹下级目录加载
		listLoadSuccess : function(e, $fileList) {
			var self = this;
			self.$el.append($fileList);
			self.listLoadEnd();	
		},
		//获得文件扩展名
		getFileExt : function(name) {
			var i = name.lastIndexOf(".");
			if(i == -1) {
				return false;
			}
			return name.substr(i + 1).toLowerCase();
		}
	});

	//var a = new panItem({el : ".pan-file-item:eq(0)"});
	//var b = new panItem({el : ".pan-dire-item:eq(1)",data : {"belongDir":"0d4b0ba8a2f94c58afb5b17264683e0e","createDate":1354862195000,"createTime":"2012-12-07 14:36:35","creatorId":14429,"deleted":0,"followDelete":0,"hasOutChain":0,"id":"aaad8129-653d-41f5-aae9-2dd2878d5e1f","lock":0,"lockTime":"2012-12-07 14:36:35","locker":0,"modifyDate":1354862195000,"modifyTime":"2012-12-07 14:36:35","name":"Cocoon-Chupee(CD版).lrc","nameindex":1,"note":"","operator":14429,"ownerId":14429,"privilege":3,"sboxFileVersion":null,"size":870,"sourcename":"Cocoon-Chupee(CD版).lrc","table":"","thumbnailsKey":"","versionNumber":"V1"}});

	//文件列表
	var panList = function(options) {
		this.$el = $(options.el);
		this.initialize();
	};

	$.extend(panList.prototype, {
		initialize : function() {
			this.models = [];
		},
		getList : function(id) {
			var self = this;
			self.$el.trigger("fileList:loaded:start", self.$el);


			self.port = sogouExplorer.extension.connect({name:'ajax'});
			self.port.postMessage({
				type:'list',
				id:id
			})
			self.port.onMessage.addListener(handle)

			function handle(msg){
				if(msg.type == 'success'){
					self.resetList(msg.res,msg.status);
				}else if(msg.type == 'fail'){
					self.error(null,msg.errorMsg);
				}
			}
			// $.ajax({
			// 	url : panApi.getFileList,
			// 	type : "get",
			// 	cache : false,
			// 	dataType : "json",
			// 	data : {id : id},
			// 	success : $.proxy(self.resetList, self),
			// 	error : $.proxy(self.error, self)
			// });
		},
		resetSelect : function() {
			var self = this;
			self.$el.find(".pan-checkbox.selected").trigger("click");
		},
		resetList : function(res, status) {
			var self = this;
			//var fileList = $('<ul class="pan-file-list"></ul>');		
			for(var i = 0,l = res.length;i < l;i++){
				var model = new panItem({
					/*el : "<li></li>",*/
					data : res[i]
				});
				//监听选择事件
				//self.listenSelect(model.$el);
				self.models.push(model);
				self.$el.append(model.$el);
			}
			//self.$el.append(fileList);
			/*self.$el.on("fileList:loaded", function() {
				console.log(arguments);
			});*/
			self.$el.trigger("fileList:loaded:success", self.$el);
		},
		error : function(xhr, errorMsg) {
			alert("下载失败，请稍候重试");
			if(errorMsg == "parsererror") {
				console.log("登录失效");
				localStorage.removeItem("token");
				sohuPan.port.postMessage({pan : "login"});
			}
			//self.$el.trigger("fileList:loaded:error", self.$el);
		}/*,
		//监听选择事件
		listenSelect : function($el) {
			var self = this;
			$el.on("file:selected", function() {
				console.log("选了");
				//self.$el.trigger("file:selected", Array.prototype.slice.call(arguments, 0));
			});
			$el.on("file:selectedCancel", function() {
				self.$el.trigger("file:selectedCancel", Array.prototype.slice.call(arguments, 0));
			});
		}*/
	});

	//已选择的项目
	var panSelectedItem = function(options) {
		this.data = options.data;
		this.direTemplate = $("#panDireSelectedItemTemplate").html();
		this.fileTemplate = $("#panFileSelectedItemTemplate").html();
		this.initialize();
	}

	$.extend(panSelectedItem.prototype, {
		initialize : function() {
			var self = this;
			self.structureIni();	
		},
		structureIni : function() {
			var self = this;
				data = self.data;
			//如果有parentDir，则说明为文件夹
			if(data.parentDir) {
				self.$el = $(self.direTemplate);
				self.$el.addClass("type-dire");			
			}
			//否则是普通文件
			else {
				var extName = self.getFileExt(data.name);
				self.$el = $(self.fileTemplate);
				if(extName) {
					self.$el.addClass("type-" + extName);
				}
			}
			self.$el.find(".pan-file-name").text(data.name);
		},
		//获得文件扩展名
		getFileExt : function(name) {
			var i = name.lastIndexOf(".");
			if(i == -1) {
				return false;
			}
			return name.substr(i + 1);
		}
	});

	//已选择列表
	var panSelectedList = function(options) {
		this.$el = $(options.el);
		this.initialize();
	}

	$.extend(panSelectedList.prototype, {
		initialize : function() {
			this.models = {};
		},
		addItem : function(data) {
			var self = this,
				newItem = new panSelectedItem({data : data});
			if(!self.searchItem(data.id)) {
				self.models[data.id] = newItem;
				self.$el.append(newItem.$el);
			}		
		},
		removeItem : function(data) {
			var self = this,
				id = data.id,
				item = self.searchItem(data.id);
			if(item) {
				delete self.models[id];
				item.$el.remove();
			}
		},
		searchItem : function(id) {
			var self = this;
			return self.models[id];
		},
		getSelectedArray : function() {
			var self = this,
				models = this.models,
				ids = [];
			for(var i in models) {
				ids.push(i);
			}
			self.ids = ids;
			return ids;
		}
	});

	//var pl = new panList({el : "<ul class='pan-file-list'></ul>"});
	//pl.getList();
	//var pl = new panList({el : ".pan-file-list"});

	var panBox = function(options) {
		this.$el = $(options.el);
		this.initialize();
	};

	$.extend(panBox.prototype, {
		$ : function(el) {
			return this.$el.find(el);
		},
		initialize : function() {
			var self = this;
			self.$fileListBox = self.$(".pan-file-list-box");
			self.$selectedListBox = self.$(".pan-selected-list-box");
			//向background发送port
			self.show();
			self.iniList();
			self.events();
		},
		iniList : function() {
			var self = this,
				fileList = self.fileList = new panList({el : "<ul class='pan-file-list'></ul>"}),
				selectedList = self.selectedList = new panSelectedList({el : ".pan-selected-list-box .pan-file-list"});

			//选择事件
			fileList.$el.on("file:selected", function(e, item) {
				selectedList.addItem(item.data);
			});
			//选择取消事件
			fileList.$el.on("file:selectedCancel", function(e, item) {
				selectedList.removeItem(item.data);
			});

			//下载事件监听
			fileList.$el.on("fileList:loaded:start", function() {
				self.$fileListBox.addClass("kan-list-loading");
			});
			fileList.$el.on("fileList:loaded:success", function(e, $fileList) {
				self.$fileListBox.html($fileList);
				self.$fileListBox.removeClass("kan-list-loading");
			});
			fileList.getList("root");
		},
		events : function() {
			var self = this;
			//点击关闭按钮
			/*self.$el.on("click", ".pan-close-btn", function() {
				self.hide();
			});*/

			//点击取消按钮
			self.$el.on("click", ".pan-cancel-btn", function() {
				self.hide();
			});

			//点击确定按钮
			self.$el.on("click", ".pan-ok-btn", function() {
				var ids = self.selectedList.getSelectedArray();
				if(ids.length === 0){
					alert('您还没有选择文件');
					return;
				}
				self.addIng();
				self.getOutlink();			
			});
		},
		addIng : function() {
			var self = this;
			self.$(".pan-loading").show();
		},
		addEnd : function() {
			var self = this;
			self.$(".pan-loading").hide();
		},
		getOutlink : function() {
			var self = this,
				models = self.selectedList.models,
				ids = self.selectedList.getSelectedArray();

			self.port.postMessage({
				pan:'link',
				ids:ids
			})

			self.port.onMessage.addListener(handle)

			function handle(msg){
				if(msg.type == 'success'){
					self.insertLinks(msg.res);
				}else if(msg.type == 'fail'){
					self.insertError();
				}
			}

			// $.ajax({
			// 	url : panApi.getOutlink,
			// 	type : "get",
			// 	dataType : "json",
			// 	data : {ids : ids.join(",")},
			// 	success : $.proxy(self.insertLinks, self),
			// 	error : $.proxy(self.insertError, self)
			// });
			//console.log(ids);
		},
		insertLinks : function(res) {
			var self = this;
			if(res.code == 200) {
				var fileShare = res.fileShare,
					ids = self.selectedList.ids,
					models = self.selectedList.models,
					content = [];
				for(var i =0,l = fileShare.length; i<l ; i++) {
					var file = fileShare[i],
						id = file.fileId,
						fildData = models[id].data,
						fileName = fildData.name,
						fileSize = self.getFileSize(fildData.size),
						fileContent = '<td style="font-size:14px;color:#4e4e4e;">' + fileName + '<span style="font-size:12px;color:#929292;">&nbsp;&nbsp;&nbsp;(' + fileSize + ')</span><br /><br /><a style="font-size:12px;color:#636363;text-decoration:none" href="' + file.shareUrl + '" target="_blank">下载</a></td>',
						fileContainer = '<tr id="'+ id +'"><td width="111"align="right"><img style="margin-left:45px"src="http://a2.itc.cn/sceapp/6/sohupan/img/edm/'+ self.getFileType(fileName) +'.png"alt=""></td><td width="20"></td>' + fileContent + '</tr><tr height="20"></tr>';
					content.push(fileContainer);
				}
				content = content.join("");
				self.fileList.resetSelect();
				self.port.postMessage({pan : "add", content : content});
				self.addEnd();
			}
		},
		getFileType : function(name){
			var i = name.lastIndexOf('.');
			if(i < 0){
				return 'file';
			}
			var type = name.substring(i+1),
				r = /[^a-zA-Z0-9]/g;
			if(r.test(type)){
				return 'file';
			}
			if(type.length > 4){
				return 'file';
			}

			type = type.toLowerCase();

			var img = ['bmp','jpg','gif','png','jpeg','tif','raw'],
				video = ['ogg','wma','wav','ape','acc','mid','ra','mp3','flac','cue'],
				audio = ['mpeg','mpg','dat','avi','rm','rmvb','mov','wmv','asf','mp4','flv','mfv','fla']
			type = img.indexOf(type) >= 0 ? 'img' : type;
			type = video.indexOf(type) >= 0 ? 'video' : type;
			type = audio.indexOf(type) >= 0 ? 'audio' : type;
			var fileType = {
				unknow:'file',
				xls:'excel',
				xlsx:'excel',
				doc:'word',
				docx:'word',
				ppt:'ppt',
				pptx:'ppt',
				txt:'txt',
				pdf:'pdf',
				swf:'flash',
				ps:'ps',
				ai:'ai',
				rar:'zip',
				zip:'zip',
				img:'picture',
				video:'video',
				audio:'audio'
			}

			console.log(type)
			return fileType[type] || 'file';
		},
		getFileSize : function(size) {
			var kb = size/1024;
			if(kb < 1) {
				return getSize(size) + "B";
			}
			else {
				var mb = kb/1024;
				if(mb < 1) {
					return getSize(kb) + "KB";
				}
				else {
					var gb = mb/1024;
					if(gb < 1) {
						return getSize(mb) + "MB";
					}
					else {
						return getSize(gb) + "GB";
					}
				}
			}

			function getSize(s) {
				return (parseInt(s*100))/100;
			}
		},
		insertError : function() {
			var self = this;
			alert("添加失败，请稍后重试");
			self.addEnd();
		},
		show : function() {
			var self = this;
			self.port = sogouExplorer.extension.connect({name : "pan"});
		},
		hide : function() {
			var self = this;
			self.port.postMessage({pan : "hide"});
		}
	});
	
	com_sohupan.panBox = panBox;
	//var sohuPan = new panBox({el : "#pan-file-container"});

})(jQuery,window);
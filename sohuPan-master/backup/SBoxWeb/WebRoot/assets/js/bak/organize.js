/**
 * @fileOverview 组织架构相关，包括部门管理、用户管理、企业通讯录etc.
 * @author angelscat@vip.qq.com
 */

/*Models*/
Sbox.Models.User = Backbone.Model.extend({

	setAdmin:function(){
		var _this = this;
		this.trigger('setadmin.begin');
		$.post('/OrganManage!setOrganAdmin.action',{
			userId:this.get('id')
		},function(r){
			_this.trigger('setadmin.end',r);
		},'json')
	},
	cancelAdmin:function(){
		var _this = this;
		this.trigger('canceladmin.begin');
		$.post('/OrganManage!cancelOrganAdmin.action',{
			userId:this.get('id')
		},function(r){
			_this.trigger('canceladmin.end',r);
		},'json')
	},
	resend:function(){
		var _this = this;
		this.trigger('resend.begin');
		$.post('/OrganManage!reSendEmail.action',{
			id:this.get('id')
		},function(r){
			_this.trigger('resend.end',r);
		},'json')
	},
	//TODO 编辑用户
	edit:function(){

	}
})

Sbox.Models.Stat = Backbone.Model.extend({
	defaults:{
		all:0,
		used:0
	}
})

window.organizeStatModel = new Sbox.Models.Stat();

Sbox.Models.Usage = Backbone.Model.extend({
	defaults:{
		all:0,
		used:0
	}
})

window.organizeUsageModel = new Sbox.Models.Usage();

Sbox.Models.Pager = Backbone.Model.extend({
	/** @lends Sbox.Models.Pager*/
	defaults:{
		curpage:1,
		total:1000,
		pagesize:20,
		middleCount:9
	},
	/**
	 * 获取总页码
	 */
	getPapeCount:function(){
		return Math.ceil(this.get('total') / this.get('pagesize'));
	}
})

Sbox.Models.Path = Backbone.Model.extend({
	/** @lends Sbox.Models.Path*/
	defaults:{
		path:'',
		organIds:'root'
	},
	getOrganId:function(){
		return this.get('organIds').split('/').reverse()[0];
	}
})

Sbox.Models.ToolBar = Backbone.Model.extend({
	/** @lends Sbox.Models.ToolBar*/
	defaults:{
		selectedUsers:[] //已选择用户
	},
	initialize:function(){
		this.reset();
	},
	setSelectedUsers:function(users){
		this.set({
			selectedUsers:users
		},{silent:true});

		this.reset();
		if(users.length === 0 ){ // 如果没有选择
			return;
		}else if(users.length === 1){ //如果是单个
			var user = users[0],
				isSelf = user.get('id') === userId,
				isRoot = pathModel.get('organIds') === 'root',
				edit = true,
				move = true,
				del = true,
				setadmin = user.get('isActive') && !user.get('isAdmin'),
				canceladmin = user.get('isAdmin'),
				resend = !user.get('isActive');
			if(isSelf){ //如果选中的是自己
				del = false;
				setadmin  = false;
				canceladmin = false;
				resend = false;
			}
			if(isRoot && !isDomainAdmin){ //如果是根目录，并且不是域管理员
				canceladmin=false; //不能进行管理员设置取消操作
				setadmin = false;
				if(user.get('isAdmin') && !isSelf){ //并且如果选中的也是部门管理员，其他操作也不能进行
					edit = false;
					move = false;
					del =false;
					resend = false;
				}
			}
			if(!isDomainAdmin && user.get('isDomainAdmin')){//TODO 如果如果不同管理员选中的是域管理员，那么不能进行操作
				edit = false;
				move = false;
				del = false;
				canceladmin = false;
				setadmin = false;
				resend = false;
			}
			if(!user.get('isActive')){
				edit = false;
				move = false;
			}
			this.set({
				edit:edit,
				move:move,
				del:del,
				setadmin:setadmin,
				canceladmin:canceladmin,
				resend:resend
			})
		}else{ //如果是多个
			var move = true;
			for(var i = 0, len = users.length; i < len ; i++){
				if(!users[i].get('isActive')){
					move = false;
					break;
				}
			}
			this.set({
				move:move
			})
		}

		this.trigger('change');
	},
	reset:function(){
		this.set({
			edit:false,
			move:false,
			del:false,
			setadmin:false,
			canceladmin:false,
			resend:false
		},{silent:true})
	}
})

Sbox.Models.Menu = Backbone.Model.extend({
	defaults:{
		add:true,
		edit:true,
		del:true
	}
})

Sbox.Collections.UserList = Backbone.Collection.extend({
	model:Sbox.Models.User,
	initialize:function(m,options){
		if(rootDepartmentInfo.power !== -1){
			this.url = '/User!getUsersByOrgan.action'	
		}else{
			this.url = '/User!getUsersByOrganLimit.action'
		}
		
	},
	fetch:function(data){
		var _this = this;
		data.organId = data.organId === 'root' ? rootDepartmentInfo.id : data.organId;
		$.get(this.url,data,function(r){
			if((pathModel.getOrganId() === 'root' ? rootDepartmentInfo.id : pathModel.getOrganId()) === data.organId){ //如果返回过来的结果已经不是当前选中部门下的，那就不做更新了。
				OrganizePageView.resetTotal(r.allCount);
				_this.reset(r.result);
			}
		},'json')
	},
	/**
	 * 获取选中的文件列表
	 * @return {Array} users用户列表
	 */
	getChecked:function(){
		var users = [];
		this.each(function(user){
			if(user.get('checked')) users.push(user)
		})
		return users;
	},
	/**
	 * 选中所有用户
	 */
	checkAll:function(){
		this.each(function(user){
			if(user.isNew()) return;
			user.set({checked:true});
		})
	},
	/**
	 * 不选所有用户
	 */
	uncheckAll:function(){
		this.each(function(user){
			if(user.isNew()) return;
			user.set({checked:false});
		})
	},
	/**
	 * 通过id选中某个用户
	 * @params {String} id 文件id
	 */
	checkById:function(id){
		this.get(id).set({checked:true});
	},
	/**
	 * 通过id不选中某个用户
	 * @params {String} id 文件id
	 */
	uncheckById:function(id){
		this.get(id).set({checked:false});
	},
	/**
	 * 通过id反选某个用户
	 * @params {String} id 文件id
	 */
	toggelCheckById:function(id){
		var checked = this.get(id).get('checked');
		checked ? this.uncheckById(id) : this.checkById(id);
	},
	/**
	 * 返回某id的用户的序号
	 * @params {String} id 文件id
	 * @return {Number} i 序号
	 */
	getIndexOfById:function(id){
		var user = this.get(id);
		return this.indexOf(user);
	},
	getDomainAdmin:function(){
		var domainAdmin = null;
		this.each(function(user){
			if(user.get('isDomainAdmin')) domainAdmin = user;
		})
		return domainAdmin;
	},
	getUserById:function(id){
		var user = this.get(id);
		return user;
	},
	getUserByEmail:function(email){
		var user = null;
		this.each(function(u){
			if(u.get('email') === email) user = u;
		})
		return user;
	},
	//TODO 添加用户 
	addUser:function(){

	}
})

Sbox.Controllers.Router = Backbone.Router.extend({
	routes:{
	},
	initialize:function(){
		rootDepartmentInfo.name = rootDepartmentInfo.name === '' ? '公司' : rootDepartmentInfo.name;

		var userList = new Sbox.Collections.UserList();
		window.userListCollection = userList;

		var path = new Sbox.Models.Path({
			path:rootDepartmentInfo.name,
			organIds:'root'
		});
		window.pathModel = path;

		// var stat = new Sbox.Views.OrganizeStat({
		// 	userList:userList,
		// 	path:path
		// });
		// $('#organizeView').append(stat.render().el);

		// var tree = window.OrganizeTreeView = new Sbox.Views.OrganizeTree({
		// 	userList:userList,
		// 	path:path
		// });
		var side = new Sbox.Views.OrganizeSidebar({
			userList:userList,
			path:path
		});
		$('#organizeView').append(side.el);
		var main = new Sbox.Views.OrganizeMain({
			userList:userList,
			path:path
		});
		$('#organizeView').append(main.el);


		organizeStatModel.set({ //总用户使用统计
    		all:rootDepartmentInfo.allUsers,
    		used:rootDepartmentInfo.usedUsers
    	})

    	organizeUsageModel.set({ //总空间使用统计
    		all:rootDepartmentInfo.allSpace,
    		used:rootDepartmentInfo.usedSpace
    	})

		path.trigger('change');
	    var organizeView = $('#organizeView'),
	    	organizeTree = organizeView.find('.organize-tree');
	    function resize(){
	        var winHeight = $(window).height(),
	            hdHeight = $('#header').height();
	        organizeView.attr('style','min-height:'+ (winHeight - hdHeight) +'px;*height:'+ (winHeight - hdHeight) +'px;')
	        // organizeTree.attr('style','min-height:'+ (organizeView.height() - 50) +'px;*height:'+ (organizeView.height() - 50) +'px;')
	    }
	    resize();
	    $(window).on('resize',resize);
	}
})

//名额统计
Sbox.Views.OrganizeStat = Backbone.View.extend({
	className:'organize-stat',
	template:_.template($('#statTemplate').html()),
	initialize:function(){
		this.userList = this.options.userList;
		this.path = this.options.path;
		this.model = window.organizeStatModel;
		_.bindAll(this,'render');
		this.model.bind('change',this.render);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
})

//路径
Sbox.Views.OrganizePath = Backbone.View.extend({
	className:'organize-nav',
	template:_.template($('#pathTemplate').html()),
	events:{
		'click a'	:'gopath'
	},
	initialize:function(){
		this.userList = this.options.userList;
		this.model = this.options.path;
		_.bindAll(this,'render');
		this.model.bind('change',this.render);
		this.model.bind('fresh',this.render);
	},
	render:function(){
		var path = this.model.get('path');
		path = path.split('/');
		organIds = this.model.get('organIds').split('/');
		this.path = path;
		this.organIds = organIds;
		this.$el.html(this.template({paths:path}));
		return this;
	},
	gopath:function(e){
		var index = parseInt($(e.currentTarget).attr('data-index'));
		e.preventDefault();
		this.path = this.path.slice(0,index + 1);
		this.organIds = this.organIds.slice(0,index + 1);
		this.model.set({
			path:this.path.join('/'),
			organIds:this.organIds.join('/')
		})
	}
})

//空间统计
Sbox.Views.OrganizeUsage = Backbone.View.extend({
	className:'organize-usage',
	template:_.template($('#usageTemplate').html()),
	initialize:function(){
		this.userList = this.options.userList;
		this.path = this.options.path;
		this.model = window.organizeUsageModel;
		_.bindAll(this,'render');
		this.model.bind('change',this.render)
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
})

//添加用户
Sbox.Views.OrganizeAddUser = Backbone.View.extend({
	className:'organize-adduser',
	template:_.template($('#addUserTemplate').html()),
	events:{
		'click .adduser'		:'adduser',
		'click .importuser'	:'importuser'
	},
	initialize:function(){
		this.userList = this.options.userList;
		this.path = this.options.path;
		_.bindAll(this,'render','updateBtn');
		organizeStatModel.bind('change',this.updateBtn)
	},
	render:function(){
		this.$el.html(this.template());
		this.$el.find('.importuser').remove(); //TODO 导入用户暂时隐藏
		return this;
	},
	updateBtn:function(){
		if(organizeStatModel.get('used') === organizeStatModel.get('all')){ //如果没有名额了
			this.$el.find('.adduser')
			.attr('title','用户名额不足')
			.addClass('btn32-disabled');
		}else{
			this.$el.find('.adduser').attr('title','').removeClass('btn32-disabled');
		}
	},
	adduser:function(){
		if(this.$el.find('.adduser').hasClass('btn32-disabled')) return; //如果不能添加
		Sbox.CreateUser(this.userList,this.path);
	},
	importuser:function(){ //TODO 导入用户
		alert('导入用户');
	}
})

//工具栏
Sbox.Views.OrganizeToolBar = Backbone.View.extend({
	className:'organize-toolbar',
	template:_.template($('#toolbarTemplate').html()),
	events:{
		'click .edit'		:'edit',
		'click .move'		:'move',
		'click .del'		:'del',
		'click .setadmin'	:'setadmin',
		'click .canceladmin':'canceladmin',
		'click .resend'		:'resend'
	},
	initialize:function(){
		this.userList = this.options.userList;
		this.path = this.options.path;
		this.model = new Sbox.Models.ToolBar();
		_.bindAll(this,'render','select');

		this.model.bind('change',this.render);
		this.userList.bind('change',this.select);
		this.userList.bind('reset',this.select);
		this.userList.bind('remove',this.select);
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	select:function(){
		var users = this.userList.getChecked();
		if(users.length === 0 || isCloudVersion) this.$el.hide();
		else this.$el.show();
		this.model.setSelectedUsers(users);
	},
	edit:function(){
		var user = this.userList.getChecked()[0];
		Sbox.EditUser(user,this.userList,this.path);
	},
	move:function(){
		var users = this.userList.getChecked();
		Sbox.MoveUser(users,this.userList,this.path);
	},
	del:function(){
		var user = this.userList.getChecked()[0];
		Sbox.DeleteUser(user,this.userList);
	},
	setadmin:function(){
		var user = this.userList.getChecked()[0];
		Sbox.SetAdmin(user);
	},
	canceladmin:function(){
		var user = this.userList.getChecked()[0];
		Sbox.CancelAdmin(user);
	},
	resend:function(){
		var user = this.userList.getChecked()[0];
		Sbox.Resend(user);
	}
})

//名额统计
Sbox.Views.OrganizeListHead = Backbone.View.extend({
	className:'ulist-head',
	template:_.template($('#ulistHeadTemplate').html()),
	events:{
		'click .checkbox'	:'checkAll'
	},
	initialize:function(){
		this.userList = this.options.userList;
		this.path = this.options.path;
		_.bindAll(this,'render','toggleChecked');
		this.userList.bind('change',this.toggleChecked);
		this.userList.bind('reset',this.toggleChecked);
	},
	render:function(){
		this.$el.html(this.template());
		return this;
	},
	toggleChecked:function(){
		var users = this.userList.getChecked();
		if(this.userList.length === 0 || users.length !== this.userList.length){
			this.$el.find('.checkbox').removeClass('icon-checked').addClass('icon-unchecked');
		}else{
			this.$el.find('.checkbox').removeClass('icon-unchecked').addClass('icon-checked');
		}
	},
	checkAll:function(e){
		var target = $(e.currentTarget),
			checked = target.hasClass('icon-unchecked');
		checked ? this.userList.checkAll() : this.userList.uncheckAll();
	}
})

//用户列表
Sbox.Views.OrganizeUserList = Backbone.View.extend({
	className:'ulist-body',
	template:_.template('<ul class="ulist"></ul>'),
	events:{
		'mouseenter li.uitem'	:'hover',
		'mouseleave li.uitem'	:'leave',
		'click li.uitem'		:'check'
	},
	initialize:function(){
		var _this = this;
		this.currentElement = null;
		this.userList = this.options.userList;
		this.path = this.options.path;
		this.organIds = this.path.get('organIds');
		_.bindAll(this,'render','addOne','addAll','refresh','remove','resetPager','loading');

		this.$el.on('selectstart',function(){
			return false;
		})

		this.userList.bind('add',this.addOne);
		this.userList.bind('reset',this.addAll);
		this.userList.bind('reset',this.resetPager);
		this.userList.bind('remove',this.remove);
		this.userList.bind('loading',this.loading);
		this.userList.bind('refresh',this.refresh);
		this.path.bind('change',this.refresh)
	},
	render:function(){
		var _this = this;
		this.$el.html(this.template());
		//var ulist = this.$('.ulist');
		return this;
	},
	loading:function(){
		this.$('.ulist').html('<li class="empty-list"><span class="icon icon-loading"></span> 正在加载...</li>')
	},
	addOne:function(user){
		var _this = this;
		var pageModel = OrganizePageView.model;
		if(pageModel.get('total') > pageModel.get('pagesize')){
			OrganizePageView.resetTotal(pageModel.get('total') + 1);
		}
		organizeUsageModel.set({ //更新当前空间使用
			used:organizeUsageModel.get('used') + user.get('settingSize')
		})
		organizeStatModel.set({ //更新用户数
			used:organizeStatModel.get('used') + 1
		})
		var userItem = new Sbox.Views.OrganizeUser({
			model:user,
			userList:_this.userList,
			path:_this.path
		});
		this.$('.ulist').find('.empty-list').remove();
		this.$('.ulist').prepend(userItem.render().el);
		userItem.$el.addClass('new');
		setTimeout(function(){
			userItem.$el.removeClass('new');
		},3000)
	},
	addAll:function(){
		var _this = this;
		this.currentElement = null;
		if(this.userList.length > 0){
			this.$('.ulist').empty();
			//console.log(this.userList);
			this.userList.each(function(user){
				var userItem = new Sbox.Views.OrganizeUser({
					model:user,
					userList:_this.userList,
					path:_this.path
				});
				_this.$('.ulist').append(userItem.render().el);
			})
		}else{ //空列表
			this.$('.ulist').empty();
			this.$('.ulist').html('<li class="empty-list">该部门下还没有用户</li>')
		}
	},
	remove:function(user){
		this.$el.find('#user-' + user.get('id')).remove();

		//重设分页的总数
		var pageModel = OrganizePageView.model;
		OrganizePageView.resetTotal(pageModel.get('total') - 1);

		//如果整个userlist都没有用户了，那么更新该list
		if(this.userList.length === 0){
			if(pageModel.get('total') < pageModel.get('pagesize')){//先判断是否还有更多数据，如果本身只有一页全部是删完了，那就什么都不做了；
				this.$('.ulist').empty();
				this.$('.ulist').html('<li class="empty-list">该部门下还没有用户</li>')
			}else{
				this.userList.trigger('refresh');
			}
			
		}
	},
	refresh:function(){
		var _this = this;
		var userList = this.userList;
		this.$('.ulist').html('<li class="empty-list"><span class="icon icon-loading"></span> 正在加载...</li>');
		OrganizePageView.resetTotal(0);
		userList.fetch({
			organId:_this.path.get('organIds').split('/').reverse()[0],
			start:0,
			length:10,
			_t:Math.random()
		})
	},
	resetPager:function(){
		if(this.organIds !== this.path.get('organIds')){
			OrganizePageView.resetCurpage(1);
			this.organIds = this.path.get('organIds');
		}
	},
	hover:function(e){
		var target = $(e.currentTarget);
		target.addClass('hover');
	},
	leave:function(e){
		var target = $(e.currentTarget);
		target.removeClass('hover');
	},
	check:function(e){
		var target = $(e.currentTarget),
			id = target.attr('data-id'),
			c = this.userList,
			m = c.get(id),
			items = this.$el.find('.uitem');

		if(!m) return;
		if(rootDepartmentInfo.power === -1) return;
		var srcTarget = e.target || e.srcTarget;

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
                var start = c.getIndexOfById(this.currentElement.attr('data-id')),
                    end = c.getIndexOfById(target.attr('data-id'));
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
	}
})

//用户
Sbox.Views.OrganizeUser = Backbone.View.extend({
	tagName:'li',
	className:'uitem',
	template:_.template($('#uItemTemplate').html()),
	events:{
		'click .checkbox'		:'check'
	},
	initialize:function(){
		this.userList = this.options.userList;
		this.path = this.options.path;
		_.bindAll(this,'render','check','setAdminBegin','setAdminEnd','cancelAdminBegin','cancelAdminEnd','resendBegin','resendEnd','editBegin','editEnd');
		this.model.bind('change',this.render);
		this.model.bind('setadmin.begin',this.setAdminBegin);
		this.model.bind('setadmin.end',this.setAdminEnd);
		this.model.bind('canceladmin.begin',this.cancelAdminBegin);
		this.model.bind('canceladmin.end',this.cancelAdminEnd);
		this.model.bind('resend.begin',this.resendBegin);
		this.model.bind('resend.end',this.resendEnd);
		this.model.bind('edit.begin',this.editBegin);
		this.model.bind('edit.end',this.editEnd);
	},
	render:function(){
		//console.log(this.model)
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.attr('data-id',this.model.id);
		this.$el.attr('id','user-' + this.model.id);
		this.model.get('checked') ? this.$el.addClass('selected'):this.$el.removeClass('selected');
		return this;
	},
	check:function(e){
		var target = $(e.currentTarget);
		if(target.hasClass('icon-unchecked')){
			// this.userList.uncheckAll();
			this.model.set({checked:true});
		}else{
			this.model.set({checked:false});
		}
		e.stopImmediatePropagation();
	},

	setAdminBegin:function(){
		this.loading = Sbox.Loading('正在设置请稍候...');
	},
	setAdminEnd:function(r){
		this.loading.remove();
		if(r.code === 200){
			Sbox.Success('已设置为部门管理员');
			this.model.set({
				isAdmin:true
			});
		}else{
			Sbox.Fail('设置失败，请重试');
		}
	},
	cancelAdminBegin:function(){
		this.loading = Sbox.Loading('正在取消请稍候...');
	},
	cancelAdminEnd:function(r){
		this.loading.remove();
		if(r.code === 200){
			Sbox.Success('已取消部门管理员');
			this.model.set({
				isAdmin:false
			});
		}else{
			Sbox.Fail('取消失败，请重试');
		}
	},
	editBegin:function(){

	},
	editEnd:function(){

	},
	resendBegin:function(){
		this.loading = Sbox.Loading('正在重发请稍候...');
	},
	resendEnd:function(r){
		this.loading.remove();
		if(r.code === 200){
			Sbox.Success('邮件已重发，请查收');
		}else{
			Sbox.Fail('发送失败，请重试');
		}
	}
})

//分页
Sbox.Views.OrganizePage = Sbox.Views.Pager.extend({

})

//侧边栏
Sbox.Views.OrganizeSidebar = Backbone.View.extend({
	className:'organize-side',
	initialize:function(){
		var userList = this.userList = this.options.userList;
		var path = this.path = this.options.path;
		this.render();
	},
	render:function(){
		var deptAct = new Sbox.Views.DepartmentActions({
			userList:this.userList,
			path:this.path
		});
		var tree = window.OrganizeTreeView = new Sbox.Views.OrganizeTree({
			userList:this.userList,
			path:this.path
		});
		this.$el.append(deptAct.render().el)
				.append(tree.el);
	}
})

//主体结构
Sbox.Views.OrganizeMain = Backbone.View.extend({
	className:'organize-main',
	initialize:function(){
		this.userList = this.options.userList;
		this.path = this.options.path;
		this.render();
	},
	render:function(){
		var path = new Sbox.Views.OrganizePath({
			userList:this.userList,
			path:this.path
		});
		// var usage = new Sbox.Views.OrganizeUsage({
		// 	userList:this.userList,
		// 	path:this.path
		// });
		var op = new Sbox.Views.OrganizeAddUser({
			userList:this.userList,
			path:this.path
		});
		var stat = new Sbox.Views.OrganizeStat({
			userList:this.userList,
			path:this.path
		});
		var manage = new Sbox.Views.OrganizeUserManage({
			userList:this.userList,
			path:this.path
		});
		this.$el.append(path.render().el)
				.append(stat.render().el)
				.append(op.render().el)
				//.append(usage.render().el)
				.append(manage.render().el);

		return this;
	}
})

//用户管理
Sbox.Views.OrganizeUserManage = Backbone.View.extend({
	className:'organize-users',
	initialize:function(){
		this.userList = this.options.userList;
		this.path = this.options.path;
	},
	render:function(){
		var _this = this;
		var toolbar = new Sbox.Views.OrganizeToolBar({
			userList:this.userList,
			path:this.path
		});
		var uhead = new Sbox.Views.OrganizeListHead({
			userList:this.userList,
			path:this.path
		});
		var ulist = new Sbox.Views.OrganizeUserList({
			userList:this.userList,
			path:this.path
		});
		var upage = new Sbox.Views.OrganizePage({
			userList:this.userList,
			path:this.path,
			total:10,
			pagesize:10,
			callback:function(pager){
				_this.userList.trigger('loading');
				_this.userList.fetch({
					organId:_this.path.get('organIds').split('/').reverse()[0],
					start:(pager.get('curpage') - 1) * pager.get('pagesize'),
					length:pager.get('pagesize'),
					_t:Math.random()
				});
			}
		});
		window.OrganizePageView = upage;
		this.$el.append(toolbar.render().el)
				.append(uhead.render().el)
				.append(ulist.render().el)
				.append(upage.render().el);

		return this;
	}
})

Sbox.Views.DepartmentActions = Backbone.View.extend({
	className: 'department-actions',
	template:_.template($('#departmentActionsTemplate').html()),
	events:{
		'click .add-department'		:'addDepartment',
		'click .edit-department'	:'editDepartment',
		'click .del-department'		:'delDepartment'
	},
	initialize:function(){
		// this.model = window.organizeMenuModel = new Sbox.Models.Menu();
		_.bindAll(this,'render');
		// this.model.bind('change',this.render);
		this.path = this.options.path;
		this.path.bind('change',this.render);
	},
	render:function(){
		this.$el.html(this.template({
			isRoot: this.path.getOrganId()
		}));
		return this;
	},
	addDepartment:function(){
		Sbox.CreateDepartment(this.path);
	},
	editDepartment:function(e){
		var target = $(e.currentTarget);
		if(target.hasClass('btn-disabled')) return;
		Sbox.EditDepartment(this.path)
	},
	delDepartment:function(e){
		var target = $(e.currentTarget);
		if(target.hasClass('btn-disabled')) return;
		Sbox.DeleteDepartment(this.path.getOrganId())
	}
})

//树结构
Sbox.Views.OrganizeTree = Backbone.View.extend({
	className:'organize-tree',
	initialize:function(){
		var _this = this;
		this.$el.append('<div class="folds cur" allSpace="'+ rootDepartmentInfo.allSpace +'" usedSpace="'+ rootDepartmentInfo.usedSpace +'"><i class="fold open"></i><a href="javascript:;" title="'+ rootDepartmentInfo.name +'">'+ rootDepartmentInfo.name +'</a></div>')
		var treeContainer = $('<ul id="organizeTree" class="ztree"></ul>').appendTo(this.$el);
		treeContainer.append('<li style="padding:20px;text-align:center;" class="tree-loading"><span class="icon icon-loading"></span></li>');
		var url;
		if(rootDepartmentInfo.power !== -1){
			url = '/OrganManage!getOrgans.action?_t=' + Math.random();
		}else{
			url = '/OrganManage!getAllOrgans.action?_t=' + Math.random();
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
                }
            },
            async:{//异步加载所需参数
                autoParam : ['id'],//需要提交的参数如id=1&name=test，可以修改参数别名如['id=tid']将提交tid=1
                //contentType : "application/x-www-form-urlencoded",//默认的'application/x-www-form-urlencoded'可以满足大部分需要，'application/json'可以进行json数据的提交
                dataFilter : function(treeId,parentNode,childNodes){
                	var _childNodes = []
                	_childNodes = childNodes.result;
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
                    _this.$el.find('.folds').removeClass('cur');
                    //updateWidth();
                },
                onAsyncSuccess:function(e,treeId,treeNode,msg){ //总是在展开成功后,将treeNode交给checkNode处理
				
                    // if(!_this.loaded){ //第一次加载成功之后
                    //     _this.loaded = true;
                    // }else{
                    //     _this.expandNode();
                    // }
                    // treeNode && (treeNode.loaded = true); //已经加载过的标记为已加载

                    //updateWidth();

                    treeContainer.find('li.tree-loading').remove();
                },
                onExpand:function(){
                	//updateWidth();
                }
            }
        };

        this.tree =  $.fn.zTree.init(treeContainer, setting);
        this.path = this.options.path;
        _.bindAll(this,'render');
        this.path.bind('change',this.render);
        this.path.bind('reload.usage',this.render);

        this.$el.find('.folds').on('click','.fold',function(){
        	var el = $(this);
        	if(el.hasClass('open')){
        		el.removeClass('open').addClass('close');
        		treeContainer.slideUp('fast');
        	}else{
        		el.removeClass('close').addClass('open');
        		treeContainer.slideDown('fast');
        	}
        }).on('click','a',function(){
        	_this.path.set({
        		path:rootDepartmentInfo.name,
        		organIds:'root'
        	})
        })

		// var menu = new Sbox.Views.OrganizeMenu();
		// $('body').append(menu.render().el);
		// var st;
        // this.$el.on('mouseover','li,.folds',function(e){
        // 	var target = $(e.currentTarget),
        // 		relatedTarget = $(e.relatedTarget),
        // 		pos = target.offset();

        // 	target.addClass('hover');
        // 	if(relatedTarget.hasClass('arrow')){ //如果是从小三角上移动过去的，那就什么都不做，就不会重绘。
        		
        // 	}else if(target.hasClass('folds')){
	       //  	organizeMenuModel.set({
	       //  		add:true,
	       //  		edit:false,
	       //  		del:false
	       //  	})
	       //  	organizeMenuModel.set({
	       //  		organId:'root'
	       //  	},{silent:true})
        // 	}else{
	       //  	organizeMenuModel.set({
	       //  		add:true,
	       //  		edit:true,
	       //  		del:true
	       //  	})

	       //  	var organId = _this.tree.getNodeByTId(target.attr('id')).id;
	       //  	organizeMenuModel.set({
	       //  		organId:organId
	       //  	},{silent:true})
        // 	}

        // 	clearTimeout(st);
        // 	menu.$el.css({
        // 		left:pos.left + 155,
        // 		top:pos.top + 6
        // 	}).show();

        // 	e.stopImmediatePropagation();
        // }).on('mouseout','li,.folds',function(e){
        // 	var target = $(e.currentTarget);
        // 	target.removeClass('hover');
        // 	st = setTimeout(function(){
        // 		menu.$el.hide();
	       //  	menu.$el.find('ul').hide();
        // 	},100)

        // 	e.stopImmediatePropagation();
        // })

    	// menu.$el.on('mouseenter',function(e){
    	// 	var relatedTarget = $(e.relatedTarget);
    	// 	// console.log(relatedTarget)
    	// 	if(relatedTarget.hasClass('treenode_bg')){
    	// 		relatedTarget.parent().addClass('hover');
    	// 	}else if(relatedTarget.hasClass('folds')){
    	// 		relatedTarget.addClass('hover');
    	// 	}
    	// 	clearTimeout(st);
    	// }).on('mouseleave',function(){
    	// 	_this.$el.find('.hover').removeClass('hover');
    	// 	st = setTimeout(function(){
     //    		menu.$el.hide();
     //    		menu.$el.find('ul').hide();
     //    	},100)
    	// })

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
		var id = this.path.get('organIds').split('/').reverse()[0];
		if(id !== 'root'){
			var	selectedNode = this.tree.getSelectedNodes()[0],
				treeNode = this.tree.getNodesByParam('id',id,null)[0];
			organizeUsageModel.set({
				all:treeNode.all_space,
				used:treeNode.all_space - treeNode.space
			})
			if(selectedNode && selectedNode.id === id) return;
			this.tree.selectNode(treeNode,false);
		}else{
			organizeUsageModel.set({
				all:this.$el.find('.folds').attr('allSpace') * 1,
				used:this.$el.find('.folds').attr('usedSpace') * 1
			})

        	this.tree.cancelSelectedNode(this.tree.getSelectedNodes()[0]); 
        	this.$el.find('.folds').addClass('cur');
		}
	},
	setPath:function(treeNode){
		var path = [],
			organIds = [];
		while(treeNode){
			path.push(treeNode.name);
			organIds.push(treeNode.id);
			treeNode = treeNode.getParentNode();
		}
		path = path.length === 0 ? rootDepartmentInfo.name : rootDepartmentInfo.name + '/' + path.reverse().join('/');
		organIds = organIds.length === 0 ? 'root' : 'root' + '/' + organIds.reverse().join('/');
		this.path.set({
			path:path,
			organIds:organIds
		});//,{silent:true}
		// this.path.trigger('path.load');
		// console.log(this.path);
		//console.log(path)
		return path;
	}
})

Sbox.Views.OrganizeMenu = Backbone.View.extend({
	className:'organize-menu',
	template:_.template($('#menuTemplate').html()),
	events:{
		'click .arrow'				:'showMenu',
		'click .add-department'		:'addDepartment',
		'click .edit-department'	:'editDepartment',
		'click .del-department'		:'delDepartment'
	},
	initialize:function(){
		this.model = window.organizeMenuModel = new Sbox.Models.Menu();
		_.bindAll(this,'render');
		this.model.bind('change',this.render)
	},
	render:function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	showMenu:function(){
		var menu = this.$el.find('ul');
		if(menu.is(':visible')){
			menu.hide();
		}else{
			menu.show();
		}

		this.$el.find('ul').on('mouseleave',function(){
			$(this).hide();
		});

	},
	addDepartment:function(){
		Sbox.CreateDepartment(this.model.get('organId'));
	},
	editDepartment:function(){
		Sbox.EditDepartment(this.model.get('organId'))
	},
	delDepartment:function(){
		Sbox.DeleteDepartment(this.model.get('organId'))
	}
})

$(document).ready(function(){
	new Sbox.Controllers.Router();
	// Backbone.history.start();
});

(function($){
	//新建部门
	Sbox.CreateDepartment = function(pathModel){
		var parentIds = pathModel.get('organIds').split('/'),
			parentNames = pathModel.get('path').split('/'),
			parentDepartmentId = parentIds.pop(),
			parentDepartmentPath = parentNames.join(' > ');

		var parentNode = null,
			treeRoot = OrganizeTreeView.$el.find('.folds');
		if(parentDepartmentId !== 'root'){
			parentNode = OrganizeTreeView.tree.getNodesByParam('id',parentDepartmentId,null)[0];
		}

			

		var dialog = new Sbox.Views.Window({
			title:'新建子部门',
			body:'<div class="organize-dialog create-department-dialog"> \
	        		<div class="field name"> \
	        			<div class="label">部门名称：</div> \
	        			<div class="ipt"> \
	        				<input type="text" class="ipt-text" name="name" id="departmentName" /> \
	        			</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
	        		<div class="field change-department"> \
	        			<div class="label">上级部门：</div> \
	        			<div class="ipt"> \
	        				<span id="parentDepartment">'+ parentDepartmentPath +'</span> <a id="changeDepartment" href="javascript:;">修改</a> \
	        				<input type="hidden" name="parentId" id="parentDepartmentId" value="'+ parentDepartmentId +'" /> \
	        			</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
				</div>',
			width:500,
			closeButton:true,
			onClose:function(){
				dialog.remove();
			}
		});

		var bd = dialog.body,
			$departmentName = bd.find('#departmentName'),
			$parentDepartment = bd.find("#parentDepartment"),
			$parentDepartmentId = bd.find('#parentDepartmentId'),
			$changeDepartment = bd.find('#changeDepartment'),
			flag = true;

		dialog.addButton({
			text:'确定',
			className:'confirm',
			onclick:function(){
				flag = true;
				$departmentName.trigger('blur');
				var name = $.trim($departmentName.val()),
					parent = $parentDepartmentId.val() === 'root' ? rootDepartmentInfo.id : $parentDepartmentId.val();
				if(flag){
					Sbox.Loading('正在创建...');
					dialog.hide();
					$.post('/OrganManage!createOrgan.action',{
						name:name,
						parent:parent
					},function(r){
						Sbox.Loading().remove();
						if(r.code === 200){
							Sbox.Success('创建成功');
							if(parentNode){
								parentNode.isParent = true;
								// parentNode.space = parentNode.space - space;
								// if(OrganizeTreeView.tree.getSelectedNodes()[0].id === parentNode.id){
								// 	organizeUsageModel.set({
								// 		used:organizeUsageModel.get('used') + space
								// 	})
								// }
								if(parentNode.zAsync){
									var newNode = r.result;
									OrganizeTreeView.tree.addNodes(parentNode,newNode,false);
								}else{
									OrganizeTreeView.tree.reAsyncChildNodes(parentNode,'refresh',false);
								}
							}else{
								// treeRoot.attr('usedSpace',usedSpace * 1 + space);
								// if(OrganizeTreeView.$el.find('.folds').hasClass('cur')){
								// }
								var newNode = r.result;
								OrganizeTreeView.tree.addNodes(parentNode,newNode,false);
							}

							// if(
							// 	(OrganizeTreeView.$el.find('.folds').hasClass('cur') && 
							// 		parentNode === null)||
							// 	(OrganizeTreeView.tree.getSelectedNodes()[0] && 
							// 		parentNode && 
							// 		OrganizeTreeView.tree.getSelectedNodes()[0].id === parentNode.id)
							// 	){
							// 	organizeUsageModel.set({
							// 		used:organizeUsageModel.get('used') + space
							// 	})
							// }
							// pathModel.trigger('reload.usage');
						}else if(r.code === 303){
							dialog.show();
							$departmentName.parent().next().html('<span class="error">该部门已存在</span>')
						}else if(r.code === 504){
							dialog.show();
							$departmentName.parent().next().html('<span class="error">名字不合法</span>')
						}else{
							//TODO 各种失败提示
							dialog.remove();
							Sbox.Fail('创建失败');
						}
					},'json');
				}
			}
		}).addButton({
			text:'取消',
			className:'cancle',
			onclick:function(){
				dialog.remove();
			}
		});

		$departmentName.on('blur',function(){
			var val = $.trim($(this).val());
			if(val === ''){
				$(this).parent().next().html('<span class="error">请填写部门名称</span>');
				flag = false;
			}else if(val.length > 20){
				$(this).parent().next().html('<span class="error">不能超过20个字符</span>');
				flag = false;
			}else{
				$(this).parent().next().empty();
			}
		}).on('focus',function(){
			$(this).parent().next().empty();
		})

		$changeDepartment.on('click',function(){
			dialog.hide();
			Sbox.ChangeDepartment({
				callback:function(parentDepartment){
					dialog.show();
					if(parentDepartment === null) return;
					$parentDepartment.html(parentDepartment.path);
					$parentDepartmentId.val(parentDepartment.id);
					
					//更新parentNode
					if(parentDepartment.id === 'root'){
						parentNode = null;
					}else{
						parentNode = OrganizeTreeView.tree.getNodesByParam('id',parentDepartment.id,null)[0];
					}
				}
			})
		})
		return dialog;
	}
	//编辑部门
	Sbox.EditDepartment = function(pathModel){
		var parentIds = pathModel.get('organIds').split('/'),
			parentNames = pathModel.get('path').split('/'),
			departmentId = parentIds.pop(),
			parentDepartmentId = parentIds.pop(),
			name = parentNames.pop(),
			parentDepartmentPath = parentNames.join(' > ');

		var currentNode = OrganizeTreeView.tree.getNodesByParam('id',departmentId,null)[0],
			parentNode = currentNode.getParentNode(),
			treeRoot = OrganizeTreeView.$el.find('.folds');

		var dialog = new Sbox.Views.Window({
			title:'编辑部门',
			body:'<div class="organize-dialog edit-department-dialog"> \
	        		<div class="field name"> \
	        			<div class="label">部门名称：</div> \
	        			<div class="ipt"> \
	        				<input type="text" class="ipt-text" name="name" value="'+ name +'" id="departmentName" /> \
	        			</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
	        		<div class="field change-department"> \
	        			<div class="label">上级部门：</div> \
	        			<div class="ipt"> \
	        				<span id="parentDepartment">'+ parentDepartmentPath +'</span> <a id="changeDepartment" href="javascript:;">修改</a> \
	        				<input type="hidden" name="parentId" id="parentDepartmentId" value="'+ parentDepartmentId +'" /> \
	        			</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
	        		<div class="field" style="padding:0; margin-top:-10px; display: none;" id="parentTips" > \
	        			<div class="label"></div> \
	        			<div class="tips" style="margin:0;"> \
	        			</div> \
	        		</div> \
				</div>',
			width:500,
			closeButton:true,
			onClose:function(){
				dialog.remove();
			}
		});
		var bd = dialog.body,
			$departmentName = bd.find('#departmentName'),
			$parentDepartment = bd.find("#parentDepartment"),
			$parentDepartmentId = bd.find('#parentDepartmentId'),
			$changeDepartment = bd.find('#changeDepartment'),
			$parentTips = bd.find('#parentTips'),
			flag = true;

		dialog.addButton({
			text:'确定',
			className:'confirm',
			onclick:function(){
				flag = true;
				$departmentName.trigger('blur');
				var name = $.trim($departmentName.val()),
					parent = $parentDepartmentId.val() === 'root' ? rootDepartmentInfo.id : $parentDepartmentId.val();
				if(flag){
					var loading = Sbox.Loading('正在修改...');
					dialog.hide();
					$.post('/OrganManage!updateOrgan.action',{
						organId:departmentId,
						name:name,
						parent:parent
					},function(r){ 
						loading.remove();
						if(r.code === 200){
							Sbox.Success('修改成功');
							dialog.remove();
							parent = (parent === rootDepartmentInfo.id ? 'root' : parent);

							//更新当前修改的节点
							currentNode.name = name;
							OrganizeTreeView.tree.updateNode(currentNode); 

							var selectedNode = OrganizeTreeView.tree.getSelectedNodes()[0];

							if(parentDepartmentId === parent){//如果不移动
								//需要更新path里的值
								var path = pathModel.get('path').split('/');
								path.pop();
								path.push(name);
								pathModel.set({
									path:path.join('/')
								},{silent:true});
								pathModel.trigger('fresh');

							}else{//如果移动
								if(parent === 'root'){ //如果移动到根节点
									//将节点移动到根节点下
									var newNode = OrganizeTreeView.tree.transformToArray(currentNode)
									//newNode.zAsync =false;
									OrganizeTreeView.tree.addNodes(null,newNode[0],true);
									OrganizeTreeView.tree.removeNode(currentNode);
								}else{//否则是移动到别的节点
									var newParentNode = OrganizeTreeView.tree.getNodesByParam('id',parent,null)[0];
									if(newParentNode){
										if(newParentNode.zAsync){ //如果移动到的节点已经展开过，那么追加
											var newNode = OrganizeTreeView.tree.transformToArray(currentNode)
											//newNode.zAsync =false;
											OrganizeTreeView.tree.addNodes(newParentNode,newNode[0],true);
											OrganizeTreeView.tree.removeNode(currentNode);
										}else{//否则，删除当前编辑的节点即可
											OrganizeTreeView.tree.removeNode(currentNode);
										}
									}
								}

								//2013-06-25 20:42 重新计算可能有问题，比如移动到一个未展开的节点，那是算不出来的，所以还是将选中节点上移
								if(selectedNode && selectedNode.id === departmentId){
									var path = pathModel.get('path').split('/');
									path.pop();
									var organIds = pathModel.get('organIds').split('/');
									organIds.pop();
									pathModel.set({
										path:path.join('/'),
										organIds:organIds.join('/')
									})
								}

							}
							pathModel.trigger('reload.usage');
						}else if(r.code === 303){
							dialog.show();
							$departmentName.parent().next().html('<span class="error">该部门已存在</span>');
						}else if(r.code === 504){
							dialog.show();
							$departmentName.parent().next().html('<span class="error">部门名不合法</span>');
						}else if(r.code === 305){
							dialog.show();
							$parentTips.find('.tips').html('<span class="error">不能移动到本部门或其下级部门</span>');
							$parentTips.show();
						}else{
							//TODO 各种失败提示
							dialog.remove();
							Sbox.Fail('修改失败');
						}
					},'json');
				}
			}
		}).addButton({
			text:'取消',
			className:'cancle',
			onclick:function(){
				dialog.remove();
			}
		});

		$departmentName.on('blur',function(){
			var val = $.trim($(this).val());
			if(val === ''){
				$(this).parent().next().html('<span class="error">请填写部门名称</span>');
				flag = false;
			}else if(val.length > 20){
				$(this).parent().next().html('<span class="error">不能超过20个字符</span>');
				flag = false;
			}else{
				$(this).parent().next().empty();
			}
		}).on('focus',function(){
			$(this).parent().next().empty();
		})

		$changeDepartment.on('click',function(){
			dialog.hide();
			$parentTips.hide();
			Sbox.ChangeDepartment({
				callback:function(parentDepartment){
					dialog.show();
					if(parentDepartment === null) return;
					// allSpace = parentDepartment.allSpace;
					// usedSpace = parentDepartment.usedSpace;
					// //如果移动，那么freeSpace需要另外计算
					// if(parentDepartment.id === parentDepartmentId){
					// 	freeSpace = allSpace - usedSpace + oldSpace;
					// }else{
					// 	freeSpace = allSpace - usedSpace;
					// }
					// freeSpace = parseInt(freeSpace / 1024 / 1024 / 1024 * 100) / 100;
					// $freeSpace.html(freeSpace + ' GB');
					$parentDepartment.html(parentDepartment.path);
					$parentDepartmentId.val(parentDepartment.id);
				}
			})
		})

		return dialog;
	}
	//删除部门
	Sbox.DeleteDepartment = function(departmentId){
		var treeNode = OrganizeTreeView.tree.getNodesByParam('id',departmentId,null)[0],
			parentNode = treeNode.getParentNode() || null,
			selectedNode = OrganizeTreeView.tree.getSelectedNodes()[0],
			treeRoot = OrganizeTreeView.$el.find('.folds');
		var dialog = Sbox.Warning({
			title:'删除部门',
			message:'<p>您确定要删除部门 '+ treeNode.name +' 吗？</p> \
					<p class="tip">删除部门后，该部门及子部门用户都将归属到 <strong>'+ (parentNode === null ? rootDepartmentInfo.name : parentNode.name) +'</strong>！</p>',
						// <p style="font-size:12px; margin:15px 0 5px 0;"> \
						// 	<input type="radio" checked="checked" name="deltype" value="1" id="toAdmin" /> \
						// 	<label for="toAdmin" style="vertical-align:middle; color:#999"> 只删除部门，其子部门和部门用户都归属到被删除部门的上级部门</label> \
						// </p> \
						// <p style="font-size:12px;"> \
						// 	<input type="radio" name="deltype" value="0" id="delAll" /> \
						// 	<label for="delAll" style="vertical-align:middle; color:#999"> 删除部门及其所有部门和用户</label> \
						// </p>',
			closeButton:true,
			callback:function(f){
				if(f){
					var loading = Sbox.Loading('正在删除请稍候');
					dialog.remove();
					$.post('/OrganManage!deleteOrgan.action',{
						organId:departmentId
					},function(r){
						loading.remove();
						if(r.code === 200){
							Sbox.Success('删除成功')
							//如果当前选中的是删除节点，那么选中节点往上移动
							if(selectedNode && selectedNode.id === departmentId){
								var path = pathModel.get('path').split('/');
								path.pop();
								var organIds = pathModel.get('organIds').split('/');
								organIds.pop();
								pathModel.set({
									path:path.join('/'),
									organIds:organIds.join('/')
								})
							}
							//如果当前选中的是上级部门，那么删除节点下的用户将移动到上级部门，所以需要刷新上级部门的用户列表
							if((selectedNode && parentNode && selectedNode.id === parentNode.id) || (!parentNode && treeRoot.hasClass('cur'))){
								pathModel.trigger('change');
							}
							
							OrganizeTreeView.tree.removeNode(treeNode);
							pathModel.trigger('reload.usage');
						}else{
							//TODO 各种失败提示
							Sbox.Fail('删除失败');
						}
					},'json')
				}
			}
		}).addStyle('del-department-dialog')
		return dialog;
	}
	//新建用户
	Sbox.CreateUser = function(userList,path){
		var allSpace = rootDepartmentInfo.adminSettingSize,
			usedSpace = rootDepartmentInfo.adminUsedSpace,
			freeSpace = allSpace - usedSpace,
			parentDepartmentPath = path.get('path').split('/').join(' > '),
			parentDepartmentId = path.get('organIds').split('/').reverse()[0];
		freeSpace = parseInt(freeSpace / 1024 / 1024 / 1024 * 100) / 100;

		var dialog = new Sbox.Views.Window({
			title:'添加用户',
			body:'<form><div class="organize-dialog create-user-dialog"> \
	        		<div class="field"> \
	        			<div class="label"><em>*</em>帐号邮箱：</div> \
	        			<div class="ipt"> \
	        				<input type="text" class="ipt-text" name="email" id="email" /> \
	        			</div> \
	        			<div class="tips"> \
	        				<span class="tip">请填写真实邮箱</span> \
	        			</div> \
	        		</div> \
	        		<div class="field"> \
	        			<div class="label"><em>*</em>姓名：</div> \
	        			<div class="ipt"> \
	        				<input type="text" class="ipt-text" name="name" id="userName" /> \
	        			</div> \
	        			<div class="tips"> \
	        				<span class="tip">建议填写真实姓名</span> \
	        			</div> \
	        		</div> \
	        		<div class="field change-department"> \
	        			<div class="label"><em>*</em>所属部门：</div> \
	        			<div class="ipt"> \
	        				<span id="parentDepartment">'+ parentDepartmentPath +'</span> <a id="changeDepartment" href="javascript:;">修改</a> \
	        				<input type="hidden" name="parent" id="parentDepartmentId" value="'+ parentDepartmentId +'"/> \
	        			</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
	        		<div class="field space"> \
	        			<div class="label"><em>*</em>空间分配：</div> \
	        			<div class="ipt"> \
	        				<input type="text" class="ipt-text" name="space" id="space" /> \
	        				<em>GB</em> \
	        				<span>该部门剩余可分配空间：<span id="freeSpace">'+ freeSpace +' GB</span></span> \
	        			</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
	        		<div class="field"> \
	        			<div class="label">办公电话：</div> \
	        			<div class="ipt"> \
	        				<input type="text" class="ipt-text" name="phone" id="phone" /> \
	        			</div> \
	        			<div class="tips"> \
	        				<span class="tip">请填写联系电话</span> \
	        			</div> \
	        		</div> \
				</div></form>',
			width:560,
			closeButton:true,
			onClose:function(){
				dialog.remove();
			}
		});

		var bd = dialog.body,
			$email = bd.find('#email'),
			$userName = bd.find('#userName'),
			$phone = bd.find('#phone'),
			$space = bd.find('#space'),
			$freeSpace = bd.find('#freeSpace'),
			$parentDepartment = bd.find('#parentDepartment'),
			$parentDepartmentId = bd.find('#parentDepartmentId'),
			$changeDepartment = bd.find('#changeDepartment'),
			flag = true;

		dialog.addButton({
			text:'确定',
			className:'confirm',
			onclick:function(){
				flag = true;
				$('#email,#userName,#space,#phone').trigger('blur');
				if(flag){
					var loading = Sbox.Loading('正在添加...')
					dialog.hide();
					var name = $.trim($userName.val()),
						email = $.trim($email.val()),
						parent = $parentDepartmentId.val() === 'root' ? rootDepartmentInfo.id : $parentDepartmentId.val(),
						space = Math.floor($.trim($space.val()) * 1024 * 1024 * 1024),
						phone = $.trim($phone.val());
					$.post('/OrganManage!addUser.action',{
						name:name,
						email:email,
						parent:parent,
						space:space,
						phone:phone
					},function(r){
						loading.remove();
						if(r.code === 200){
							dialog.remove();
							Sbox.Success('添加成功');
							parent =  parent === rootDepartmentInfo.id ? 'root' : parent;
							if(parentDepartmentId === parent){ //如果是在当前选中的部门添加，那么更新用户列表
								r.result.isDomainAdmin = 0;
								var user = new Sbox.Models.User(r.result);
								userList.add(user);
							}
							//更新空间信息
							rootDepartmentInfo.adminSettingSize = rootDepartmentInfo.adminSettingSize - space;

							//要检查IT管理员是否在列表内，如果在，还要更新
							var domainAdmin = userList.getDomainAdmin();
							if(domainAdmin){
								domainAdmin.set({
									settingSize: rootDepartmentInfo.adminSettingSize
								})
							}

							pathModel.trigger('reload.usage');
						}else if(r.code === 303){
							dialog.show();
							var tips = $email.parent().next();
							tips.find('.tip').hide();
							if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
							tips.find(".error").text('该邮箱已使用').show();
						}else if(r.code === 302){
							dialog.show();
							var tips = $userName.parent().next();
							tips.find('.tip').hide();
							if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
							tips.find(".error").text('该姓名已存在').show();
						}else if(r.code === 501 || r.code === 503){
							dialog.show();
							var tips = $space.parent().next();
							tips.find('.tip').hide();
							if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
							tips.find(".error").text('空间分配不合法').show();
						}else{
							//TODO 各种失败情况
							dialog.remove();
							Sbox.Fail('添加失败')
						}
					},'json')
				}
			}
		}).addButton({
			text:'取消',
			className:'cancle',
			onclick:function(){
				dialog.remove();
			}
		});

		$('#email,#userName,#space,#phone').each(function(i,v){
			var ipt = $(v),
				id = ipt.attr('id'),
				tips = ipt.parent().next();
			ipt.on('blur',function(){
				var _this = $(this),
					val = $.trim(_this.val());
				switch(id){
					case 'email' :
						if(val === ''){
							showError('邮箱不能为空');
						}else if(!mailReg.test(val)){
							showError('邮箱格式不正确');
						}else{
							showRight();
						}
						break;
					case 'userName' :
						if(val === ''){
							showError('姓名不能为空');
						}else if(val.length > 10){
							showError('长度不能超过10个字符');
						}else if(!nameReg.test(val)){
							showError('支持中英文、数字、下划线');
						}else{
							showRight();
						}
						break;
					case 'space' :
						if(!$.isNumeric(val)){
							showError('请输入数字');
						}else if(val * 1 <= 0 || val.indexOf('.') > 0){
							showError('必须是大于0的整数');
						}else if(val * 1 > freeSpace){
							showError('剩余空间不足');
						}else{
							showRight();
						}
						break;
					case 'phone' :
						if(val !== '' && !/(^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})(\-[0-9]{1,4})?$)|(^(1[3458]\d{9})$)/.test(val)){
							showError('电话格式不正确')
						}else{
							showRight();
						}
						break;
				}
			}).on('focus',function(){
				showRight();
			}).on('keypress',function(e){
				if(e.keyCode === 13){
					dialog.getButton('确定')[0].trigger('click');
				}
			})

			function showError(err){
				tips.find('.tip').hide();
				if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
				tips.find(".error").text(err).show();
				flag = false;
			}
			function showRight(){
				tips.find('.tip').show();
				tips.find('.error').hide();
			}
		})

		$changeDepartment.on('click',function(){
			dialog.hide();
			Sbox.ChangeDepartment({
				callback:function(parentDepartment){
					dialog.show();
					if(parentDepartment === null) return;
					$parentDepartment.html(parentDepartment.path);
					$parentDepartmentId.val(parentDepartment.id);
				}
			})
		})
	}
	//编辑用户
	Sbox.EditUser = function(user,userList,path){
		var allSpace = rootDepartmentInfo.adminSettingSize,
			usedSpace = rootDepartmentInfo.adminUsedSpace,
			freeSpace = user.get('settingSize') + allSpace - usedSpace,
			oldSpace = user.get('settingSize'),
			oldFreeSpace = freeSpace;
			parentDepartmentPath = path.get('path').split('/').join(' > '),
			parentDepartmentId = path.get('organIds').split('/').reverse()[0];
		freeSpace = parseInt(freeSpace / 1024 / 1024 / 1024 * 100) / 100;

		var dialog = new Sbox.Views.Window({
			title:'编辑用户',
			body:'<form> \
					<input type="hidden" name="userId" id="userId"  value="'+ user.get('id') +'" />\
					<div class="organize-dialog create-user-dialog"> \
	        		<div class="field"> \
	        			<div class="label">帐号邮箱：</div> \
	        			<div class="ipt">'+ user.get('email') +'</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
	        		<div class="field"> \
	        			<div class="label"><em>*</em>姓名：</div> \
	        			<div class="ipt"> \
	        				<input type="text" class="ipt-text" name="name" value="'+ user.get('nickName') +'" id="userName" /> \
	        			</div> \
	        			<div class="tips"> \
	        				<span class="tip">建议填写真实姓名</span> \
	        			</div> \
	        		</div> \
	        		<div class="field space"> \
	        			<div class="label">'+ (user.get('isDomainAdmin') ? '空间大小：' : '<em>*</em>空间分配：') +'</div> \
	        			<div class="ipt">'
	        				+(user.get('isDomainAdmin') ? 
		        			parseInt(rootDepartmentInfo.adminSettingSize / 1024 / 1024 / 1024 * 100) / 100 :
		        			'<input type="text" class="ipt-text" name="space" id="space" value="'+ Math.round(user.get('settingSize') / 1024 / 1024 / 1024 * 100) / 100 +'" />')
	        				+'<em> GB</em> \
	        			</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
	        		<div class="field space" style="margin-top:-10px; '+ (user.get('isDomainAdmin') ? 'display:none;' : '') +'"> \
	        			<div class="label"></div> \
	        			<div class="ipt"> \
	        				<span>该用户已使用空间:<span id="usedSpace">'+ formatbytes(user.get('usedSize')) +'</span>，剩余可分配空间：<span id="freeSpace">'+ freeSpace +' GB</span></span> \
	        			</div> \
	        			<div class="tips"> \
	        			</div> \
	        		</div> \
	        		<div class="field"> \
	        			<div class="label">办公电话：</div> \
	        			<div class="ipt"> \
	        				<input type="text" class="ipt-text" name="phone" value="'+ user.get('phoneNum') +'" id="phone" /> \
	        			</div> \
	        			<div class="tips"> \
	        				<span class="tip">请填写联系电话</span> \
	        			</div> \
	        		</div> \
				</div><form>',
			width:560,
			closeButton:true,
			onClose:function(){
				dialog.remove();
			}
		});

		var bd = dialog.body,
			$userName = bd.find('#userName'),
			$space = bd.find('#space'),
			$phone = bd.find('#phone'),
			$freeSpace = bd.find('#freeSpace'),
			$parentDepartment = bd.find('#parentDepartment'),
			$parentDepartmentId = bd.find('#parentDepartmentId'),
			$changeDepartment = bd.find('#changeDepartment');
		dialog.addButton({
			text:'确定',
			className:'confirm',
			onclick:function(){
				flag = true;
				$('#userName,#space,#phone').trigger('blur');
				if(flag){
					var loading = Sbox.Loading('正在修改');
					dialog.hide();
					var name = $.trim($userName.val()),
						parent = $parentDepartmentId.val() === 'root' ? rootDepartmentInfo.id : $parentDepartmentId.val(),
						space = user.get('isDomainAdmin') ? rootDepartmentInfo.adminSettingSize : Math.floor($.trim($space.val()) * 1024 * 1024 * 1024),
						phone = $.trim($phone.val());
					$.post('/OrganManage!updateUser.action',{
						userId:user.get('id'),
						name:name,
						parent:parent,
						space:space,
						phone:phone
					},function(r){
						loading.remove();
						if(r.code === 200){
							dialog.remove();
							Sbox.Success('修改成功');
							parent =  parent === rootDepartmentInfo.id ? 'root' : parent;

							user.set({ //更新该user信息
								nickName:name,
								phoneNum:phone,
								settingSize:space
							})
							
							if(!user.get('isDomainAdmin')){ //编辑的非管理员
								//更新可用空间
								rootDepartmentInfo.adminSettingSize = rootDepartmentInfo.adminSettingSize - (space - oldSpace);

								//要检查IT管理员是否在列表内，如果在，还要更新
								var domainAdmin = userList.getDomainAdmin();
								if(domainAdmin){
									domainAdmin.set({
										settingSize: rootDepartmentInfo.adminSettingSize
									})
								}
							}

							pathModel.trigger('reload.usage');
						}else if(r.code === 302){
							dialog.show();
							var tips = $userName.parent().next();
							tips.find('.tip').hide();
							if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
							tips.find(".error").text('该姓名已存在').show();
						}else if(r.code === 303){
							dialog.show();
							var tips = $email.parent().next();
							tips.find('.tip').hide();
							if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
							tips.find(".error").text('该邮箱已使用').show();
						}else if(r.code === 501 || r.code === 503){
							dialog.show();
							var tips = $space.parent().next();
							tips.find('.tip').hide();
							if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
							tips.find(".error").text('空间分配不合法').show();
						}else{
							//TODO 各种失败情况
							dialog.remove();
							Sbox.Fail('修改失败')
						}
					},'json')
				}
			}
		}).addButton({
			text:'取消',
			className:'cancle',
			onclick:function(){
				dialog.remove();
			}
		});


		$('#userName,#space,#phone').each(function(i,v){
			var ipt = $(v),
				id = ipt.attr('id'),
				tips = ipt.parent().next();
			ipt.on('blur',function(){
				var _this = $(this),
					val = $.trim(_this.val());
				switch(id){
					case 'userName' :
						if(val === ''){
							showError('姓名不能为空');
						}else if(val.length > 10){
							showError('长度不能超过10个字符');
						}else if(!nameReg.test(val)){
							showError('支持中英文、数字、下划线');
						}else{
							showRight();
						}
						break;
					case 'space' :
						if(!$.isNumeric(val)){
							showError('请输入数字');
						}else if(val * 1 <= 0 || val.indexOf('.') > 0){
							showError('必须是大于0的整数');
						}else if(val * 1 > freeSpace){
							showError('剩余空间不足');
						}else if(val * 1024 * 1024 * 1024 < user.get('usedSize')){
							showError('分配空间小于用户已使用空间');
						}else{
							showRight();
						}
						break;
					case 'phone' :
						if(val !== '' && !/(^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})(\-[0-9]{1,4})?$)|(^(1[3458]\d{9})$)/.test(val)){
							showError('电话格式不正确')
						}else{
							showRight();
						}
						break;
				}
			}).on('focus',function(){
				showRight();
			}).on('keypress',function(e){
				if(e.keyCode === 13){
					dialog.getButton('确定')[0].trigger('click');
				}
			})

			function showError(err){
				tips.find('.tip').hide();
				if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
				tips.find(".error").text(err).show();
				flag = false;
			}
			function showRight(){
				tips.find('.tip').show();
				tips.find('.error').hide();
			}
		})
		
		if(user.get('id') === userId && !isDomainAdmin){ //如果普通管理员选中自己，那么不可编辑部门
			$changeDepartment.remove();
		}else{
			$changeDepartment.on('click',function(){
				dialog.hide();
				Sbox.ChangeDepartment({
					callback:function(parentDepartment){
						if(parentDepartment === null){
	                        dialog.show();
	                        return;
						}

	                    allSpace = parentDepartment.allSpace;
	                    usedSpace = parentDepartment.usedSpace;

	                    if(user.get('isAdmin') && parentDepartment.id !== parentDepartmentId){
	                        Sbox.Warning({
	                            title:'修改部门',
	                            message:'<p>您确定修改用户所属部门吗？</p> \
	                                    <p class="tip">修改所属部门后将取消该用户部门管理员身份！</p>',
	                            closeButton:false,
	                            esc:false,
	                            callback:function(f){
	                                dialog.show();
	                                if(f){
	                                    //如果移动，那么freeSpace需要另外计算
	                                    freeSpace = allSpace - usedSpace;

	                                    freeSpace = parseInt(freeSpace / 1024 / 1024 / 1024 * 100) / 100
	                                    $freeSpace.html(freeSpace + ' GB');
	                                    $parentDepartment.html(parentDepartment.path);
	                                    $parentDepartmentId.val(parentDepartment.id);
	                                }else{
	                                	freeSpace = oldFreeSpace;
	                                	$freeSpace.html(freeSpace + ' GB');
	                                	$parentDepartment.html(parentDepartmentPath);
	                                	$parentDepartmentId.val(parentDepartmentId);
	                                }
	                            }
	                        })
	                    }else if(parentDepartment.id === parentDepartmentId){
	                        dialog.show();
	                        freeSpace = user.get('settingSize') + allSpace - usedSpace;
	                       
	                        freeSpace = parseInt(freeSpace / 1024 / 1024 / 1024 * 100) / 100
	                        $freeSpace.html(freeSpace + ' GB');
	                        $parentDepartment.html(parentDepartment.path);
	                        $parentDepartmentId.val(parentDepartment.id);
	                    }else{
	                    	dialog.show();
                            freeSpace = allSpace - usedSpace;

                            freeSpace = parseInt(freeSpace / 1024 / 1024 / 1024 * 100) / 100
                            $freeSpace.html(freeSpace + ' GB');
                            $parentDepartment.html(parentDepartment.path);
                            $parentDepartmentId.val(parentDepartment.id);
	                    }
					}
				})
			})
		}
	}
	//删除用户
	Sbox.DeleteUser = function(user,userList){
		var dialog = Sbox.Warning({
			title:'删除用户',
			message:'<p>您确定要删除用户 '+ user.get('nickName') +' 吗？</p> \
					<p class="tip">该用户所有文件容量'+ formatbytes(user.get('usedSize')) +'</p> \
					<div style="position:relative; left:-50px;  padding-top:10px;"> \
						<p style="font-size:12px; margin:15px 0 5px 0;"> \
							<input type="radio" checked="checked" name="deltype" value="1" id="toUser" /> \
							<label for="toUser" style="vertical-align:middle; color:#999"> 删除用户，把文件转移给其他用户</label> \
						</p> \
						<p style="font-size:12px; margin:5px 0 10px 0;"> \
						<input type="text" class="ipt-text" style="width:200px; margin-left:18px;" id="email" placeholder="请输入接受文件的用户邮箱" autocomplete="off" /> <span class="error" id="emailTip"></span> \
						</p> \
						<p style="font-size:12px;"> \
							<input type="radio" name="deltype" value="0" id="delAll" /> \
							<label for="delAll" style="vertical-align:middle; color:#999"> 彻底删除用户，把用户所有文件也删除</label> \
						</p> \
					</div>',
			closeButton:true,
			preventHide:true,
			callback:function(f){
				if(f){
					var deltype = bd.find('input:radio:checked').val(),
						emailVal = $.trim(email.val());
					if(deltype === '1'){
						if(emailVal === ''){
							emailTip.html('请输入邮箱地址');
							return;
						}else if(!mailReg.test(emailVal)){
							emailTip.html('邮箱地址不正确');
							return;
						}
					}

					var loading = Sbox.Loading('正在删除请稍候');
					dialog.hide();
					$.post('/OrganManage!deleteOrganUser.action',{
						userId:user.get('id'),
						deleteWay:deltype,
						shiftEmail:deltype === '1' ? $.trim(email.val()) : ''
					},function(r){
						loading.remove();
						if(r.code === 200){
							dialog.remove();
							Sbox.Success('删除成功');

							//删除成功则人数统计更新
							organizeStatModel.set({
								used:organizeStatModel.get('used') - 1
							});

							if(deltype === '1'){//如果转移到某个人
								var toUser = userList.getUserByEmail($.trim(email.val()));
								if(toUser){ //如果转移的人在当前列表，那么更新
									toUser.set({
										usedSize:toUser.get('usedSize') + user.get('usedSize'),
										settingSize:toUser.get('settingSize') + user.get('settingSize')
									})
								}
								rootDepartmentInfo.adminUsedSpace = r.spaceSituation.adminUsedSpace;
								rootDepartmentInfo.adminSettingSize = r.spaceSituation.adminAllSpace;
							}else{ //如果彻底删除
								
								//更新空间信息
								rootDepartmentInfo.adminSettingSize = rootDepartmentInfo.adminSettingSize + user.get('settingSize');

								var domainAdmin = userList.getDomainAdmin();
								if(domainAdmin){ //如果管理员在当前列表，那么更新
									domainAdmin.set({
										settingSize: rootDepartmentInfo.adminSettingSize
									})
								}
							}

							userList.remove(user);

							pathModel.trigger('reload.usage');
						}else if(r.code === 502){
							dialog.show();
							emailTip.html('转移用户空间不足');
						}else if(r.code === 405){
							dialog.show();
							emailTip.html('该用户不存在');
						}else if(r.code === 407){
							dialog.show();
							emailTip.html('该用户未激活');
						}else if(r.code === 505){
							dialog.show();
							emailTip.html('不能转移给删除用户');
						}else if(r.code === 406){
							dialog.remove();
							Sbox.Fail('不能删除域管理员',2);
						}else{
							//TODO 各种失败情况
							dialog.remove();
							Sbox.Fail('删除失败');
						}
					},'json')
					
				}
			}
		}).addStyle('del-user-dialog')
		
		var bd = dialog.body,
			toUser = bd.find('#toUser'),
			email = bd.find('#email'),
			emailTip = bd.find('#emailTip'),
			delAll = bd.find('#delAll');

		if(!user.get('isActive') || user.get('usedSize') === 0){ 
			toUser.attr('disabled',true); 
			email.attr('disabled',true); 
			delAll.attr('checked',true); 
		}else{
			Sbox.placeholder(email);
			Sbox.Util.selectUser(email);
			email.on('focus',function(){ 
				toUser.attr('checked',true);
			})
			toUser.on('click',function(){ 
				email.focus(); 
			})
		}
		delAll.on('click',function(){
			emailTip.empty();
			email.blur();
		})
		
		return dialog;
	}
	//移动用户
	Sbox.MoveUser = function(users,userList,path){
		var ids = [],
			parentDepartmentId = path.get('organIds').split('/').reverse()[0];
		for(var i = 0, len = users.length; i < len; i++){
			ids.push(users[i].get('id'));
		}
		Sbox.ChangeDepartment({
			isMove: true,
			callback: function(parentDepartment){
				if(parentDepartment === null) return;

				if(parentDepartmentId === parentDepartment.id){ //如果未移动
					Sbox.Fail('该用户已在该部门下');
					return;
				}
				var parent = parentDepartment.id;
				Sbox.Loading('正在移动...')
				parent = (parent === 'root' ? rootDepartmentInfo.id : parent);
				$.post('/OrganManage!moveUsersToOrgan.action',{
					userIds:ids.join(','),
					parent:parent
				},function(r){
					Sbox.Loading().remove();
					if(r.code === 200){
						Sbox.Success('移动成功');
						userList.remove(users);
					}
				},'json')
			}
		})
	}
	//修改部门
	Sbox.ChangeDepartment = function(options){
		var dialog = new Sbox.Views.Window({
			title:options.isMove ? '移动到' : '修改部门',
			body:'<div class="organize-tree change-department-tree"><div class="folds cur"><i class="fold open"></i><a href="javascript:;">'+ rootDepartmentInfo.name +'</a></div><ul class="ztree" id="ChangeDepartmentTree"></ul></div>',
			width:370,
			closeButton:true,
			onHide:function(){
				options.callback(null);
				dialog.remove();
			}
		});
		var bd = dialog.body,
			selectedDepartment = {id:'root'},
			treeContainer = bd.find("#ChangeDepartmentTree");
		treeContainer.append('<li style="padding:20px;text-align:center;" class="tree-loading"><span class="icon icon-loading"></span></li>');

		bd.find('.folds').on('click','.fold',function(){
        	var el = $(this);
        	if(el.hasClass('open')){
        		el.removeClass('open').addClass('close');
        		treeContainer.slideUp('fast');
        	}else{
        		el.removeClass('close').addClass('open');
        		treeContainer.slideDown('fast');
        	}
        }).on('click','a',function(){
        	tree.cancelSelectedNode(tree.getSelectedNodes()[0]); 
        	bd.find('.folds').addClass('cur');
        	selectedDepartment = {id:'root'};
        })

		dialog.addButton({
			text:'确定',
			className:'confirm',
			onclick:function(){
				var path = [rootDepartmentInfo.name],tmp = [],
					allSpace,usedSpace;
				if(selectedDepartment.id !== 'root'){
					var treeNode = tree.getSelectedNodes()[0];
					allSpace = treeNode.all_space * 1;
					usedSpace = treeNode.all_space * 1 - treeNode.space * 1;
					while(treeNode){
						tmp.push(treeNode.name);
						treeNode = treeNode.getParentNode();
					}
				}else{
					var root = OrganizeTreeView.$el.find('.folds');
					allSpace = root.attr('allSpace') * 1;
					usedSpace = root.attr('usedSpace') * 1;
				}
				path = path.concat(tmp.reverse()).join(' > ');
				options.callback({
					path:path,
					allSpace:allSpace,
					usedSpace:usedSpace,
					id:selectedDepartment.id
				});
				dialog.remove();
			}
		}).addButton({
			text:'取消',
			className:'cancle',
			onclick:function(){
				dialog.hide();
			}
		})
		var setting = {
            view: {
                autoCancelSelected:false, //是否支持ctrl反选
                dblClickExpand:false, //是否双击打开
                expandSpeed:'fast',//("slow", "normal", or "fast") or 1000
                nameIsHTML:true,//name是否允许html
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
                }
            },
            async:{//异步加载所需参数
                autoParam : ['id'],
                dataFilter : function(treeId,parentNode,childNodes){
                	// var _childNodes = []
                	return childNodes.result;
                },
                enable : true,
                type : "get",
                url : "/OrganManage!getOrgans.action?_t=" + new Date().valueOf()
            },
            callback:{ //各种回调
                onClick:function(e,treeId,treeNode){
                	bd.find('.folds').removeClass('cur');
                	// if(treeNode.zAsync){
                	// 	tree.expandNode(treeNode,true,true,true)
                	// }else{
                	// 	tree.reAsyncChildNodes(treeNode,'refresh',false)
                	// }
                    selectedDepartment = treeNode;
                },
                onAsyncSuccess:function(e,treeId,treeNode,msg){ //总是在展开成功后,将treeNode交给checkNode处理
					// if(treeNode && treeNode.children.length === 0){
					// 	treeNode.isParent = false;
					// 	tree.updateNode(treeNode);
					// }
					// updateWidth();

					treeContainer.find('li.tree-loading').remove();
                },
                onExpand:function(){
                	//updateWidth();
                }
            }
        };

        var tree = $.fn.zTree.init(treeContainer, setting);

        return dialog;
	}
	//设置部门管理员
	Sbox.SetAdmin = function(user){
		user.setAdmin();
	}
	//取消部门管理员
	Sbox.CancelAdmin = function(user){
		user.cancelAdmin();
	}
	//重发激活邮件
	Sbox.Resend = function(user){
		user.resend();
	}
	//导入用户
	Sbox.ImportUser = function(){

	}

})(jQuery);
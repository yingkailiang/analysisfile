/**
 * @fileOverview 后台管理员页面使用，包括群组管理 etc
 * @author angelscat@vip.qq.com
 */

jQuery(function(){//新建群组
	if(!document.getElementById('createGroup')) return;
	if($('#createGroup').hasClass('btn32-disabled')) return;
	$('#createGroup').on('click',function(){
		Sbox.CreateGroup();
	})
});

jQuery(function(){ //hover效果
	if(!$('.manage-content')[0]) return;
	$('.manage-content .list-body').on('mouseenter','li',function(){
		$(this).addClass('hover');
	}).on('mouseleave','li',function(){
		$(this).removeClass('hover');
	})
});

jQuery(function(){ //群组操作：重命名，删除 etc;
	if(!document.getElementById('groupList')) return;

	var glist = $('#groupList li');
	_(glist).each(function(li){
		var el = $(li),
			gid = el.attr('data-id'),
			gname = el.find('.name a:eq(0)').text();
		el.on('click','.rename-group',function(){
			Sbox.RenameGroup(gid,gname,el);
		}).on('click','.del-group',function(){
			Sbox.DeleteGroup(gid,el);
		})
	})
});

jQuery(function(){ //添加新成员
	if(!document.getElementById('addNewGroup')) return;
	if($('#addNewGroup').hasClass('btn32-disabled')) return;
	$('#addNewGroup').on('click',function(){
		Sbox.AddUserToGroup(groupId);
	})
});

jQuery(function(){ //群成员相关操作：移出，移动 etc;
	if(!document.getElementById('groupMemberList')) return;
	var ulist = $('#groupMemberList li');
	_(ulist).each(function(li){
		var el = $(li),
			uid = el.attr('data-id');
		el.on('click','.remove',function(){
			Sbox.RemoveFromGroup(uid,groupId,el);
		}).on('click','.moveto',function(){
			Sbox.MoveToGroup(uid,groupId,el);
		})
	})
});

jQuery(function(){
	if(!document.getElementById('changeAdmin')) return;
	$('#changeAdmin').on('click',function(){
		Sbox.ChangeAdmin();
	})
});

(function($){//群组相关
	
	var tpl_creategroup = '<div class="group-dialog"> \
								<div class="group-name"> \
									<label>群组名：</label> \
									<input type="text" class="ipt-text" id="groupName" /> \
									<div class="tips" id="nameTip">1-20个字符，支持中英文、数字、下划线</div> \
									<span class="error" id="nameError"></span> \
								</div> \
								<div class="choose-user"> \
									<div class="user-list"> \
										<div class="legend">用户列表</div> \
										<div class="search"> \
											<input type="text" placeholder="输入用户名或邮箱搜索" id="search" autocomplete="off" /> \
											<span class="label icon icon-search" id="searchBtn"></span> \
										</div> \
										<div class="choose-list" id="chooseList"> \
											<div style="text-align:center;padding:20px;"><span class="icon icon-loading"></span>正在加载数据...</div> \
										</div> \
									</div> \
								</div> \
								<div class="selected-user"> \
									<div class="selected-user-action"> \
										<a href="javascript:;" class="btn btn24 btn24-blue" id="clearSelectedUser">清空列表</a> \
									</div> \
									<div class="user-list"> \
										<div class="legend">已添加成员(<span id="hasAdded">0</span>)</div> \
										<div class="selected-list" id="selectedList"> \
											<ul> \
											</ul> \
										</div> \
									</div> \
								</div> \
							</div>';
	var tpl_adduser = '<div class="group-dialog"> \
		                <div class="choose-user"> \
		                    <div class="search"> \
		                        <input type="text" placeholder="输入用户名或邮箱搜索" id="search" autocomplete="off" /> \
		                        <span class="label icon icon-search" id="searchBtn"></span> \
		                    </div> \
		                    <div class="user-list"> \
		                        <div class="legend">未添加成员</div> \
		                        <div class="choose-list" id="chooseList"> \
		                            <ul> \
		                            	<li style="padding:20px 0; text-align:center; cursor:default; background:#FFF!important; border:0;"><span class="icon icon-loading"></span>正在加载...</li> \
		                            </ul> \
		                        </div> \
		                    </div> \
		                </div> \
		                <div class="selected-user"> \
		                    <div class="user-list"> \
		                        <div class="legend">新添加成员(<span id="hasAdded">0</span>)</div> \
		                        <div class="selected-list" id="selectedList"> \
		                            <ul> \
		                            </ul> \
		                        </div> \
		                    </div> \
		                </div> \
		            </div>';


	/**
     * 新建群组
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.CreateGroup = function(){ //新建群组
		var allGroups = null,
			allUser, //= allGroups[0].member,
			selectedUser = [];

		var dialog = new Sbox.Views.Window({
				title:'新建群组',
				body:tpl_creategroup,
				width:692,
				closeButton:true,
				onHide:function(){
					dialog.remove();
				}
			});
			dialog.addButton({
				text:'确定',
				onclick:function(){
					flag = true;
					groupName.trigger('blur');
					if(flag){
						var ids = []
						_(selectedUser).each(function(user){
							ids.push(user.id);
						})
						$.post('/Group!create.action',{
							GroupName:$.trim(groupName.val()),
							members:ids.join(',')
						},function(r){
							if(r.code === 701 || r.code === 403){
								Sbox.Login();
							}else if(r.code === 200){
								dialog.remove();
								Sbox.Success('创建成功');
								setTimeout(function(){
									location.reload();
								},1000);
							}else if(r.code === 302){
								Sbox.Fail('创建失败');
							}else{
								Sbox.Fail('创建失败');
							}
						},'json').error(function(){
							Sbox.Loading().remove();
							Sbox.Error('服务器错误，请稍候重试');
						})
					}
				},
				className:'confirm'
			}).addButton({
				text:'取消',
				onclick:function(){
					dialog.remove();
				}
			})

		var bd = dialog.body,
			groupName = bd.find('#groupName'),
			nameError = bd.find('#nameError'),
			nameTip = bd.find('#nameTip'),
			chooseList = bd.find('#chooseList'),
			selectedList = bd.find('#selectedList ul'),
			search = bd.find('#search'),
			searchBtn = bd.find('#searchBtn'),
			hasAdded = bd.find('#hasAdded'),
			clearSelectedUser = bd.find('#clearSelectedUser');

		var flag = true;

		Sbox.placeholder(search);

		if(allGroups === null){
    		$.get('/Group!getGroupsContainMember.action?_t='+Math.random(),function(r){
    			if(r.length !== 0){
    				allGroups = r;
    				allUser = allGroups[0].members;
    				initUsers();
    			}else{
    				//错误 TODO
    			}
    		},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			});
    	}else{
    		initUsers();
    	}
		//初始化所有群组用户
		function initUsers(){
			var glist = ''
			_(allGroups).each(function(group,i){
				var member = group.members,
					ulist = '';
				if(member){
					_(member).each(function(user){
						ulist += '<li title="'+ user.nickName + '<' + user.loginName + '>" data-id="'+ user.id +'">'+ replaceHtml(user.nickName) +'<span class="u-email">&lt;'+ user.loginName +'&gt;</span></li>'
					})
				}
				glist += '<dl> \
                            <dt data-id="'+group.id+'" title="'+group.group_name+'('+ group.members.length +')"> \
                                <span class="icon icon-gclose"></span><span style="width:200px;height:26px;overflow:hidden;">'+ replaceHtml(group.group_name) +' ('+ group.members.length +')</span> \
                            </dt> \
                            <dd style="display:none;"> \
                                <ul>'+ ulist +'</ul>\
                            </dd> \
                        </dl>';
			})
			chooseList.html(glist);
		}

    	groupName.on('keypress',function(e){
    		if(e.keyCode === 13){
    			dialog.getButton('确定')[0].trigger('click');
    		}
    	}).on('focus',function(){
    		nameTip.show();
    		nameError.hide();
    	}).on('blur',function(){
    		var gname = $.trim(groupName.val());
			if(gname === ''){
				nameTip.hide();
				nameError.text('群组名不能为空').show();
				flag = false;
			}else if(gname.length > 20){
				nameTip.hide();
				nameError.text('长度不能超过20个字符').show();
				flag = false;
			}else if(!nameReg.test(gname)){
				nameTip.hide();
				nameError.text('支持中英文、数字、下划线').show();
				flag = false;
			}else if(hasGroupName(gname)){
				nameTip.hide();
				nameError.text('该群组已存在').show();
				flag = false;
			}
    	})

    	//绑定群组列表事件
    	chooseList.on('mouseenter','li,dt',function(){
    		$(this).addClass('hover');
    	}).on('mouseleave','li,dt',function(){
    		$(this).removeClass('hover');
    	}).on('click','dt .icon',function(e){
    		var el = $(this),
    			ulist = el.parent().next();
    		if(el.hasClass('icon-gopen')){
    			ulist.hide();
    			el.removeClass('icon-gopen').addClass('icon-gclose');
    		}else if(el.hasClass('icon-gclose')){
    			ulist.show();
    			el.removeClass('icon-gclose').addClass('icon-gopen');
    		}
    		e.stopImmediatePropagation();
    	}).on('click','dt',function(e){
    		var gid = $(this).attr('data-id');
    		var users = getUsersByGroup(gid);
    		_(users).each(function(user){
    			addUser(user);
    		})
    	}).on('click','li',function(){
    		var id = $(this).attr('data-id');
    		var user = getUser(id);
    		addUser(user);
    	})

    	selectedList.on('click','li',function(e){
    		var curTarget = $(e.target || e.srcElement),
    			el = $(this),
    			id = el.attr('data-id');
    		if(curTarget.is('.icon')){
    			el.remove();
    			removeUser(id);
    		}
    	})
    	clearSelectedUser.on('click',function(){
    		selectedList.find('.icon-cancle2').trigger('click');
    	});

    	search.on('keyup',function(){
    		var str = $(this).val(),
				users = searchUser(str),
				regexp = new RegExp('(' + str + ')','gi');
			if(str === '' || str === $(this).attr('placeholder')){
				chooseList.find('dl').show();
				chooseList.find('.search-list').hide();
			}else{
				if(!chooseList.find('.search-list')[0]){
					chooseList.append('<ul class="search-list"></ul>');
				}
				var searchList = chooseList.find('.search-list').show(),
					list = ''
				_(users).each(function(user){
					list += '<li title="'+ user.nickName +'<'+ user.loginName +'>" data-id="'+ user.id +'">'+ replaceHtml(user.nickName).replace(regexp,'<b>$1</b>') +'<span class="u-email">&lt;'+ user.loginName.replace(regexp,'<b>$1</b>') +'&gt;</span></li>';
				})
				searchList.html(list);
				chooseList.find('dl').hide();
			}
    	})
		
		searchBtn.on('click',function(){
			search.trigger('keyup');
		})

    	function hasSelected(user){//是否已经选择
			var flag = false;
			_(selectedUser).each(function(u){
				if(u.id == user.id){
					flag = true;
					return;
				}
			})
			return flag;
    	}

    	function hasGroupName(name){//检查组名是否已经存在
    		var flag = false;
    		_(allGroups).each(function(group){
    			if(group.group_name.toLowerCase() === name.toLowerCase()) flag = true;
    		})
    		return flag;
    	}

    	function getUser(id){ //通过id获取用户
    		var user;
    		_(allUser).each(function(u){
    			if(u.id == id) user = u;
    		})
    		return user;
    	}
    	//添加用户
    	function addUser(user){
    		if(hasSelected(user)) return;
    		selectedUser.push(user);
    		var li = '<li data-id="'+ user.id +'"> \
                        '+ replaceHtml(user.nickName) +'<span class="u-email">&lt;'+ user.loginName +'&gt;</span> \
                        <a href="javascript:;" class="remove" title="移除"><span class="icon icon-cancle2"></span></a> \
                    </li>'
            selectedList.append(li);
	    	selectedList.scrollTop(9999);
	    	hasAdded.text(selectedUser.length);
    	}
    	//移除用户
    	function removeUser(id){
    		_(selectedUser).each(function(u,i){
				if(u.id == id){
					selectedUser.splice(i,1);
					return;
				}
			})
			hasAdded.text(selectedUser.length);
    	}
    	//获得某个组所有的用户
    	function getUsersByGroup(gid){
    		var users;
    		_(allGroups).each(function(group){
    			if(group.id == gid) users = group.members;
    		})
    		return users;
    	}
    	//搜索用户
    	function searchUser(str){
			var filterUsers = [];
			_(allUser).each(function(u){
				if(u.nickName.toLowerCase().indexOf(str.toLowerCase()) >= 0 || u.loginName.toLowerCase().indexOf(str.toLowerCase()) >= 0){
					filterUsers.push(u);
				}
			})
			return filterUsers;
    	}

		return dialog;
	}

	/**
     * 向已有群组添加新成员
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.AddUserToGroup = function(gid){ //向已有群组添加新成员
		var notAddedUser = null,
			selectedUser = [];
		var dialog = new Sbox.Views.Window({
			title:'添加新成员',
			body:tpl_adduser,
			width:692,
			closeButton:true,
			onHide:function(){
				dialog.remove();
			}
		});
		dialog.addButton({
			text:'确定',
			onclick:function(){
				var ids = []
				_(selectedUser).each(function(user){
					ids.push(user.id);
				})
				var loading = Sbox.Loading('正在添加');
				dialog.remove();
				$.post('/Group!addGroupMembers.action',{
					groupId:gid,
					members:ids.join(',')
				},function(r){
					loading.remove()
					if(r.code === 701 || r.code === 403){
						Sbox.Login();
					}else if(r.code === 200){
						Sbox.Success('添加成功');
						setTimeout(function(){
							location.reload();
						},1000)
					}else{
						Sbox.Fail('添加失败');
					}
				},'json').error(function(){
					Sbox.Loading().remove();
					Sbox.Error('服务器错误，请稍候重试');
				})
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		var bd = dialog.body,
			chooseList = bd.find('#chooseList ul'),
			selectedList = bd.find('#selectedList ul'),
			search = bd.find('#search'),
			searchBtn = bd.find('#searchBtn'),
			hasAdded = bd.find('#hasAdded');

		Sbox.placeholder(search);

		//初始化所有群组用户
		function initUsers(){
			var ulist = ''
			if(notAddedUser.length === 0){
				ulist += '<li style="padding:20px 0; text-align:center; cursor:default; background:#FFF!important; border:0;">所有成员都已在该组内</li>'
			}else{
				_(notAddedUser).each(function(user){
					ulist += '<li title="'+ user.nickName + '<' + user.loginName + '>" data-id="'+ user.id +'">'+ replaceHtml(user.nickName) +'<span class="u-email">&lt;'+ user.loginName +'&gt;</span></li>'
				})
			}
			chooseList.html(ulist);
		}

		if(notAddedUser === null){
			//ajax TODO
    		$.get('/Group!getGroupNotContainMember.action?groupId='+gid+'&_t='+Math.random(),function(r){
    			if(r.code === 701 || r.code === 403){
					Sbox.Login();
				}else if(r.code === 200){
    				notAddedUser = r.members;
    				initUsers();
    			}else{
    				//出错 TODO
    			}
    		},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			});
    	}else{
    		initUsers();
    	}

    	//绑定群组列表事件
    	chooseList.on('mouseenter','li,dt',function(){
    		$(this).addClass('hover');
    	}).on('mouseleave','li,dt',function(){
    		$(this).removeClass('hover');
    	}).on('click','li',function(){
    		var id = $(this).attr('data-id');
    		if(id){
	    		var user = getUser(id);
	    		addUser(user);
    		}
    	})

    	selectedList.on('click','li',function(e){
    		var curTarget = $(e.target || e.srcElement),
    			el = $(this),
    			id = el.attr('data-id');
    		if(curTarget.is('.icon')){
    			el.remove();
    			removeUser(id);
    		}
    	})

    	search.on('keyup',function(){
    		var str = $(this).val(),
				users = searchUser(str),
				regexp = new RegExp('(' + str + ')','gi');
			if(str === '' || str === $(this).attr('placeholder')){
				users = notAddedUser;
			}
			var list = ''
			_(users).each(function(user){
				list += '<li title="'+ user.nickName +'<'+ user.loginName +'>" data-id="'+ user.id +'">'+ replaceHtml(user.nickName).replace(regexp,'<b>$1</b>') +'<span class="u-email">&lt;'+ user.loginName.replace(regexp,'<b>$1</b>') +'&gt;</span></li>';
			})
			chooseList.html(list);
    	})
		
		searchBtn.on('click',function(){
			search.trigger('keyup');
		})

    	function hasSelected(user){//是否已经选择
			var flag = false;
			_(selectedUser).each(function(u){
				if(u.id == user.id){
					flag = true;
					return;
				}
			})
			return flag;
    	}

    	function getUser(id){ //通过id获取用户
    		var user;
    		_(notAddedUser).each(function(u){
    			if(u.id == id) user = u;
    		})
    		return user;
    	}
    	//添加用户
    	function addUser(user){
    		if(hasSelected(user)) return;
    		selectedUser.push(user);
    		var li = '<li class="hover" data-id="'+ user.id +'"> \
                        '+ replaceHtml(user.nickName) +'<span class="u-email">&lt;'+ user.loginName +'&gt;</span> \
                        <a href="javascript:;" class="remove" title="移除"><span class="icon icon-cancle2"></span></a> \
                    </li>'
            selectedList.append(li);
	    	selectedList.scrollTop(9999);
	    	hasAdded.text(selectedUser.length); 
    	}
    	//移除用户
    	function removeUser(id){
    		_(selectedUser).each(function(u,i){
				if(u.id == id){
					selectedUser.splice(i,1);
					return;
				}
			})
			hasAdded.text(selectedUser.length); 
    	}
    	//搜索用户
    	function searchUser(str){
			var filterUsers = [];
			_(notAddedUser).each(function(u){
				if(u.nickName.toLowerCase().indexOf(str.toLowerCase()) >= 0 || u.loginName.toLowerCase().indexOf(str.toLowerCase()) >= 0){
					filterUsers.push(u);
				}
			})
			return filterUsers;
    	}

		return dialog;
	}
	/**
     * 将指定用户移出某个群组
     * @param {String} uid 用户id
     * @param {String} gid 群组id
     * @param {String} [item] 该条信息所在行的dom
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.RemoveFromGroup = function(uid,gid,item){ //将指定用户移出某个群组
		var dialog = Sbox.Warning({
			title:'移出成员',
			message:'<p>您确定要移出该成员吗？</p>',
			closeButton:true,
			callback:function(f){
				if(f){
					var loading = Sbox.Loading('正在移出请稍候');
					$.post('/Group!deleteGroupMember.action',{
						groupId:gid,
						userIds:uid
					},function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){
							loading.remove();
							Sbox.Success('删除成功');
							if(item) item.remove();
							setTimeout(function(){
								location.reload();
							},1000);
						}else{
							loading.remove();
							Sbox.Fail('删除失败');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					})
				}
			}
		})
		return dialog;
	}

	/**
     * 将指定用户移动到其他群组
     * @param {String} uid 用户id
     * @param {String} gid 群组id
     * @param {String} [item] 该条信息所在行的dom
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.MoveToGroup = function(uid,gid,item){ //将指定用户移动到其他群组
		var allGroups = null;

		var dialog = new Sbox.Views.Window({
		    title:'移动到群组',
		    body:'<div class="group-move-dialog"><ul id="groupList"><li style="padding:20px; text-align:center; border:0; cursor:default;"><span class="icon icon-loading"></span>正在加载...</li></ul></div>',
		    width:440,
		    closeButton:true
		});
		dialog.addButton({
		    text:'确定',
		    onclick:function(){
		    	var ids = [];
		    	groupList.find('.icon-checked').each(function(){
		    		ids.push($(this).attr('data-id'));
		    	})
		    	$.post('/Group!moveToGroups.action',{
		    		userId:uid,
		    		rgId:gid,
		    		groupIds:ids.join(',')
		    	},function(r){
		    		if(r.code === 701 || r.code === 403){
						Sbox.Login();
					}else if(r.code === 200){
		    			Sbox.Success('移动成功');
		    			dialog.remove();
		    			if(item) item.remove();
		    			setTimeout(function(){
		    				location.reload();
		    			},1000)
		    		}else{
		    			Sbox.Fail('移动失败');
		    		}
		    	},'json').error(function(){
					Sbox.Loading().remove();
					Sbox.Error('服务器错误，请稍候重试');
				})
		    },
		    className:'confirm'
		}).addButton({
		    text:'取消',
		    onclick:function(){
		        dialog.remove();
		    }
		})
		var bd = dialog.body,
			groupList = bd.find('#groupList');

		function initGourp(){
			var list = ''
			if(allGroups.length === 1){
				Sbox.Error('没有其他群组，请新建群组后重试');
				dialog.remove();
			}else{
				_(allGroups).each(function(group){
					if(group.id === gid) return;
					list += '<li><span class="icon icon-unchecked" data-id="'+ group.id +'"></span> <span>'+ replaceHtml(group.group_name) +'('+ group.number +')</span></li>'
				})
			}
			groupList.html(list);
		}
		if(allGroups === null){
    		$.get('/Group!getGroups.action?_t='+Math.random(),function(r){
    			if(r.length !== 0){
    				allGroups = r;
    				initGourp();
    			}else{
    				//错误 TODO
    			}
    		},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			});
    	}else{
    		initGourp();
    	}

    	groupList.on('click','li .icon',function(e){
    		var el = $(this),
    			id = el.attr('data-id');
    		if(el.hasClass('icon-unchecked')){
    			el.removeClass('icon-unchecked').addClass('icon-checked');
    		}else{
    			el.removeClass('icon-checked').addClass('icon-unchecked');
    		}
    		e.stopImmediatePropagation();
    	}).on('click','li',function(e){
    		$(this).find('.icon').trigger('click');
    	})

		return dialog;
	}

	/**
     * 删除群组
     * @param {String} gid 群组id
     * @param {String} [item] 该条信息所在行的dom
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.DeleteGroup = function(gid,item){ //删除群组
		var dialog = Sbox.Warning({
			title:'删除群组',
			message:'<p>您确定要删除该群组吗？</p><p class="tip">删除后该群组信息将彻底删除！</p>',
			closeButton:true,
			callback:function(f){
				if(f){
					var loading = Sbox.Loading('正在删除请稍候');
					$.post('/Group!deleteGroups.action',{
						groupIds:gid
					},function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){
							loading.remove();
							Sbox.Success('删除成功');
							if(item) item.remove();
							setTimeout(function(){
								location.reload();
							},1000)
						}else{
							Sbox.Fail('删除失败');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					})
				}
			}
		})
		return dialog;
	}

	/**
     * 重命名群组
     * @param {String} gid 群组id
     * @param {String} gname 群组名
     * @param {String} [item] 该条信息所在行的dom
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.RenameGroup = function(gid,gname,item){//重命名群组
		var dialog = new Sbox.Views.Window({
			title:'重命名群组',
			body:'<div class="rename-group-dialog"> \
						<div class="field"> \
			    			<div class="label" style=>群组名：</div> \
			    			<div class="ipt"> \
			    				<input type="text" class="ipt-text" value="'+ gname +'" /> \
			    			</div> \
			    			<div class="tips"><span class="error"></span></div> \
			    		</div> \
						<div class="field" style="margin-bottom:0; color:gray; line-height:1.5;"> \
			    			<div class="label" style=></div> \
			    			<div class="ipt"> \
			    				1-20个字符，支持中英文、数字、下划线 \
			    			</div> \
			    		</div> \
		    		</div>',
		   	width:450,
			closeButton:true
		})

		dialog.addButton({
			text:'确定',
			onclick:function(){
				var val = $.trim(ipt.val());
				flag = true;
				ipt.trigger('blur');
				if(flag){
					if(val === gname){
						Sbox.Success('重命名成功');
						dialog.remove();
					}else{
						$.post('/Group!renameGroup.action',{
							groupId:gid,
							groupName:val
						},function(r){
							if(r.code === 701 || r.code === 403){
								Sbox.Login();
							}else if(r.code === 200){
								Sbox.Success('重命名成功');
								dialog.remove();
								setTimeout(function(){
									location.reload();
								},1000)
							}else if(r.code === 302){
								Sbox.Fail('已存在该群组');
							}else{
								Sbox.Fail('重命名失败');
							}
						},'json').error(function(){
							Sbox.Loading().remove();
							Sbox.Error('服务器错误，请稍候重试');
						})
					}
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		var bd = dialog.body,
			ipt = bd.find('input'),
			tips = bd.find('.tips span');
		var flag = true;

		ipt.on('keypress',function(e){
			if(e.keyCode === 13){
				dialog.getButton('确定')[0].trigger('click');
			}
		}).on('focus',function(){
			tips.empty()
		}).on('blur',function(){
			var val = $.trim(ipt.val());
			if(val === ''){
				tips.text('群组名不能为空');
				flag = false;
			}else if(val.length > 20){
				tips.text('长度不能超过20个字符');
				flag = false;
			}else if(!nameReg.test(val)){
				tips.text('支持中英文,数字,下划线');
				flag = false;
			}
		}).focus().select();

		return dialog;
	}
})(jQuery);


(function(){ //转让管理员
	var tpl_changeadmin = '<div class="change-admin-dialog"><div class="field"> \
			        			<div class="label"></div> \
			        			<div class="ipt" style="font-size:14px;"> \
			        				选择接受管理员身份的成员邮箱： \
			        			</div> \
			        			<div class="tips"> \
			        			</div> \
			        		</div> \
			        		<div class="field field-user"> \
			        			<div class="label"></div> \
			        			<div class="ipt"> \
			        				<input type="text" class="ipt-text" id="email" autocomplete="off" /> \
			        				<div class="search-users" style="display:none;" id="searchList"> \
			        					<ul> \
			        					</ul> \
			        				</div> \
			        			</div> \
			        			<div class="tips"> \
			        			</div> \
			        		</div> \
			        		</div>';
	var allUsers = null;
	Sbox.ChangeAdmin = function(){
		var dialog = new Sbox.Views.Window({
			title:'转让管理员',
			body:tpl_changeadmin,
			width:550,
			closeButton:true,
			onHide:function(){
				dialog.remove();
			}
		});
		dialog.addButton({
			text:'确定',
			onclick:function(){
				var val = emailIpt.val(),
					id;
				if(val === ''){
					emailTip.html('<span class="error">请输入邮箱地址</span>');
				}else if(!mailReg.test(val)){
					emailTip.html('<span class="error">邮箱格式不正确</span>');
				}else{
					emailTip.html('<span class="icon icon-loading"></span>');
					if(!allUsers){
						if(etime > 10){
							Sbox.Error('服务器错误，请稍候重试');
							return;
						}
						setTimeout(function(){
							dialog.getButton('确定')[0].trigger('click');	
						},500)
					}else{
						_(allUsers).each(function(u){
							if(u.loginName === val){
								id = u.id;
							}
						})
						if(!id){
							emailTip.html('<span class="error">该用户不存在</span>');
						}else{
							$.post('/User!switchAdmin.action',{
								newAdminId:id
							},function(r){
								if(r.code === 701 || r.code === 403){
									Sbox.Login();
								}else if(r.code === 200){
									dialog.remove();
									Sbox.Alert({
										message:'管理员转让成功，重新登录后生效',
										onHide:function(){
											location.href = '/Login!logout.action'
										}
									});
									
								}else if(r.code === 403){
									emailTip.html('<span class="error">您没有操作权限</span>');
								}else if(r.code === 404){
									emailTip.html('<span class="error">您没有操作权限</span>');
								}else if(r.code === 405){
									emailTip.html('<span class="error">该用户不存在</span>');
								}
							},'json')
						}
						
					}
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		var bd = dialog.body,
			emailIpt = bd.find('#email'),
			emailTip = emailIpt.parent().next(),
			searchList = bd.find('#searchList'),
			ul = searchList.find('ul');
		var KEY_UP = 38,
			KEY_DOWN = 40,
			KEY_ENTER = 13,
			st,
			etime = 0;

		if(allUsers === null){
			getAllUsers();
		}

		emailIpt.on('keydown',function(e){
			if(!allUsers) return;
			var val = this.value,
				users = searchUser(val);

			var lst = '',
				regexp = new RegExp('(' + val + ')','gi');

			if(e.keyCode === KEY_UP){
				var cur = searchList.find('li.hover')
				if(cur[0]){
					if(cur.eq(0).prev()[0]){
						cur.removeClass('hover');
						cur.eq(0).prev().addClass('hover');
						//计算高度，滚动
						var index = searchList.find('li').index(searchList.find('li.hover')),
							scrollTop = searchList.scrollTop();
						if(users.length > 10 && index * 24 < scrollTop){
							setTimeout(function(){
								searchList.scrollTop(24 * (index));
							},20)
							
						}
					}else{
						cur.removeClass('hover');
						searchList.find('li:last').addClass('hover');
						setTimeout(function(){
							searchList.scrollTop(24 * (users.length - 9));
						},20)
					}
				}else{
					searchList.find('li:last').addClass('hover');
				}
				e.preventDefault();
			}else if(e.keyCode === KEY_DOWN){
				var cur = searchList.find('li.hover')
				if(cur[0]){
					if(cur.eq(0).next()[0]){
						cur.removeClass('hover');
						cur.eq(0).next().addClass('hover');
						//计算高度，滚动
						var index = searchList.find('li').index(searchList.find('li.hover')),
							scrollTop = searchList.scrollTop();
						if(users.length > 10 && (index - 10) * 24 >= scrollTop){
							setTimeout(function(){
								searchList.scrollTop(24 * (index - 9));
							},20)
						}
					}else{
						cur.removeClass('hover');
						searchList.find('li:first').addClass('hover');
						setTimeout(function(){
							searchList.scrollTop(0);
						},20)
						
					}
				}else{
					searchList.find('li:first').addClass('hover');
				}


				e.preventDefault();
			}else if(e.keyCode === KEY_ENTER){
				var cur = searchList.find('li.hover');
				if(cur[0]){
					cur.trigger('click');
					$(this).trigger('blur');
				}

				e.preventDefault();
			}

		}).on('focus',function(){
			$(this).trigger('keyup');
			emailTip.empty();
		}).on('blur',function(){
			st = setTimeout(function(){
				searchList.hide();
			},150)
		}).on('keyup',function(e){
			if(!allUsers) return;

			var val = this.value,
				users = searchUser(val);

			var lst = '',
				regexp = new RegExp('(' + val + ')','gi');

			if(e.keyCode === KEY_UP || e.keyCode === KEY_DOWN || e.keyCode === KEY_ENTER) return;

			if(users.length === 0){
				ul.empty();
				searchList.hide();
				return;
			}
			_(users).each(function(u,i){
				lst += '<li class="'+ (i === 0 ? 'hover' : '') +'" data-id="'+ u.id +'" data-email="'+ u.loginName +'">'+ replaceHtml(u.nickName).replace(regexp,'<b>$1</b>') +'<span>&lt;'+ u.loginName.replace(regexp,'<b>$1</b>') +'&gt;</span></li>'
			});
			ul.html(lst);
			if(users.length > 10){
				searchList.height(240);
			}else{
				searchList.height('auto');
			}
			searchList.scrollTop(0)
			searchList.show();
		})

		searchList.on('click','li',function(e){
			var target = $(e.currentTarget)
			emailIpt.val(target.attr('data-email'));
			searchList.hide();
		}).on('mouseenter','li',function(){
			searchList.find('li').removeClass('hover');
			$(this).addClass('hover');
		}).on('mouseleave','li',function(){

		}).on('focus',function(e){
			clearTimeout(st);
			searchList.show();
		}).on('blur',function(e){
			searchList.hide();
		})

		function getAllUsers(){
			$.get('/ShareManager!getVisitors.action?_t='+Math.random(),function(r){
    			if(r.code === 701 || r.code === 403){
    				dialog.hide();
    				Sbox.Login();
    				allUsers = []
    			}else{
	    			allUsers = r;
    			}
    		},'json').error(function(){
    			etime ++;
				if(etime > 10) return;
				setTimeout(function(){
					getAllUsers();
				},500);
			});
		}

		function searchUser(str){
			var filterUsers = [];
			if(str === ''){
				filterUsers = _.filter(allUsers,function(u){
					return u.type !== 'g' && u.id !== userId
				});
				return filterUsers
			}
			_(allUsers).each(function(u){
				if(u.type === 'p'){
					if(u.loginName.toLowerCase().indexOf(str.toLowerCase()) >= 0 || u.nickName.toLowerCase().indexOf(str.toLowerCase()) >= 0){
						if(u.id !== userId)
							filterUsers.push(u);
					}
				}
			})
			return filterUsers;
		}

		return dialog;
	}
})(jQuery);

jQuery(function(){ //设置个性logo
	if(!document.getElementById('settingLogo')) return;

	var module = $('#settingLogo'),
		uploadIpt = module.find('#uploadLogoIpt'),
		uploadTip = module.find('.tips'),
		uploadForm = $('#uploadForm');

		uploadIpt.on('change',function(){
			uploadForm.submit();
		})

		uploadForm.on('submit',function(){
			var val = uploadIpt.val(),
				filetype = /\.(png)$/i;
			if(val === ''){
				uploadTip.html('<span class="error">请选择文件</span>');
				return false;
			}else if(!filetype.test(val)){
				uploadTip.html('<span class="error">不支持的文件格式</span>');
				return false;
			}else{
				uploadTip.html('<span class="icon icon-loading"></span>正在上传,请不要关闭或刷新该页面');
			}
		})

		function uploadLogoCallback(r){
			if(r.code === 701 || r.code === 403){
				Sbox.Login();
			}else if(r.code === 200){
				Sbox.Success('上传成功');
				setTimeout(function(){
					location.reload();
				},1000);
			}else if(r.code === 601){
				uploadTip.html('<span class="error">文件超过大小限制</span>');
			}else{
				uploadTip.html('<span class="error">上传失败</span>');
			}
		}

		window.uploadLogoCallback = uploadLogoCallback;

})

jQuery(function(){ //设置二级域名
	if(!document.getElementById('settingDomain')) return;

	var module = $('#settingDomain'),
		domainIpt = module.find('#domainIpt'),
		domainBtn = module.find('#domainBtn'),
		tips = module.find('.tips'),
		times = module.find('input:hidden').val() * 1,
		reg = /^[a-z0-9][a-z0-9\-]+[a-z0-9]$/i;

	Sbox.placeholder(domainIpt);

	domainIpt.on('keypress',function(e){
		if(e.keyCode === 13){
			domainBtn.trigger('click');
		}
	})
	domainBtn.on('click',function(){
		var val = $.trim(domainIpt.val());
		if(val === '' || val === domainIpt.attr('placeholder')){
			tips.html('<span class="error">请输入二级域名</span>');
			return;
		}else if(val.length < 5 || val.length > 20){
			console.log(val)
			tips.html('<span class="error">请输入5-20个字符</span>');
			return;
		}else if(!reg.test(val)){
			tips.html('<span class="error">支持字母、数字、连接符“-”</span>');
			return;
		}else{
			Sbox.Warning({
				title:'设置二级域名',
				message:'<p>您确定保存该个性域名吗？</p><p class="tip">一共3次修改机会，您还能修改'+ (3 - times - 1) +'次！</p>',
				closeButton:true,
				callback:function(f){
					if(f){
						Sbox.Loading('正在设置请稍候...');
						$.post('/AccountManage!individSetting.action',{
							individDomain:val.toLowerCase()
						},function(r){ 
							Sbox.Loading().remove();
							if(r.code === 701 || r.code === 403){
								Sbox.Login();
							}else if(r.code === 200){
								Sbox.Success('设置成功');
								setTimeout(function(){
									location.reload();
								},1000);
							}else if(r.code === 302){
								tips.html('<span class="error">该域名已被使用</span>');
							}else{
								tips.html('<span class="error">设置失败</span>');
							}

							// 3、前端做的验证包括：1）不能为空；2）5-20字符；3）字母、数字、连接符，不能以-开头和结尾；
							// 4、前端传给后台的数据都是小写，但后台也要做相应异常处理；
							// 5、重名检测；
						},'json');
					}
				}
			})

		}

		 

		

	})

})

jQuery(function(){ //设置二级域名
	if(!document.getElementById('bindDomain')) return;

    var iptDomain = $('#iptDomain'),
    tipDomail = $('#tipDomail'),
    smtDomain = $('#smtDomain'),
    domainReg = /^(http:\/\/|https:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.)*[a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.[a-zA-Z]{2,4}$/;

    smtDomain.on('click',function(){
        var val = $.trim(iptDomain.val());
        if(val === ''){
            tipDomail.html('<span class="error">请输入独立域名</span>');
            return;
        }else if(!domainReg.test(val)){
            tipDomail.html('<span class="error">请输入正确的域名</span>');
            return;
        }else{
            tipDomail.html('<span class="icon icon-loading"></span>');

            $.post('/AccountManage!domainSet.action',{
            	individDomain:val.toLowerCase()
            },function(r){
            	console.log(r);
            	if(r.code === 701 || r.code === 403){
					Sbox.Login();
				}else if(r.code === 200){
					location.href = '/individset3.jsp';
				}else if(r.code === 302){
					tipDomail.html('<span class="error">域名已使用</span>');
				}else{
					tipDomail.html('<span class="error">设置失败</span>');
				}
            },'json')
        }
    })

    iptDomain.on('keypress',function(e){
        if(e.keyCode === 13){
            smtDomain.trigger('click');
        }
    })

})

jQuery(function(){
	if(!document.getElementById('settingIpModule')) return;

	$('#setIpRestrict').on('click',function(){
		Sbox.IpRestrict();
	})
	$('#editIpRestrict').on('click',function(){
		Sbox.IpRestrict();
	})
	$('#cancelIpRestrict').on('click',function(){
		Sbox.Warning({
			title:'取消IP限制',
			message:'<p>您确定要取消IP限制吗？</p>',
			closeButton:true,
			callback:function(f){
				if(f){
					var loading = Sbox.Loading('正在取消请稍候');
					$.post('/IpSetting!cancel.action',function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){
							loading.remove();
							Sbox.Success('取消成功');
							setTimeout(function(){
								location.reload();
							},1000);
						}else{
							loading.remove();
							Sbox.Fail('删除失败');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					})
				}
			}
		})
	})
});

(function($){
	var tpl_setting = '<div class="settingip-dialog"> \
							<div class="ips"> \
								<label>指定可登录IP地址：</label> \
								<input type="text" class="ipt-text" id="ipsIpt" placeholder="多个IP地址请用;分隔" /> \
								<span class="error" id="iptError"></span> \
							</div> \
							<div class="ips"> \
								<label>选择不受IP限制用户范围：</label> \
							</div> \
							<div class="choose-user"> \
								<div class="user-list"> \
									<div class="legend">用户列表</div> \
									<div class="search"> \
										<input type="text" placeholder="输入用户名或邮箱搜索" id="search" autocomplete="off" /> \
										<span class="label icon icon-search" id="searchBtn"></span> \
									</div> \
									<div class="choose-list" id="chooseList"> \
										<div style="text-align:center;padding:20px;"><span class="icon icon-loading"></span>正在加载数据...</div> \
									</div> \
								</div> \
							</div> \
							<div class="selected-user"> \
								<div class="user-list"> \
									<div class="legend"> \
									已添加成员(<span id="hasAdded">0</span>)  \
									<a href="javascript:;" class="clear" id="clearSelectedUser">清空列表</a> \
									</div> \
									<div class="selected-list" id="selectedList"> \
										<ul> \
										</ul> \
									</div> \
								</div> \
							</div> \
						</div>';

	Sbox.IpRestrict = function(){
		var allGroups = null,
			allUser,
			selectedUser = [];

		var dialog = new Sbox.Views.Window({
			title:'限制IP设置',
			body:tpl_setting,
			width:692,
			closeButton:true,
			onHide:function(){
				dialog.remove();
			}
		});
		dialog.addButton({
			text:'确定',
			onclick:function(){
				flag = true;
				ipsIpt.trigger('blur');
				if(flag){
					var ids = []
					_(selectedUser).each(function(user){
						ids.push(user.id);
					})
					Sbox.Loading('正在设置请稍候...');
					$.post('/IpSetting!setIpSet.action',{ //TODO
						ips:$.trim(ipsIpt.val()),
						userIds:ids.join(',')
					},function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){
							dialog.remove();
							Sbox.Loading().remove();
							Sbox.Success('设置成功');
							setTimeout(function(){
								location.reload();
							},1000);
						}else if(r.code === 302){
							Sbox.Fail('设置成功');
						}else{
							Sbox.Fail('设置成功');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					})
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		var bd = dialog.body,
			ipsIpt = $('#ipsIpt'),
			iptError = $('#iptError'),
			chooseList = $('#chooseList'),
			selectedList = $('#selectedList ul'),
			search = $('#search'),
			searchBtn = $('#searchBtn'),
			hasAdded = $('#hasAdded'),
			clearSelectedUser = $('#clearSelectedUser');
		var flag = true;
		Sbox.placeholder(search);
		Sbox.placeholder(ipsIpt);
		if(allGroups === null){
			$.get('/Group!getGroupsContainMember.action?_t='+Math.random(),function(r){
				if(r.length !== 0){
					allGroups = r;
					allUser = allGroups[0].members;
					initUsers();
				}else{
					//错误 TODO
				}
			},'json').error(function(){
				Sbox.Loading().remove();
				Sbox.Error('服务器错误，请稍候重试');
			});
		}else{
			initUsers();
		}
		//初始化所有群组用户
		function initUsers(){
			var glist = ''
			_(allGroups).each(function(group,i){
				var member = group.members,
					ulist = '';
				if(member){
					_(member).each(function(user){
						ulist += '<li title="'+ user.nickName + '<' + user.loginName + '>" data-id="'+ user.id +'">'+ replaceHtml(user.nickName) +'<span class="u-email">&lt;'+ user.loginName +'&gt;</span></li>'
					})
				}
				glist += '<dl> \
	                        <dt data-id="'+group.id+'" title="'+group.group_name+'('+ group.members.length +')"> \
	                            <span class="icon icon-gclose"></span><span style="width:200px;height:26px;overflow:hidden;">'+ replaceHtml(group.group_name) +' ('+ group.members.length +')</span> \
	                        </dt> \
	                        <dd style="display:none;"> \
	                            <ul>'+ ulist +'</ul>\
	                        </dd> \
	                    </dl>';
			})
			chooseList.html(glist);
		}

		function initselectedUsers(){
			selectedList.empty();
			_(selectedUser).each(function(user){
				var li = '<li data-id="'+ user.id +'"> \
                        '+ replaceHtml(user.nickName) +'<span class="u-email">&lt;'+ user.loginName +'&gt;</span> \
                        <a href="javascript:;" class="remove" title="移除"><span class="icon icon-cancle2"></span></a> \
                    </li>'
	            selectedList.append(li);
		    	selectedList.scrollTop(9999);
			});
		    hasAdded.text(selectedUser.length);
		}

		$.get('/IpSetting!getIpSetUsers.action?_t=' + Math.random(),function(r){
			if(r.code === 200){
				selectedUser = r.users;
				ipsIpt.val(r.ips.join(';'));
				initselectedUsers();
			}else{
				Sbox.Loading().remove();
				dialog.remove();
				Sbox.Error('服务器错误，请稍候重试');
			}
		},'json').error(function(){
			Sbox.Loading().remove();
			dialog.remove();
			Sbox.Error('服务器错误，请稍候重试');
		})

		ipsIpt.on('keypress',function(e){
    		if(e.keyCode === 13){
    			dialog.getButton('确定')[0].trigger('click');
    		}
    	}).on('focus',function(){
    		iptError.hide();
    	}).on('blur',function(){
    		var val = $.trim(ipsIpt.val()),
    			ipReg = /^(25[0-5]|2[0-4][0-9]|[1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
			if(val === ''){
				iptError.text('请输入IP地址').show();
				flag = false;
			}else{
				val = val.split(';');
				for(var i = 0, len = val.length; i < len; i++){
					if($.trim(val[i])!=='' && !ipReg.test($.trim(val[i]))){
						flag = false;
						iptError.text('IP格式不正确').show();
						break;
					}
				}
			}
    	})

		chooseList.on('mouseenter','li,dt',function(){
    		$(this).addClass('hover');
    	}).on('mouseleave','li,dt',function(){
    		$(this).removeClass('hover');
    	}).on('click','dt .icon',function(e){
    		var el = $(this),
    			ulist = el.parent().next();
    		if(el.hasClass('icon-gopen')){
    			ulist.hide();
    			el.removeClass('icon-gopen').addClass('icon-gclose');
    		}else if(el.hasClass('icon-gclose')){
    			ulist.show();
    			el.removeClass('icon-gclose').addClass('icon-gopen');
    		}
    		e.stopImmediatePropagation();
    	}).on('click','dt',function(e){
    		var gid = $(this).attr('data-id');
    		var users = getUsersByGroup(gid);
    		_(users).each(function(user){
    			addUser(user);
    		})
    	}).on('click','li',function(){
    		var id = $(this).attr('data-id');
    		var user = getUser(id);
    		addUser(user);
    	})

    	selectedList.on('click','li',function(e){
    		var curTarget = $(e.target || e.srcElement),
    			el = $(this),
    			id = el.attr('data-id');
    		if(curTarget.is('.icon')){
    			el.remove();
    			removeUser(id);
    		}
    	})
    	clearSelectedUser.on('click',function(){
    		selectedList.find('.icon-cancle2').trigger('click');
    	});

    	search.on('keyup',function(){
    		var str = $(this).val(),
				users = searchUser(str),
				regexp = new RegExp('(' + str + ')','gi');
			if(str === '' || str === $(this).attr('placeholder')){
				chooseList.find('dl').show();
				chooseList.find('.search-list').hide();
			}else{
				if(!chooseList.find('.search-list')[0]){
					chooseList.append('<ul class="search-list"></ul>');
				}
				var searchList = chooseList.find('.search-list').show(),
					list = ''
				_(users).each(function(user){
					list += '<li title="'+ user.nickName +'<'+ user.loginName +'>" data-id="'+ user.id +'">'+ replaceHtml(user.nickName).replace(regexp,'<b>$1</b>') +'<span class="u-email">&lt;'+ user.loginName.replace(regexp,'<b>$1</b>') +'&gt;</span></li>';
				})
				searchList.html(list);
				chooseList.find('dl').hide();
			}
    	})
		
		searchBtn.on('click',function(){
			search.trigger('keyup');
		})

    	function hasSelected(user){//是否已经选择
			var flag = false;
			_(selectedUser).each(function(u){
				if(u.id == user.id){
					flag = true;
					return;
				}
			})
			return flag;
    	}

    	function hasGroupName(name){//检查组名是否已经存在
    		var flag = false;
    		_(allGroups).each(function(group){
    			if(group.group_name.toLowerCase() === name.toLowerCase()) flag = true;
    		})
    		return flag;
    	}

    	function getUser(id){ //通过id获取用户
    		var user;
    		_(allUser).each(function(u){
    			if(u.id == id) user = u;
    		})
    		return user;
    	}
    	//添加用户
    	function addUser(user){
    		if(hasSelected(user)) return;
    		selectedUser.push(user);
    		var li = '<li data-id="'+ user.id +'"> \
                        '+ replaceHtml(user.nickName) +'<span class="u-email">&lt;'+ user.loginName +'&gt;</span> \
                        <a href="javascript:;" class="remove" title="移除"><span class="icon icon-cancle2"></span></a> \
                    </li>'
            selectedList.append(li);
	    	selectedList.scrollTop(9999);
	    	hasAdded.text(selectedUser.length);
    	}
    	//移除用户
    	function removeUser(id){
    		_(selectedUser).each(function(u,i){
				if(u.id == id){
					selectedUser.splice(i,1);
					return;
				}
			})
			hasAdded.text(selectedUser.length);
    	}
    	//获得某个组所有的用户
    	function getUsersByGroup(gid){
    		var users;
    		_(allGroups).each(function(group){
    			if(group.id == gid) users = group.members;
    		})
    		return users;
    	}
    	//搜索用户
    	function searchUser(str){
			var filterUsers = [];
			_(allUser).each(function(u){
				if(u.nickName.toLowerCase().indexOf(str.toLowerCase()) >= 0 || u.loginName.toLowerCase().indexOf(str.toLowerCase()) >= 0){
					filterUsers.push(u);
				}
			})
			return filterUsers;
    	}

		return dialog;

	}
})(jQuery);

jQuery(function(){ //设备管理
	if(!document.getElementById('manageEquipment')) return;

	var manageEquipment = $('#manageEquipment'),
		eList = manageEquipment.find("table");
	eList.on('click','.close',function(){
		var id = $(this).attr('data-id');
		Sbox.Warning({
			title:'禁用设备',
			message:'<p>您确定要禁用该设备吗？</p><p class="tip">禁用后该设备将无法登录网盘！</p>',
			closeButton:true,
			callback:function(f){
				if(f){
					var loading = Sbox.Loading('正在禁用请稍候');
					$.post('/DeviceManage!disabledDevice.action',{
						mac:id
					},function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){
							loading.remove();
							Sbox.Success('禁用成功');
							setTimeout(function(){
								location.reload();
							},1000)
						}else{
							Sbox.Fail('禁用失败');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					})
				}
			}
		})
	}).on('click','.open',function(){
		var id = $(this).attr('data-id');
		var loading = Sbox.Loading('正在启用请稍候');
		$.post('/DeviceManage!enabledDevice.action',{
			mac:id
		},function(r){
			if(r.code === 701 || r.code === 403){
				Sbox.Login();
			}else if(r.code === 200){
				loading.remove();
				Sbox.Success('启用成功');
				setTimeout(function(){
					location.reload();
				},1000)
			}else{
				Sbox.Fail('启用失败');
			}
		},'json').error(function(){
			Sbox.Loading().remove();
			Sbox.Error('服务器错误，请稍候重试');
		})
	})
});
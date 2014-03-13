 /**
 * @fileOverview 用户管理页面使用
 * @author angelscat@vip.qq.com
 */

(function($){ //添加用户
	var tpl_adduser = '<form><div class="adduser-dialog"> \
			        		<div class="field" data-type="username"> \
			        			<div class="label">用户名：</div> \
			        			<div class="ipt"> \
			        				<input type="text" class="ipt-text" name="nickName" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip">* 建议填写真实姓名</span> \
			        			</div> \
			        		</div> \
			        		<div class="field" data-type="email"> \
			        			<div class="label">登录邮箱：</div> \
			        			<div class="ipt"> \
			        				<input type="text" class="ipt-text" name="email" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip">* 请填写真实邮箱</span> \
			        			</div> \
			        		</div> \
			        		<div class="field" data-type="password"> \
			        			<div class="label">初始密码：</div> \
			        			<div class="ipt"> \
			        				<input type="password" class="ipt-text" name="password" onpaste="return false;" /> \
			        			</div> \
			        			<div class="tips"> \
			        				<span class="tip">* 请输入6-16个字符</span> \
			        			</div> \
			        		</div> \
			        		<div class="field usage" data-type="usage"> \
			        			<div class="label">分配空间：</div> \
			        			<div class="ipt"> \
			        				<input type="text" class="ipt-text" value="" name="settingSize" /> GB \
			        			</div> \
			        			<div class="tips"> \
			        			<span class="tip">* 剩余可分配空间：<em id="freeSpace"><span class="icon icon-loading"></span></em></span> \
			        			</div> \
			        		</div> \
			        		<div class="field" style="margin-bottom:-30px; margin-top:-10px;"> \
			        			<div class="label"></div> \
			        			<div class="ipt"> \
			        				<span class="error" id="serverError"></span> \
			        			</div> \
			        		</div> \
			        	</div></form>';
	/**
     * 添加用户
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.AddUser = function(){
		var dialog = new Sbox.Views.Window({
			title:'添加新用户',
			body:tpl_adduser,
			width:560,
			closeButton:true
		})

		dialog.addButton({
			text:'确定',
			onclick:function(){
				flag = true;
				var bd = dialog.body,	
					ipt = bd.find('input');
				ipt.blur();
				if(flag){
					$.post('/User!add.action',dialog.body.find('form').serialize(),function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){
							Sbox.Success('创建成功');
							dialog.remove();
							setTimeout(function(){
								location.reload();
							},1000)
						}else if(r.code === 302){
							Sbox.Fail('该用户名已存在，建议使用“姓名_部门”命名');
						}else if(r.code === 303){
							Sbox.Fail('创建失败，登录邮箱已使用');
						}else if(r.code === 503){
							Sbox.Fail('创建失败，剩余空间不足');
						}else{
							Sbox.Fail('创建失败');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					});
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
			fields = bd.find('.field'),
			freeSpace = bd.find('#freeSpace'),
			serverError = bd.find('#serverError'),
			flag = true;
		var free;

		function getFreeSpace(){
			$.get('/User!freeSpace.action?_t='+Math.random(),function(r){
				if(r.code === 701 || r.code === 403){
					Sbox.Login();
				}else if(r.code === 200){
					free = Math.floor(r.freeSpace / 1024 / 1024 / 1024 * 100) / 100;
					freeSpace.html(free + ' GB');
				}else{
					freeSpace.html('<span class="error">获取失败，<a href="javascript:;">重新获取</a></span>');
					freeSpace.find('a').click(function(){
						freeSpace.html('<span class="icon icon-loading"></span>');
						getFreeSpace();
					})
				}
			},'json').error(function(){
				freeSpace.html('<span class="error">获取失败，<a href="javascript:;">重新获取</a></span>');
				freeSpace.find('a').click(function(){
					freeSpace.html('<span class="icon icon-loading"></span>');
					getFreeSpace();
				})
			})
		}
		getFreeSpace();

		fields.each(function(i,field){
			var field = $(field),
				type = field.attr('data-type'),
				ipt = field.find("input"),
				tips = field.find('.tips');
			ipt.on('blur',function(){
				var _this = $(this);
				switch(type){
					case 'username': 
						if(_this.val() === ''){
							showError('* 用户名不能为空');
						}else if(_this.val().length > 10){
							showError('* 长度不能超过10个字符');
						}else if(!nameReg.test(_this.val())){
							showError('* 支持中英文、数字、下划线');
						}else{
							showRight();
						}
						break;
					case 'email': 
						_this.val($.trim(_this.val()));
						if(_this.val() === ''){
							showError('* 邮箱不能为空');
						}else if(!mailReg.test(_this.val())){
							showError('* 邮箱格式不正确');
						}else{
							showRight();
						}
						break;
					case 'password':
						if(_this.val() === ''){
							showError('* 密码不能为空');
						}else if(_this.val().length > 16 || _this.val().length < 6){
							showError('* 长度为6-16个字符');
						}else{
							showRight();
						}
						break;
					case 'usage':
						if(!$.isNumeric(_this.val()) || _this.val()*1 <=0){
							showError('* 请输入数字');
						}else if(free && _this.val() * 1 > free){
							showError('* 剩余空间不足');
						}else{
							showRight();
						}
						break;
				}
			}).on('keypress',function(e){
				if(e.keyCode === 13){
					dialog.getButton('确定')[0].trigger('click');
				}
			}).on('focus',function(){
				showRight();
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
		return dialog;
	}
})(jQuery);

(function($){ //删除用户
	/**
     * 删除用户
     * @param {String} userId 用户id
     * @param {String} item 该条信息所在行的dom
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.DeleteUser = function(userId,item){
		var username = item.find('.file-name').text(),
			userspace = item.attr('data-usedspace');
		var tpl_deluser = '<p>您确定要删除 '+ username +' 吗？</p> \
							<p class="tip">该用户所有文件容量 '+ formatbytes(userspace) +'</p> \
							<p style="font-size:12px; margin:15px 0 5px 0;"><input type="radio" checked="checked" name="deltype" value="1" id="toAdmin" /><label for="toAdmin" style="vertical-align:middle;"> 把文件转移给管理员</label></p> \
							<p style="font-size:12px;"><input type="radio" name="deltype" value="0" id="delAll" /><label for="delAll" style="vertical-align:middle;"> 删除该用户所有文件</label></p>'
		var dialog = Sbox.Warning({
			title:'删除用户',
			message:tpl_deluser,
			closeButton:true,
			callback:function(f){
				if(f){
					var loading = Sbox.Loading('正在删除请稍候');
					//console.log(userId)
					var deltype = dialog.body.find('input:radio:checked').val();
					//console.log(deltype);
					$.post('/User!delete.action',{
						id:userId,
						deleteWay:deltype
					},function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){
							loading.remove();
							Sbox.Success('删除成功');
							item.remove();
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
})(jQuery);

(function($){ //修改用户空间大小
	var tpl_setusage = '<div class="setsize-dialog"> \
				    		<div class="field"> \
				    			<div class="label">分配空间大小：</div> \
				    			<div class="ipt"> \
				    				<input type="text" class="ipt-text" /> GB \
				    			</div> \
				    			<div class="tips"> \
				    				<span class="tip"></span> \
				    			</div> \
				    		</div> \
				    		<div class="field" style="margin-bottom:0; color:gray; line-height:1.5;"> \
				    			<div class="label"></div> \
				    			<div class="ipt">该用户已使用空间：<em id="usedSpace"></em> <br />剩余可分配空间：<em id="freeSpace"><span class="icon icon-loading"></span></em></div> \
				    		</div> \
				    	</div>'
	/**
     * 修改用户空间大小
     * @param {String} id 用户id
     * @param {String} item 该条信息所在行的dom
     * @return {Sbox.Views.Window} 返回一个window实例，可以做进一步的操作
     */
	Sbox.SetUsage = function(id,item){
		var dialog = new Sbox.Views.Window({
			title:'修改用户空间',
			body:tpl_setusage,
			width:500,
			closeButton:true
		})

		var bd = dialog.body,
			usedSpace = bd.find('#usedSpace'),
			freeSpace = bd.find('#freeSpace');
		var free,flag = true;

		usedSpace.html(formatbytes(item.attr('data-usedSpace')));

		function getFreeSpace(){
			$.get('/User!freeSpace.action?_t='+Math.random(),function(r){
				if(r.code === 701 || r.code === 403){
					Sbox.Login();
				}else if(r.code === 200){
					free = Math.floor((r.freeSpace + item.attr('data-size') * 1) / 1024 / 1024 / 1024 * 100) / 100;
					freeSpace.html(free + ' GB');
				}else{
					freeSpace.html('<span class="error">获取失败，<a href="javascript:;">重新获取</a></span>');
					freeSpace.find('a').click(function(){
						freeSpace.html('<span class="icon icon-loading"></span>');
						getFreeSpace();
					})
				}
			},'json').error(function(){
				freeSpace.html('<span class="error">获取失败，<a href="javascript:;">重新获取</a></span>');
				freeSpace.find('a').click(function(){
					freeSpace.html('<span class="icon icon-loading"></span>');
					getFreeSpace();
				})
			})
		}
		getFreeSpace();

		dialog.addButton({
			text:'确定',
			onclick:function(){
				var ipt = bd.find('input'),
					val = ipt.val();
				flag = true;
				ipt.trigger('blur');
				if(flag){
					$.post('/User!updateSize.action',{
						settingSize:val,
						id:id
					},function(r){
						if(r.code === 701 || r.code === 403){
							Sbox.Login();
						}else if(r.code === 200){
							Sbox.Success('设置成功');
							dialog.remove();
							setTimeout(function(){
								location.reload();
							},1000)
						}else if(r.code === 602){
							Sbox.Fail('分配空间小于用户已使用空间');
						}else if(r.code === 302){
							Sbox.Fail('剩余空间不足');
						}else{
							Sbox.Fail('设置失败');
						}
					},'json').error(function(){
						Sbox.Loading().remove();
						Sbox.Error('服务器错误，请稍候重试');
					});
				}
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		bd.find('input').on('keypress',function(e){
			if(e.keyCode === 13){
				dialog.getButton('确定')[0].trigger('click');
			}
		}).on('blur',function(){
			var val = $(this).val(),
				tips = $(this).parent().next();
			if(!$.isNumeric(val) || val*1 <=0){
				if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
				tips.find('.error').text('* 必须是大于0的数字').show();
				tips.find('.tip').hide();
				flag = false;
			}else if(free && val*1 > free){
				if(!tips.find('.error')[0]) tips.append('<span class="error"></span>');
				tips.find('.error').text('* 剩余空间不足').show();
				tips.find('.tip').hide();
				flag = false;
			}else{
				tips.find('.error').hide();
				tips.find('.tip').show();
			}
		}).on('focus',function(){
			var tips = $(this).parent().next();
			tips.find('.error').hide();
			tips.find('.tip').show();
		})
	}
})(jQuery);

(function($){ //批量导入
	/**
     * 批量导入用户
     */
	Sbox.ImportUser = function(){
		var tpl_importuser = '<div class="choose-file"> \
								<form id="importFm" action="/addUsers/" method="post" target="addUserIfm" enctype="multipart/form-data"><input type="file" size="1" name="Filedata" id="importExcel" hidefocus="true" accept="application/msexcel" /></form> \
								<label>选择导入文件：</label><input type="text" readonly="readonly" class="ipt-text" /><a href="javascript:;" class="btn btn24 btn24-gray">浏览</a> \
								</div> \
								<p class="tips">支持文件格式：xls、xlsx、csv，1M以内，一次最多导入100个用户。<br /> <a href="/GetFile!getImportExecl.action">下载模板</a></p> \
								<p class="msg"></p> \
								<iframe src="javascript:false" id="addUserIfm" name="addUserIfm" style="display:none;"></iframe>'
		var dialog = new Sbox.Views.Window({
			title:'批量导入用户',
			body:tpl_importuser,
			width:500,
			closeButton:true
		}).addStyle('import-user-dialog')
		var loading,
			bd = dialog.body,
			importFm = bd.find('#importFm'),
			fileIpt = importFm.find('input').css('opacity',0),
			chooseFile = bd.find('.choose-file'),
			msg = bd.find('.msg');

		dialog.addButton({
			text:'确定',
			onclick:function(){
				var val = fileIpt.val(),
					filetype = /\.(xls|xlsx|csv)$/i;
				if(val === ''){
					msg.html('<span class="error">请选择文件</span>');
					return;
				}else if(!filetype.test(val)){
					msg.html('<span class="error">不支持的文件格式</span>');
					return;
				}else{
					msg.empty();
				}
				importFm.submit();  //ie bug http://www.oschina.net/question/110264_66486
				dialog.hide();
				loading = Sbox.Loading('正在导入，请不要关闭或刷新该页面');
			},
			className:'confirm'
		}).addButton({
			text:'取消',
			onclick:function(){
				dialog.remove();
			}
		})

		// chooseFile.on('click','input,a',function(){
		// 	fileIpt.trigger('click');
		// })

		fileIpt.on('change',function(){
			chooseFile.find('input.ipt-text').val($(this).val());
		})

		function importUserCallback(params){
			loading.remove();

			if(params && params.code === 200){
				dialog.remove();
				Sbox.Alert({
					title:'批量导入用户完成',
					message:'<div class="import-success" id="inportSuccess"><p>批量导入用户完成</p>'+ (params.failNumber > 0 ? '<p>有 '+ (params.allCount - params.successNumber) +' 个用户导入失败。<a href="javascript:;">查看失败详情</a></p>' : '') +'</div>',
					width:540,
					onHide:function(){
						setTimeout(function(){
							location.reload();
						},20)
					}
				})

				$('#inportSuccess').on('click','a',function(){
					var detail = '',
						errorMsg = {
							302:'用户名重名',
							303:'邮箱已存在',
							304:'用户名额不足',
							305:'邮箱格式不正确',
							306:'用户名不合法',
							307:'密码不合法',
							309:'空间大小不合法',
							503:'剩余空间不足'
						}
					detail += '<div class="ec"><table>';
					detail += '<colgroup><col width="20%" /><col width="40" /><col width="30%" /></colgroup>';
					detail += '<tr><th>用户名</th><th>邮箱</th><th>失败原因</th></tr>';
					var isEnough = true;
					_(params.result).each(function(u){
						if(u.code !== 200 && u.code !== 304){
							detail += '<tr><td>'+ u.nickName.replace('<','&lt;').replace('>','&gt;') +'</td><td>'+ u.email.replace('<','&lt;').replace('>','&gt;') +'</td><td>'+ errorMsg[u.code] +'</td></tr>'
						}
						if(u.code === 304 && params.failNumber <= params.allCount - params.successNumber){
							isEnough = false;
							detail += '<tr style="border:0;"><td colspan="3" style="text-align:center;">用户名额不足，最后'+ (params.allCount - params.failNumber - params.successNumber + 1) +'个用户导入失败</td></tr>'
						}
					});

					if(isEnough && params.successNumber + params.failNumber >= 100 && params.successNumber + params.failNumber < params.allCount){
						detail += '<tr style="border:0;"><td colspan="3" style="text-align:center;">每次最多导入100个用户，余下用户均导入失败</td></tr>'
					}
					detail += '</div></table>';
					var errDia = new Sbox.Views.Window({
						title:'导入失败详情',
						body:detail,
						width:540,
						closeButton:true,
						onHide:function(){
							errDia.remove();
						}
					}).addStyle('import-error-detail')
					.addButton({
						text:'确定',
						onclick:function(){
							errDia.hide();
						},
						className:'confirm'
					})
				})
			}else if(params && params.code === 308){
				dialog.show();
				msg.html('<span class="error">文件超过大小，请保持1M以内</span>');
				//Sbox.Fail('文件超过大小，请保持1M以内',3);
			}else{
				dialog.show();
				msg.html('<span class="error">导入失败，请检查文件内容是否符合要求</span>');
			}
		}

		window.importUserCallback = importUserCallback;

		return dialog;
	}
})(jQuery);

jQuery(function(){
	var mainOp = $('#mainOp');
	mainOp.on('click','.add',function(e){
		var target = $(this);
		if(target.hasClass('btn32-disabled')) return;
		Sbox.AddUser();
	}).on('click','.import',function(e){
		var target = $(this);
		if(target.hasClass('btn32-disabled')) return;
		Sbox.ImportUser();
	});

	var userList = $('#userList'),
		li = userList.find('.list-item');
	userList.on('mouseenter','.list-item',function(){
		$(this).addClass('hover');
	}).on('mouseleave','.list-item',function(){
		$(this).removeClass('hover');
	});

	li.each(function(i,v){
		var item = $(v),
			id = item.attr('data-id'),
			email = item.attr('data-email');
		$(v).on('click','.reset',function(){
			Sbox.Confirm({
				message:'确认重置该用户的密码？',
				callback:function(f){
					if(f){
						$.post('/User!resetPassword.action',{
							loginName:email
						},function(r){
							if(r.code === 701 || r.code === 403){
								Sbox.Login();
							}else if(r.code === 200){
								Sbox.Alert('重置密码成功，新密码已发送至该用户邮箱！');
								dialog.remove();
							}else{
								Sbox.Fail('密码重置失败');
							}
						},'json').error(function(){
							Sbox.Loading().remove();
							Sbox.Error('服务器错误，请稍候重试');
						});
					}
				}
			})
		}).on('click','.edit',function(){
			Sbox.SetUsage(id,item);
			return false;
		}).on('click','.del',function(){
			Sbox.DeleteUser(id,item)
			return false;
		})
	})
});
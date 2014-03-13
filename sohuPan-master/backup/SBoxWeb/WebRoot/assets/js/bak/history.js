/**
 * @fileOverview 历史版本页面使用
 * @author angelscat@vip.qq.com
 */


jQuery(function(){
	var mainOp = $('#mainOp');
	mainOp.on('click','.uploadnew',function(){
		Sbox.Upload(resourceId,'update');
	});

	var fileList = $('#fileList'),
		li = fileList.find('.list-item');
	fileList.on('mouseenter','.list-item',function(){
		$(this).addClass('hover');
	}).on('mouseleave','.list-item',function(){
		$(this).removeClass('hover');
	});

	var imgs = [],
		index;

	li.each(function(i,v){
		var item = $(v),
			version = item.attr('data-version'),
			id = item.attr('data-id'),
			name = item.attr('data-name'),
			size = item.attr('data-size') * 1,
			key = item.attr('data-key'),
			type = getFileType(name);

		if(isPreviewImgFile(name,size)){
			imgs.push({
				id:id,
				name:name,
				size:size,
				key:key
			})
			item.find('.file-name a, .file-icon a').attr('href','javascript:;');
		}else if(!previewFileType.test(type)){
			item.find('.file-name a, .file-icon a').attr('href','javascript:;');
		}

		item.on('click','.file-name a, .file-icon a',function(){
			if(isPreviewImgFile(name,size)){
				for(var i = 0, len = imgs.lenght; i < len; i++){
					if(id === imgs[i].id){
						index = i;
						break;
					}
				}
				if(!window.imgPreviewHandle){
					window.imgPreviewHandle = new Sbox.Views.ImgPreview({
						index:index,
						imgs:imgs
					})
				}else{
					window.imgPreviewHandle.rebuild({
						index:index,
						imgs:imgs
					})
				}
			}
		}).on('click','.replace',function(){
			Sbox.Warning({
				title:'替换版本',
				message:'确认替换为最新版本？',
				callback:function(f){
					if(f){
						$.post('/FileVersion!switchVersion.action',{
							resourceId:resourceId,
							version:version
						},function(r){
							if(r.code === 701){
								Sbox.Login();
							}else if(r.code === 200){
								Sbox.Success('版本替换成功');
								setTimeout(function(){
									location.reload();
								},1000)
							}else{
								Sbox.Fail('版本替换失败')
							}
						},'json').error(function(){
							Sbox.Loading().remove();
							Sbox.Error('服务器错误，请稍候重试');
						})
					}
				}
			})
		}).on('click','.download',function(){
			//alert('下载')
		}).on('click','.del',function(){
			Sbox.Warning({
				title:'删除版本',
				message:'确定删除当前版本？',
				callback:function(f){
					if(f){
						$.post('/DeleteVersion!deleteVersion.action',{
							resourceId:resourceId,
							versionNumber:version
						},function(r){
							if(r.code === 701){
								Sbox.Login();
							}else if(r.code === 200){
								Sbox.Success('版本删除成功');
								item.remove();
								setTimeout(function(){
									location.reload();
								},1000)
							}else{
								Sbox.Fail('版本删除失败')
							}
						},'json').error(function(){
							Sbox.Loading().remove();
							Sbox.Error('服务器错误，请稍候重试');
						})
					}
				}
			})
		})

	})
});
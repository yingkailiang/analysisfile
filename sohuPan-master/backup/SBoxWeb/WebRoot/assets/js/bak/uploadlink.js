jQuery(function(){
	if(!document.getElementById('anonymousUploadMod')) return;
	var debugMode = location.hash.indexOf('debugmode') >= 0
	var settings = {
		flash_url : '/assets/swf/swfu-v2.swf',
		upload_url: '/AnonymousWholeUpload!sendFile.action',
		post_params: {

		},
		file_size_limit : '300 MB',
		file_types : '*.*',
		file_types_description : 'All Files',
		file_upload_limit : 100,
		file_queue_limit : 0,
		custom_settings : {
		},
		debug: debugMode,

		// Button settings
		button_image_url: STATIC_DOMAIN +'/img/upload-v2.png',
		button_width: "97",
		button_height: "31",
		button_placeholder_id: "uploadHandler",
		button_cursor:-2,

		// The event handler functions are defined in handlers.js
		swfupload_loaded_handler : swfuploadLoaded,
		file_dialog_start_handler : resetTitle,
		file_queued_handler : fileQueued,
		file_queue_error_handler : fileQueueError,
		file_dialog_complete_handler : fileDialogComplete,
		upload_start_handler : uploadStart,
		upload_progress_handler : uploadProgress,
		upload_error_handler : uploadError,
		upload_success_handler : uploadSuccess,
		upload_complete_handler : uploadComplete,
		queue_complete_handler : queueComplete	// Queue plugin event
	}

	var uploadContainer = $('#uploadContainer'),
		uploadBtn = $('#uploadBtn'),
		uploadDisabled = $('#uploadDisabled'),
		uploadHandler,
		passwordMod = $('#passwordMod'),
		uploadTipMod = $('#uploadTipMod'),
		password = $('#password'),
		passwordTip = $('#passwordTip'),
		passwordBtn = $('#passwordBtn'),
		uploadList = $('#uploadList'),
		uploadBody = $('#uploadBody'),
		uploadPassWord;

	// uploadDisabled.on('click',function(){
	// 	Sbox.Error('请先输入上传密码');
	// })

	password.on('keypress',function(e){
		if(e.keyCode === 13){
			passwordBtn.trigger('click')
		}
	})
	passwordBtn.on('click',function(){
		var val = password.val();
		if(val === ''){
			passwordTip.html('<span class="error">请输入上传密码</span>');
		}else{ //TODO ajax
			passwordTip.html('<span class="icon icon-loading"></span>');
			$.post('/CheckShareDirPassword!share.action',{
				resourceId:uploadLinkInfo.resourceId,
				userId:uploadLinkInfo.userId,
				sign:uploadLinkInfo.sign,
				date:uploadLinkInfo.date,
				password:val,
				shareType:2
			},function(r){
				if(r.code === 200){
					passwordTip.empty();
					uploadPassWord = val;
					
					passwordMod.hide();
					uploadTipMod.show();

					uploadDisabled.hide();
					if(checkFlash()){
						uploadHandler = new SWFUpload(settings);
					}else{
						uploadBtn.html('<span style="color:#E65455;">上传需要flash支持，请下载安装后重试，<a target="_blank" href="http://get.adobe.com/cn/flashplayer/">下载地址</a></span>');
					}

				}else{
					passwordTip.html('<span class="error">密码错误</span>');
				}
			},'json')
		}
	})



	function resetTitle(){
		if(jQuery.browser.msie){
			document.title = WEBSITE_NAME;
		}
	}
	//flash callbacks
	function swfuploadLoaded(){
		resetTitle();
	}
	function fileQueued(file){
		var _this = this;
		file.name = decodeURIComponent(file.name);
		this.addFileParam(file.id,'resourceId',uploadLinkInfo.resourceId);
		this.addFileParam(file.id,'length',file.size);
		this.addFileParam(file.id,'sign',uploadLinkInfo.sign);
		this.addFileParam(file.id,'date',uploadLinkInfo.date);
		this.addFileParam(file.id,'password',uploadPassWord);

		if(!uploadBody.find('ul')[0]){
			uploadTipMod.hide();
			uploadList.show();
			uploadBody.append('<ul>');
		}
		var ul = uploadBody.find('ul');
		var li = '<li id="upload_'+ file.id +'"> \
                    <div class="progress-bg"></div> \
                    <span class="f-name" title="'+ file.name +'">'+ file.name +'</span> \
                    <span class="f-percent">等待上传</span> \
                    <span class="f-size">'+ formatbytes(file.size) +'</span> \
                    <span class="f-op"> \
                        <a class="cancle" href="javascript:;"><span class="icon icon-cancle2"></span></a> &nbsp; \
                    </span> \
                </li>';
		li = $(li);
		ul.append(li);
		var progress = li.find('.progress-bg'),
			percent = li.find('.f-percent'),
			oprator = li.find('.f-op');

		var notAllowFileType = /\.(exe|js|com|bat|dll|vbs|ocx)$/i
		if(notAllowFileType.test(file.name)){
			_this.cancelUpload(file.id,false);
			progress.remove();
			oprator.empty();
			percent.html('<span class="fail">不支持的文件格式</span>');
		}

		li.on('click','.cancle',function(){
			_this.cancelUpload(file.id);
			progress.remove();
			oprator.empty();
			percent.html('<span class="fail">取消上传</span>');
		})

		window.onbeforeunload = function(){
			return '您有文件正在上传，继续操作会中断上传，要继续吗？'
		}
	}
	function fileQueueError(file,errorCode,message){
		if(errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED){
			Sbox.Error('同时上传文件不得超过100个');
			return;
		}
		
		if(!uploadBody.find('ul')[0]){
			uploadTipMod.hide();
			uploadList.show();
			uploadBody.append('<ul>');
		}

		if(typeof file.size === 'undefined'){
			errorCode = SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT;
			size = '未知大小';
		}else{
			size = formatbytes(file.size)
		}

		var ul = uploadBody.find('ul');
		var li = '<li id="upload_'+ file.id +'"> \
                    <div class="progress-bg"></div> \
                    <span class="f-name" title="'+ file.name +'">'+ file.name +'</span> \
                    <span class="f-percent">等待上传</span> \
                    <span class="f-size">'+ formatbytes(file.size) +'</span> \
                    <span class="f-op"> \
                        <a class="cancle" href="javascript:;"><span class="icon icon-cancle2"></span></a> &nbsp; \
                    </span> \
                </li>';
		li = $(li);
		ul.append(li);
		var progress = li.find('.progress-bg'),
			percent = li.find('.f-percent'),
			oprator = li.find('.f-op');
		oprator.empty();
		switch (errorCode) {
			case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
				showError(file,'超过大小限制');
				break;
			case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
				showError(file,'文件为空');
				break;
			case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
				showError(file,'文件类型错误');
				break;
			default:
				if (file !== null) {
					showError(file,'未知错误');
				}
				break;
		}
	}
	function fileDialogComplete(numFilesSelected,numFilesQueued){
		this.startUpload();
		resetTitle();
	}
	function uploadStart(){

	}
	function uploadProgress(file,bytesLoaded,bytesTotal){
		var per = Math.ceil( (bytesLoaded / bytesTotal) * 10000 ) / 100;
		var li = $('#upload_' + file.id),
			progress = li.find('.progress-bg'),
			percent = li.find('.f-percent'),
			oprator = li.find('.f-op');

		progress.css('width', per + '%');
		//li.data('progress',per + '%');
		if(per === 100){
			percent.html('<span class="saving"><span class="icon icon-loading"></span>正在存储</span>');
			oprator.empty();
		}else{
			percent.html(per + '%');
		}
	}
	function uploadError(file,errorCode,message){
		console.log(errorCode)
		var li = $('#upload_' + file.id),
			progress = li.find('.progress-bg'),
			percent = li.find('.f-percent');
		switch (errorCode) {
			case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
				showError(file,'上传错误' + '<em style="color:white">'+ SWFUpload.UPLOAD_ERROR.HTTP_ERROR +'</em>');
				this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
				break;
			case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
				showError(file,'上传失败');
				this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
				break;
			case SWFUpload.UPLOAD_ERROR.IO_ERROR:
				showError(file,'服务器错误');
				this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
				break;
			case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
				showError(file,'上传错误' + '<em style="color:white">'+ SWFUpload.UPLOAD_ERROR.SECURITY_ERROR +'</em>');
				this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
				break;
			case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
				showError(file,'空间不足');
				this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
				break;
			case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
				showError(file,'上传错误' + '<em style="color:white">'+ SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED +'</em>');
				this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
				break;
			case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
				showError(file,'取消上传');
				break;
			case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
				showError(file,'上传错误' + '<em style="color:white">'+ SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED +'</em>');
				break;
			default:
				showError(file,'上传错误');
				this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
				break;
			}
	}
	function uploadSuccess(file,serverData){
		var li = $('#upload_' + file.id),
			progress = li.find('.progress-bg'),
			percent = li.find('.f-percent'),
			oprator = li.find('.f-op');

		//TODO serverData
		progress.remove();
		oprator.empty();
		if(serverData.indexOf('701:') >= 0){
			//percent.html('<span class="success">登录超时</span>');
			Sbox.Login();
		}else{
			serverData = jQuery.parseJSON(serverData);
			if(serverData === null){
				percent.html('<span class="fail">上传失败</span>');
				return;
			}
			if(serverData.code === 200){
				percent.html('<span class="success">上传成功</span>');
				if(uploadHandler.getSetting('fileList') && file.post.dirId === uploadHandler.getSetting('path').get('pathId')) uploadHandler.getSetting('fileList').trigger('reload');
			}else if(serverData.code === 501){
				percent.html('<span class="fail">空间大小不足</span>');
			}else if(serverData.code === 503){
				percent.html('<span class="fail">该文件被锁定</span>');
			}else if(serverData.code === 505){
				percent.html('<span class="fail">没有权限</span>');
			}else if(serverData.code === 801){
				percent.html('<span class="fail">密码已修改</span>');
				Sbox.Error({
					message:'上传密码已修改，请重新输入密码！',
					onHide:function(){
						location.reload();
					}
				})
				this.cancelQueue();
			}else{
				percent.html('<span class="fail">上传失败</span>');
			}
		}
	}
	function uploadComplete(){
		if (this.getStats().files_queued === 0) {
			window.onbeforeunload = null;
		}
	}
	function queueComplete(){
		if (this.getStats().files_queued === 0) {
			window.onbeforeunload = null;
		}
	}
	function showError(file,message){
		var li = $('#upload_' + file.id);
		li.find('.f-percent').empty().html('<span class="fail">'+ message +'</span>');
		li.find('.progress-bg').remove();
		li.find('.f-op').empty();
		li.removeAttr('id');
	}


})
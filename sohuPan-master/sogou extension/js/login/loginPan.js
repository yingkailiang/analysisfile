var sohuPan = sohuPan||{};

(function() {
	function loginPan(options) {
		/*var data = {
			AccessId : options.username,
			SecretKey : options.password,
			Email : ""
		};*/
		var data = {
			loginName : options.username,
			password : options.password
		};
		$.ajax({
			url : panApi.loginPan,
			type : "post",
			dataType : "json",
			data : data,
			success : function(d) {
				options.success(d);				
			},
			error : function(xhr) {
				options.error(xhr);
			}
		});
	}

	this.loginPan = loginPan;
}).apply(sohuPan);
var Settings=(function(){

	function saveUser(user){
		localStorage["yueyueUser"]=JSON.stringify(user);
	}

	function getUser(){
		var user=localStorage["yueyueUser"];
		if(user== undefined){
			user={"weiboName":"还没有授权哦","weiboIcon":"http://list.image.baidu.com/t/image/w_sheying.jpg"};
		}else{
			user = JSON.parse(user);
		}
		return user;
	}

	function getPreference(){
		var preference=localStorage["yueyuePreference"];
		if(preference== undefined){
			preference={"sync":true};
		}else{
			preference = JSON.parse(preference);
		}
		return preference;
	}

	function savePreference(preference){
		localStorage["yueyuePreference"]=JSON.stringify(preference);
	}

	function isSyncOn(){
		return getPreference().sync;
	}

	function syncOn(){
		var preference=getPreference();
		preference.sync=true;
		savePreference(preference);
	}

	function syncOff(){
		var preference=getPreference();
		preference.sync=false;
		savePreference(preference);
	}

	return {
		getUser:getUser,
		saveUser:saveUser,
		isSyncOn:isSyncOn,
		syncOn:syncOn,
		syncOff:syncOff
	}

}());
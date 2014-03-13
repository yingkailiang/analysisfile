angular.module('userService',[],function($provide){
	$provide.factory('userChecker',function(){
		return {
			getLocalUser:function(){
				user = localStorage['yueyueUser']
				if (user != undefined){
					return JSON.parse(user)
				}
				user = {"weiboName":"还没有授权哦","weiboIcon":"http://list.image.baidu.com/t/image/w_sheying.jpg","weiboId":-1};
				return user;
			},
			mapUser:function(user){
				var res = {
					user:{
						weiboId:user.id.toString(),
	                    weiboIcon:user.avatar_large,
	                    weiboName : user.screen_name,
	                    weiboIconSmall: user.profile_image_url
	                },
	                status:'unknown'
				}
				return res
			}
		}
	})
})

angular.module('eventService',[],function($provide){
	$provide.factory('eventChecker',function(){
		return {
			getAcceptedNum:function(invitation){
				var num = 0;
				$.each(invitation.invitees,function(index,person){
					if(person.status == 'accepted'){
						num = num+1
					}
				})
				return num
			}
		}
	})
})

angular.module('sinaService', ['ngResource'],function($provide){
	$provide.factory('SinaUsers', function($resource){
		return $resource('https://api.weibo.com/2/users/:jsonName.json', {}, {
			getMyInfo: {method:'GET',params:{jsonName:'show',uid:localStorage['weiboId'],access_token:localStorage['weiboToken']},isArray:false}
		})
	})
	$provide.factory('SinaFriends', function($resource){
		return $resource('https://api.weibo.com/2/friendships/friends/bilateral.json',{},{
			getBilateralFriends:{method:'GET',params:{},isArray:false}
		})
	})
	$provide.factory('SinaPoster',function($http){
		return {
			postInvitation:function(status){
				return $http({
    					method: 'POST',
    					url: 'https://api.weibo.com/2/statuses/update.json',
    					data: status,
   						 headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
					}).then(function(response){
					return response
				})
			}
		}
	})
})

angular.module('inviteService', ['ngResource'],function($provide){
	$provide.factory('Invitation', function($resource){
		return $resource('http://localhost:8087/resource/invitation', {}, {
			addInvitation: {method:'POST',params:{},isArray:false}
		})
	})
		$provide.factory('eventService',function($http){
		return {
			getOpenInvitationList:function(weiboId){
				return $http.get('http://50.116.7.37:3000/resource/invitation/open/weiboId/'+weiboId+'/page/0').then(function(response){
					return response
				})
			},
			addUser:function(){
				var data = 'weiboId='+localStorage['weiboId']
				return $http({
    					method: 'POST',
    					url: 'http://localhost:8087/resource/user',
    					data: data,
   						 headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
					}).then(function(response){
					return response
				})
			},
			 sendEvent:function(event){
				return $http({
    					method: 'POST',
    					url: 'http://50.116.7.37:3000/resource/invitation',
    					data: event,
   						 headers: {'Content-Type': 'application/json;charset=UTF-8'}
					}).then(function(response){
					return response
				})
			},
			sendReply:function(reply,weiboId,id,date){
				
				return $http({
    					method: 'POST',
    					url: 'http://50.116.7.37:3000/resource/invitation/'+id+'/reply',
    					data: $.param({content:reply,user:weiboId,date:date}),
   						 headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
					}).then(function(response){
					return response
				})
			},
			sendStatus:function(data,id){
				
				return $http({
    					method: 'POST',
    					url: 'http://50.116.7.37：3000/resource/invitation/'+id+'/status',
    					data: data,
   						 headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
					}).then(function(response){
					return response
				})
			}
			// getEvent:function(event){
			// 	return $http.post('http://50.116.7.37:3000/resource/invitation/',event).then(function(response){
			// 		return response
			// 	})
			// }

		}
	})
})


angular.module('dp-app',['ngResource','sinaService','userService','inviteService'],function($provide){


})
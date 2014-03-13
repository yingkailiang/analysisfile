function OpenInvitationController($scope,eventService,userChecker,$timeout){
	chrome.browserAction.setBadgeText({text:''});
	$scope.user = userChecker.getLocalUser();

	

    $('#datepicker').datepicker();

    $scope.getState = function(invite){
		if(invite.inviter.user.weiboId == $scope.user.weiboId){
			return "owner"
		}
		$.each(invite.invitees,function(k,v){
			if(v.user.weiboName == $scope.user.weiboName){
				if(v.status == 'unknown'||v.status =='rejected'){
					return 'a'
				}else if(v.status == 'unknown' || v.status == 'accepted'){
					return 'b'
				}
			}

		})
	}

	$scope.getCount = function(i){
		number = 1;
		$.each(i.invitees,function(k,v){
			if(v.status == 'in'){
				number=number+1;
			}
		})
		return number;
	}
	$scope.getFormatDate = function(d){
		date= new Date(d)
		return ""+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
	}
	$scope.openInvitations = {}
	var t = []
	$scope.sendReply = function(index,i,c){
		i_id = i._id;
		eventService.sendReply(c,$scope.user,i_id,new Date()).then(function(response){
			$scope.openInvitations[index].replyList = response.data.replyList;
			i.content="";
			chrome.browserAction.setBadgeText({text:''})

		})
	}
	$scope.getStatus = function(i){
		if(i.inviter.user.weiboId == $scope.user.weiboId){
			return true;
		}else{
			$.each(i.invitees,function(k,v){
				if(v.user.weiboId == $scope.user.weiboId)
					if(v.status == 'accepted'){
						return true;
					}
			});
		}
		return false;

	}

	$scope.changeState = function(status,id){
		data = $.param({weiboId:$scope.user.weiboId,status:status})
		eventService.sendStatus(data,id).then(function(response){
				$timeout(function() {

	var request = {}
	request.sender="readlist";
 	chrome.extension.sendRequest(request, function(list) {
 			t = list
 		});
	}, 1000)
	$timeout(function(){
		$.each(t,function(i,item){
			item.startDate = $scope.getFormatDate(item.startDate)
		})
		$scope.openInvitations = t

	},4000)
		})
	}
	//set updater
	$scope.updater = {
		update:function update(){
			$timeout(function(){
				 	eventService.getOpenInvitationList($scope.user.weiboId).then(function(response){
 						$scope.openInvitations = response.data;
 					})
			},100)
		}
	}
	//kick up
	$scope.updater.update()

}

function InviteControllor($scope,$timeout,SinaUsers,SinaFriends,Invitation,eventService,userChecker,SinaPoster){
	//check user info
	$scope.user = userChecker.getLocalUser();
	$scope.weiboSuccess = false
	$scope.invitees = []
	$scope.inviteeCopy = []
	$scope.shoplist = [];
	$scope.content = 'cc '
	if($scope.user.weiboId == -1){
		extension_id = chrome.i18n.getMessage("@@extension_id")
		//window.location.href="https://api.weibo.com/oauth2/authorize?client_id=3371075251&redirect_uri=chrome-extension://"+extension_id+"/options.html&response_type=token&display=default&forcelogin=true";
	}

	//get friends and init add-friend-input
	SinaFriends.getBilateralFriends({uid:$scope.user.weiboId,access_token:$scope.user.weiboToken},function(data){
		$scope.friends = data.users
		names = []
		mappedcopy = []
     	mapped = {}

      	$.each($scope.friends, function (i, item) {
        	mapped[item.name] = userChecker.mapUser(item)
        	mappedcopy[item.name] = userChecker.mapUser(item)
        	names.push(item.name)
      	})
		$('#add-friend-input').typeahead({
			source: names,
			updater: function(name){
				 $timeout(function(){
 						$scope.invitees.push(mapped[name])
 						$scope.inviteeCopy.push(mappedcopy[name])
 						$scope.content = $scope.content+"@"+name+" "
 				},10)
			}
		})
	});

	//send invitation
	$scope.sendInvitation= function(){
		$scope.shoplist.push($scope.shop);
		invitationSent = {
			invitees:$scope.inviteeCopy,
			inviter:{user:{weiboId:$scope.user.weiboId,weiboName:$scope.user.weiboName,weiboIcon:$scope.user.weiboIcon,weiboIconSmall:$scope.user.weiboIconSmall}},
			shopList:$scope.shoplist,
			startDate:new Date($("#datepicker")[0].value+" "+$scope.hours+":00:00"),
			createDate:jQuery.now(),
			lastUpdateDate:jQuery.now(),
			description:$scope.description==undefined ? $scope.shop.shopName:$scope.description,
			replyList:[]
		}
		//send sina weibo
		if(Settings.isSyncOn()){
			//content
			var status = invitationSent.description + $scope.content +$scope.shop.url
			var xsrf = $.param({status:status,access_token:$scope.user.weiboToken});
			SinaPoster.postInvitation(xsrf).then(function(data){
				$scope.weiboSuccess = true;
				 chrome.browserAction.setBadgeText({text:'new'})

			})
		}
		eventService.sendEvent(JSON.stringify(invitationSent)).then(function(response){

		})
	}

	//get shop info
 	var request={};
 	request.sender="popup";
 	chrome.extension.sendRequest(request, function(shop) {
 		$scope.shop = shop
 		if(shop == undefined){
 			$scope.shop = {shopName:'不在點評商戶頁',address:'沒有地址',phoneNo:'沒有電話'}
 		}
 	});



}
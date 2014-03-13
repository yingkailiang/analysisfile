var numStreamStories = 0;
var isEnabled = false;
var itemIDs = [];
var thingsToClickUnique = [];

//Ask background page (which has access to localStorage) for current enabled/disabled state
chrome.extension.sendRequest({method: "getState"}, function(response) {
  isEnabled = response.status;
  if(isEnabled=="true"){
  	bindIt();
  }
  else{
  	unbindIt();
  }
});

//react to messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.action=="true"){
    	bindIt();
    }
    else{
    	unbindIt();
    }
});

//FUNCTIONS FOR MAIN TIMELINE
//==========================================================================================
function clickLikes(clickingElements)
{
	var elements = clickingElements;
	var posToReturnTo = $(window).scrollTop();
	var toClick = Math.floor(Math.random() * 4) + 2

	var arr = []
	while(arr.length < toClick){
  		var randomnumber=Math.ceil(Math.random()*(clickingElements.length-1));
  		var found=false;
		for(var i=0;i<arr.length;i++){
			if(arr[i]==randomnumber){found=true;break}
		}
  		if(!found)arr[arr.length]=randomnumber;
	}

	var i=0;
	var currentIndex = 0;
	//dealing with Facebook clicking timeout frequency issues
	var interval = setInterval(function() { 
                          
                          currentIndex = arr[i];

                          if(elements[currentIndex].text == "Like" && ( elements[currentIndex].title == "Like this" || elements[currentIndex].title == "Like this comment" )){
							posToReturnTo = $(window).scrollTop();
							elements[currentIndex].click();
							$(window).scrollTop(posToReturnTo);
							}

                          i++; 
                          if(i >= arr.length) clearInterval(interval);
                   }, 1000);


}

function identifyAndSendLikes(){

	//Grab Like elements
	var elements = document.getElementsByClassName('UFILikeLink');
	var thingsToClick = elements; 
	var sumNew = 0;
	
	for (var i=0;i<elements.length;i++){
		
		var cElement = elements[i];
		var cReactID = elements[i].getAttribute("data-reactid");
		var cElementObject = {"reactid":cReactID,"link":cElement};
		var bExists = false;

		for (var j=0;j<itemIDs.length;j++){
			if(itemIDs[j].reactid == cReactID){
				bExists = true;
			}
		}

		if(!bExists){
			itemIDs.push(cElementObject);
			thingsToClickUnique.push(elements[i]);
		}

	}

	if(thingsToClickUnique.length>=30){
		clickLikes(thingsToClickUnique);
		thingsToClickUnique = [];
	}

};


function bindIt(){
	$("#content").bind("DOMSubtreeModified", identifyAndSendLikes);
}

function unbindIt(){
	$("#content").unbind("DOMSubtreeModified", identifyAndSendLikes);
}


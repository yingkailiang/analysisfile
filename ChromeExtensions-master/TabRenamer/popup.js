/* To view this script's output, right click on the extension's icon at the top right of the
 * browser and select "inspect popup." DO NOT inspect the popup.html directly from within the
 * browser. This script only runs when the extension icon is clicked  */
console.log("popup.js running");

/*
var port = chrome.extension.connect({
  name: "Sample Communication"
});
port.postMessage("Request Modified Value");
port.onMessage.addListener(function (msg) {
  console.log("popup.js received onMessage, msg: " + msg.text);
});
*/


function tabPair(originaltab, userinput) {
  this.originaltab = originaltab;
  this.userinput = userinput;
}

tabPair.prototype.toString = function() {
  return "Original tab: " + originaltab + ", user input: " + userinput;
};

var tabnames = [];

//popup's response to background giving it the current tab names
chrome.runtime.sendMessage({type:"getTabName"},function(response){
  tabnames = response;
  //console.log("popup.js received response.text: " + response.text);
  console.log("popup.js tabnames size: " + tabnames.length);
  //console.log("popup.js now trying to fill up popup.html");
  
  //iterate through tabs, figuring out which span/form labels should get what text
  for (var i = 0; i < tabnames.length; i++) {
    var id;
    if (i == 0) {
      id = "firstspan";
    }
    else if (i == 1) {
      id = "secondspan";
    }
    else if (i == 2) {
      id = "thirdspan";
    }
    else if (i == 3) {
      id = "fourthspan";
    }
    else if (i == 4) {
      id = "fifthspan";
    }
    var jqueryid = "#" + id;
    //retrieve text from the active tabs and label forms
    var tabpair = tabnames[i];
    $(jqueryid).text(tabpair.userinput);
  }
  //now hide the unused divs
  for (var j = tabnames.length + 1; j <= 5; j++) {
    //if the tab "id" in question is not in array, then it should be hidden from popup
    var id;
    if (j == 1) {
      id = "firsttab";
    }
    else if (j == 2) {
      id = "secondtab";
    }
    else if (j == 3) {
      id = "thirdtab";
    }
    else if (j == 4) {
      id = "fourthtab";
    } 
    else if (j == 5) {
      id = "fifthtab";
    }
    var fullid = "#" + id;
    console.log("trying to toggle " + fullid);
    $(fullid).toggleClass('hidden');
  }
});

//$('input[type=submit]').on('click', function() {
//$(":input").on('click', function() {
$(document).on('click','.button',function() {
  //retrieve values from forms
  var firstspan = $('#firstinput').val();
  var secondspan = $('#secondinput').val();
  var thirdspan = $('#thirdinput').val();
  var fourthspan = $('#fourthinput').val();
  var fifthspan = $('#fifthinput').val();
  console.log("first tab: " + $("#firstspan").text() + ", first span: " + firstspan);
  console.log("second span: " + secondspan);
  console.log("third span: " + thirdspan);
  console.log("fourth span: " + fourthspan);
  console.log("fifth span: " + fifthspan);
  var tabnames = [];
  //for each form that has input, push the current name of the tab then the new name
  if (firstspan.length > 0) {
    var tabpair1 = new tabPair($("#firstspan").text(), firstspan);
    tabnames.push(tabpair1);
  }
  if (secondspan.length > 0) {
    var tabpair2 = new tabPair($("#secondspan").text(), secondspan);
    tabnames.push(tabpair2);
  }
  if (thirdspan.length > 0) {
    var tabpair3 = new tabPair($("#thirdspan").text(), thirdspan);
    tabnames.push(tabpair3);
  }
  if (fourthspan.length > 0) {
    var tabpair4 = new tabPair($("#fourthspan").text(), fourthspan);
    tabnames.push(tabpair4);
  }
  if (fifthspan.length > 0) {
    var tabpair5 = new tabPair($("#fifthspan").text(), fifthspan);
    tabnames.push(tabpair5);
  }
  console.log("number of tab pairs entered: " + tabnames.length);
  //clear all forms
  $('#firstinput').val('');
  $('#secondinput').val('');
  $('#thirdinput').val('');
  $('#fourthinput').val('');
  $('#fifthinput').val('');
  chrome.runtime.sendMessage({type:"enteredTabNames", array:tabnames},function(response){});
  console.log("popup sent entered tab names");
  window.close();
});

chrome.runtime.onMessage.addListener(function(message,sender, sendResponse) {
  if (message.type == "userSavedNewTabs") {
    console.log("popup clearing tabnames[]");
    tabnames.length = 0;   
  }
});

/*
 * $('#topologicalView').toggleClass('hidden');
 *
 *$('#geographicalContainer').on('click', '.heatmapToggleBtn', function(){
        $('.heatmap').toggleClass('hidden');
      });

if($(this).html() == '&lt;') { $(this).html('&gt;'); }
else { $(this).html('&lt;'); }
*/

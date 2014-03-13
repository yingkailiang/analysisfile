function findList() {
  var nodeList = document.querySelectorAll("a.course-title");
  return nodeList;
}

function parseList(nodeList) {
	var onclickData = [];
	var courseNameData = [];
	for (var i = 0, len = nodeList.length; i < len; i++) {
		onclickData.push(nodeList[i].getAttribute('onclick'));
		courseNameData.push(nodeList[i].innerHTML.trim());
	}
	return [onclickData, courseNameData];
}

function buildLists(data) {
	var courseNameList = [];
	var onclickList = [];
	for (var key in data[0]) {
		onclickList.push(data[0][key]);
		courseNameList.push(data[1][key]);
	}
	
	return [onclickList, courseNameList];
}

function findName() {
  var nameNode = document.getElementById("login-name");
  return nameNode.innerText;
}

function writeList(lists) {
	var onclickList = lists[0];
	var courseNameList = lists[1];
  var aNode, textNode, courseName;
  var topDiv = document.getElementById("topDropAll");
  for (var i = 0, len = onclickList.length; i < len; i++) {
    courseName = courseNameList[i].replace("&amp;", "&");
    textNode = document.createTextNode(courseName);
    node = document.createElement("a");
    node.className = "course-title";
    node.href = "student,home.0";
    node.setAttribute("onclick", onclickList[i]);
    node.appendChild(textNode);
    topDiv.appendChild(node);
  }
}

var port = chrome.runtime.connect({name: "data-link"});
var userName = findName();

port.postMessage({type:"check", data:userName})
port.onMessage.addListener(function(msg) {
  if (msg.flag == "y") {
    writeList(msg["data"]);
  }
});


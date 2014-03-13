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

function findName() {
  var nameNode = document.getElementById("login-name");
  return nameNode.innerText;
}

var port = chrome.runtime.connect({name: "data-link"});
var userName = findName();
var lists  = parseList(findList());
port.postMessage({type:"save", name:userName, data:lists})

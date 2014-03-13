
// バッジカウンター更新
function updateBadge() {
  var text = "";
  if (typeof localStorage["list"] != "undefined") { // getItemではうまくいかない
      var list = JSON.parse(localStorage.getItem("list"));
      if (0 < list.length) {
        text = String(list.length);
      }
  }
  chrome.browserAction.setBadgeText({text:text});
}

// コンテキストメニュークリックによるリスト追加
function onClick(onClickData, tabData) {
  console.log("\n\nitem " + onClickData.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(onClickData));
  console.log("tabInfo: " + JSON.stringify(tabData));

  var list;
  if (typeof localStorage["list"] == "undefined") { // getItemではうまくいかない
      console.log("new Array()");
	  list = new Array();
  } else {
	  list = JSON.parse(localStorage.getItem("list"));
  }
  // URL重複チェック
  for (var i = 0; i < list.length ; i++) {
      if (list[i].url == tabData.url) {
          console.log("Existed link : " + tabData.url);
          return; // すでに同一URL登録済みなので無視して終了。
      }
  }
  // 登録
  list.push(tabData);
  console.log(list);
  localStorage.setItem("list", JSON.stringify(list));
  updateBadge();
}

//--- start ----

chrome.browserAction.setBadgeBackgroundColor({color:[40, 200, 0, 200]});
updateBadge();

chrome.contextMenus.create({"title": "Stack this page.", "onclick": onClick});
chrome.contextMenus.create({"title": "Stack this link.", "contexts":["link"], "onclick": onClick});

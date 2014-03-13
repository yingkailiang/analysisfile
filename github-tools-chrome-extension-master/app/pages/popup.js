
var bgPage = chrome.extension.getBackgroundPage();

document.getElementById('details').innerHTML = bgPage.divDetails.innerHTML;
document.getElementById('user').innerHTML = bgPage.divUserLinks.firstElementChild.innerHTML;

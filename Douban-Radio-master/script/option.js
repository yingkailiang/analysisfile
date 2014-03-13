function init () {

	checkSelection();
	setEventHandler();
	
}

function checkSelection() {
	var channelNo = localStorage.getItem('channel');
	if(channelNo){
		var items = document.querySelectorAll('ol');
		for (var i = 0; i < items.length; i++) {
			if(items[i].getAttribute('data-value') == channelNo){
				items[i].className = 'choosed';
			}else{
				items[i].className = '';
			}
		};
	}
}

function setEventHandler(){
	var items = document.querySelectorAll('ol');
	for (var i = 0; i < items.length; i++) {
		items[i].addEventListener('click',function(){
			if (this.className == 'choosed') { return; };
			var list = document.querySelectorAll('ol');
			for (var i = 0; i < list.length; i++) {
				list[i].className = '';
			};
			this.className = 'choosed';
			var backDOM = chrome.extension.getBackgroundPage();
			backDOM.main(this.getAttribute('data-value'));
			localStorage.setItem('channel', this.getAttribute('data-value'));
		}),false;
	};
}


document.addEventListener('DOMContentLoaded', init);
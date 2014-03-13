describe("Web Socket Helper", function(){
	beforeEach(function(){
		loadFixture();
	});
	afterEach(function(){

	});

	it("on ws connection, it should enqueue start command", function(){
		this.queueSpy = sinon.spy(window, "addToQueue");
		wsCallbacks.onopen();
		expect(this.queueSpy).toHaveBeenCalled();
		window.addToQueue.restore();
	});

	it("should create a new tab on call to onMessage", function(){
		window.chrome = {tabs:{create:function(url){}}};
		this.createNewTabSpy = sinon.spy(window.chrome.tabs, "create");
		var urlObj = {data:'{"cmd": "URL", "url":""}'};
		wsCallbacks.onmessage(urlObj);
		expect(this.createNewTabSpy).toHaveBeenCalled();
		window.chrome.tabs.create.restore();
	});
	
});
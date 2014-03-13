describe("Web Socket", function(){
	beforeEach(function(){
		loadFixture();
		this.clock = sinon.useFakeTimers();
	});
	afterEach(function(){
		this.clock.restore();
	});

	it("should update upload progress", function(){
		TotalFramesCaptured = 4000;
		this.progressStub = sinon.stub(queue, "getLength");
		this.progressStub.returns(1000);
		var self = this;
		window.chrome = {browserAction: { setBadgeText: function(badgeText){ self.text = badgeText.text}}};
		updateUploadProgress();
		expect(self.text).toEqual("25%");
		queue.getLength.restore();
	});

	it("should end the process of sending data if the buffer is empty", function(){
		STATE = 'off';
		wsInterval = {};
		sendInterval = {};
		this.progressStub = sinon.stub(queue, "getLength");
		this.progressStub.returns(0);
		this.iconStub = sinon.stub(window, "setIcon");
		var self = this;
		window.chrome = {browserAction: { setBadgeText: function(badgeText){ self.text = badgeText.text}}};
		endAfterTheBufferIsEmpty();
		this.clock.tick(260);
		expect(self.text).toEqual("Start");
		expect(ws).toEqual(null);
		queue.getLength.restore();
	});

	it("should update the upload progree if state is off", function(){
		STATE = 'off';
		ws = {bufferedAmount: 10};
		this.uploadProgressSpy = sinon.spy(window, "updateUploadProgress");
		sendFromQueue();
		this.clock.tick(60);
		expect(this.uploadProgressSpy).toHaveBeenCalled();
		window.updateUploadProgress.restore();
	});

	it("should send data from queue", function(){
		STATE = 'off';
		ws = {send: function(){}, bufferedAmount: 0};
		this.sendSpy = sinon.spy(ws, "send");
		sendFromQueue();
		this.clock.tick(60);
		expect(this.sendSpy).toHaveBeenCalled();
		ws.send.restore();
	});

});
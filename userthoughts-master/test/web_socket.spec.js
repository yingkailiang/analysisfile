describe("Web Socket", function(){
	beforeEach(function(){
		loadFixture();
	});
	afterEach(function(){
	});

	it("should not return a null websocket object", function(){
		this.ws = WsSingleton.getInstance();
		expect(this.ws).toBeDefined();
	});
});

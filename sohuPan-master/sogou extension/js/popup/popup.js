(function () {
	$(".pan-link-logout").click(function(e) {
		e.preventDefault();
		localStorage.removeItem("token");
		window.close();
	});
})();
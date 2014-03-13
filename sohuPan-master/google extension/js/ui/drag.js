jQuery.fn.extend({
	panDrag : function (options) {
		var self = this,
			dragArea = self.find(options.dragArea),
			$body = $(document.body),
			oldLeft,oldTop,
			moveLeft = 0,moveTop = 0;

		self.addClass("pan-draggable")
		dragArea.addClass("pan-drag-area");

		dragArea.on("mousedown", function(e) {
			oldLeft = e.clientX;
			oldTop = e.clientY;
			$body.on("mousemove", move);
		});		

		dragArea.on("mouseup", function(e) {
			$body.off("mousemove", move);
		});

		function move(e) {
			e.preventDefault();
			var newLeft = e.clientX,
				newTop = e.clientY;
			moveLeft = moveLeft + (newLeft - oldLeft);
			moveTop = moveTop + (newTop - oldTop);
			oldLeft = newLeft;
			oldTop = newTop;
			self.css({
				left : moveLeft,
				top : moveTop
			});
		}
	}
});
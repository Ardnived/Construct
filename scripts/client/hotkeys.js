
define(
	function() {
		var keys = {
			27: 'escape',
		};

		function handler(e) {
			e = e || window.event;
			
			if (typeof keys[e.keyCode] !== 'undefined') {
				hooks.trigger('keypress:'+keys[e.keyCode]);
			}
		};

		document.addEventListener("keydown", handler, false);
	}
);

hooks.on('keypress:escape', function() {
	debug.flow('pressed escape.');
});

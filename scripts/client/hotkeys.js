
define(
	function() {
		var keys = {
			27: 'escape',
		};

		function handler(e) {
			e = e || window.event;
			
			if (typeof keys[e.keyCode] !== 'undefined') {
				HOOKS.trigger('keypress:'+keys[e.keyCode]);
			}
		};

		document.addEventListener("keydown", handler, false);
	}
);

HOOKS.on('keypress:escape', function() {
	DEBUG.flow('pressed escape.');
});

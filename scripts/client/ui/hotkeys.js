
define(
	function() {
		var keys = {
			27: 'escape',
		};

		return {
			init: function() {
				document.addEventListener("keydown", this.handler, false);
			},

			handler: function(e) {
				e = e || window.event;
				
				if (typeof keys[e.keyCode] !== 'undefined') {
					hooks.trigger('keypress:'+keys[e.keyCode]);
				}
			},
		};
	}
);

hooks.on('keypress:escape', function() {
	debug.temp('pressed escape.');
});

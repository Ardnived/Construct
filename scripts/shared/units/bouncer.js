
define({
	reveals: true,
	move: 1,
	actions: {
		pushback: "prevent passage and reveal any program that tries to enter.",
		pushthrough: "force other programs out of hexes it passes through.",
	},
});

hooks.on('unit:move', function(allow, data) {
	if (allow) {
		if (this._type == 'bouncer') {

		} else {
			
		}
	}

	return allow;
});

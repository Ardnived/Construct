
requirejs.config({
	baseUrl: '/scripts/',
	shim: {
		'external/jquery': {
			exports: '$',
		},
		'external/crafty': {
			exports: 'Crafty',
		},
		'external/spritegen': {
			exports: 'psg',
		},
	},
});

requirejs(['global/config', 'global/debug', 'global/hooks']);

GAME_STATE = null;

requirejs(
	['client/dispatch', 'client/ui', 'shared/state', 'client/canvas'], 
	function(dispatch, ui, state) {
		GAME_STATE = new state();
		ui.init();

		for (var q = GAME_STATE.min_q(); q <= GAME_STATE.max_q(); q++) {
			for (var r = GAME_STATE.min_r(q); r <= GAME_STATE.max_r(q); r++) {
				// Initialize each hex.
				GAME_STATE.hex(q, r);
			}
		}

		hooks.on('dispatch:update', function(data) {
			debug.flow("got dispatch:update");
			if (data instanceof Array) {
				hooks.trigger('state:update', GAME_STATE, data);
			}
		});

		hooks.on('dispatch:rejected', function(data) {
			debug.error("Rejected:", Messages[data.message]);
		});

		dispatch.init(config.port.socket);

		// TODO: Remove this temp code.
		hooks.on('hex:mouse_over', function(event) {
			document.getElementById('tooltip').innerHTML = "position: "+this.q+", "+this.r+"<br>units: "+JSON.stringify(Object.keys(this.units()), null, 2);
		});
	}
);

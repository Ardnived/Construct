
requirejs.config({
	baseUrl: '/scripts/',
	paths: {
		priorityqueuejs: 'external/queue', // For client-server compatibility.
	},
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
		/*'external/queue': {
			exports: 'PriorityQueue',
		},*/
	},
});

requirejs(['global/config', 'global/debug', 'global/hooks']);

GAME_STATE = null;

requirejs(
	['client/dispatch', 'shared/state'], 
	function(dispatch, state) {
		GAME_STATE = new state();

		hooks.on('dispatch:update', function(data) {
			if (data instanceof Array) {
				hooks.trigger('state:update', GAME_STATE, data);
			}
		});

		hooks.on('dispatch:rejected', function(data) {
			debug.error("Rejected:", Messages[data.message]);
		});

		requirejs(
			['client/topbar', 'client/hotkeys', 'client/cursor', 'client/selection', 'client/actions', 'client/board'],
			function() {
				for (var q = GAME_STATE.min_q(); q <= GAME_STATE.max_q(); q++) {
					for (var r = GAME_STATE.min_r(q); r <= GAME_STATE.max_r(q); r++) {
						// Initialize each hex.
						GAME_STATE.hex(q, r);
					}
				}

				dispatch.init(config.port.socket);
			}
		);
	}
);

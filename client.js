
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
	['client/dispatch', 'shared/state', 'shared/message', 'client/updater'], 
	function(DISPATCH, STATE, MESSAGE) {
		GAME_STATE = new STATE();

		HOOKS.on('dispatch:update', function(data) {
			if (data instanceof Array) {
				HOOKS.trigger('state:update', GAME_STATE, data);
			} else {
				DEBUG.fatal("Tried to send non-array updates", data);
			}
		});

		HOOKS.on('dispatch:rejected', function(data) {
			var output = "Rejected: "+data.message+' - '+MESSAGE.text[data.message];
			DEBUG.error(output);
		});

		HOOKS.on('dispatch:gameover', function(data) {
			var output = "GAMEOVER: "+data.message+' - '+MESSAGE.text[data.message];
			DEBUG.error(output);
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

				DISPATCH.init(CONFIG.port.socket);
			}
		);
	}
);

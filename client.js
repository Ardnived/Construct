
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
	},
});

requirejs(['global/config', 'global/debug', 'global/hooks']);

GAME_STATE = null;

requirejs(
	['client/dispatch', 'shared/state', 'shared/message', 'client/updater', 'client/lobby'], 
	function(DISPATCH, STATE, MESSAGE) {
		HOOKS.on('dispatch:sync', function(args) {
			if (args.data instanceof Array) {
				DEBUG.flow('--------- RECEIVED SYNC COMMAND ---------');
				if ( args.meta.reset === true ) {
					for (var q = GAME_STATE.min_q(); q <= GAME_STATE.max_q(); q++) {
						for (var r = GAME_STATE.min_r(q); r <= GAME_STATE.max_r(q); r++) {
							// Initialize each hex.
							GAME_STATE.hex(q, r);
						}
					}

					HOOKS.trigger('state:update', GAME_STATE, args.data);
				} else {
					HOOKS.trigger('state:update', GAME_STATE, args.data);
					HOOKS.trigger('state:sync', GAME_STATE);
				}
			} else {
				DEBUG.fatal("Tried to send non-array updates", args.data);
			}
		});

		HOOKS.on('dispatch:gameover', function(args) {
			DEBUG.error("GAMEOVER: "+args.data.message+' - '+MESSAGE.text[args.data.message]);
		});

		requirejs(
			['client/topbar', 'client/hotkeys', 'client/cursor', 'client/selection', 'client/actions', 'client/board'],
			function() {
				DISPATCH.init(CONFIG.port);
			}
		);
	}
);

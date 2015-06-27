
define(
	['server/lobby/main',
	 './state_handler', './victory_handler', './sync_handler'],
	function(DATABASE) {
		HOOKS.on('dispatch:action', function(args) {
			if (typeof args.data.action === 'undefined') {
				DEBUG.fatal("Tried to execute a non-action update", args);
			}

			if (!('player_id' in args.data)) {
				DEBUG.fatal("Attempted to execute an action without specifying the player_id", data);
			}

			var game_id = 1; // TODO: Define this properly.

			var state = games[args.client.game_id]; // TODO: Fix this.
			DATABASE.select(state.id);

			var player = state.player(data.player_id);

			// TODO: Check that the player's IP/client matches the dispatch client.

			if (player == null) {
				DEBUG.error("Non-existant player", player.id, "tried to act.");
				MESSAGE.send('rejected', {
					message: "500",
				}, player.client);
				return;
			}

			if (player.active == false) {
				DEBUG.error("Player", player.id, "tried to act when it was not their turn.");
				MESSAGE.send('rejected', {
					message: "400",
				}, player.client);
				return;
			}

			HOOKS.trigger('action:queue', ACTIONS[args.data.action], {
				state: state,
				data: args.data,
			});
		});
	}
);

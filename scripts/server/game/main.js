
define(
	[CONFIG.platform+'/database', 'shared/dispatch',
	 './state_handler', './victory_handler', './sync_handler'],
	function(DATABASE, DISPATCH) {
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
				this.respond({
					binary: {
						message: "500",
					},
				);
				return;
			}

			if (player.active == false) {
				DEBUG.error("Player", player.id, "tried to act when it was not their turn.");
				this.respond({
					binary: {
						message: "400",
					},
				);
				return;
			}

			HOOKS.trigger('action:queue', ACTIONS[args.data.action], {
				state: state,
				data: args.data,
			});

			// TODO: Check that the action queueing succeeded before we respond.
			this.respond({
				binary: {
					message: "300",
					number: player.action_points,
				},
			);
		});
	}
);

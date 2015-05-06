
define(
	['shared/util', 'shared/actions/all', 'shared/message', 'shared/state/hex', 'shared/state/edge', 'shared/state/unit', 'shared/state/team', 'shared/directions'],
	function(UTIL, ACTIONS, MESSAGE, HEX, EDGE, UNIT, TEAM, DIRECTIONS) {

		HOOKS.on('game:action', function(args) {
			var data = args.data;
			var state = args.state;
			var player = state.player(data.player_id);

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

			HOOKS.trigger('action:queue', ACTIONS[data.action], {
				state: state,
				data: data,
			});
		});

		HOOKS.on('action:queue', function(args) {
			var data = args.data;
			var state = args.state;

			if (state.meta._action_queue[this.order] == null) {
				state.meta._action_queue[this.order] = [];
			}

			DEBUG.flow("Queueing up an action", data);
			state.meta._action_queue[this.order].push({
				data: data,
			});

			if ('player_id' in data) {
				var player = state.player(data.player_id);

				// TODO: This is a hack.
				if (this.key == 'skip') {
					player.action_points = 0;
				} else {
					player.action_points -= this.cost;
				}

				if ('unit_id' in data) {
					unit = player.unit(data.unit_id);

					if (unit.position != null) {
						data.position = [unit.position.q, unit.position.r];
					}
				}

				MESSAGE.send('confirm', {
					player_id: data.player_id,
					number: player.action_points,
				});
			}
		}, HOOKS.ORDER_EXECUTE);

	}
);


define(
	['shared/util', 'shared/actions/all', 'shared/message', 'shared/state/hex', 'shared/state/edge', 'shared/state/unit', 'shared/state/team'],
	function(UTIL, ACTIONS, MESSAGE, HEX, EDGE, UNIT, TEAM) {

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

			// TODO: Check if targets are valid.

			var action = ACTIONS[data.action];

			if (state.meta.action_queue[action.order] == null) {
				state.meta.action_queue[action.order] = [];
			}

			state.meta.action_queue[action.order].push({
				data: data,
			});

			// Tell all clients that this use has taken their turn.
			// TODO: We only really need to tell the other clients that this guy has finished.

			DEBUG.temp("Telling clients that player", player.id, 'is inactive');
			MESSAGE.send('update', [{
				type: 'player',
				player_id: player.id,
				active: false,
			}]);

			state.meta.ready_players++;

			DEBUG.temp("ready players is", state.meta.ready_players, "of", state.meta.player_count)
			if (state.meta.ready_players >= state.meta.player_count) {
				state.meta.ready_players = 0;

				execute_actions(state);

				state.meta.action_queue = [];
				state.meta.update_queue = {};
			}

			// If all players are ready this will trigger a sync. So it must be done last.
			// TODO: Refactor this though, the 'ready_players' variable should be tracking when a sync occurs.
			player.active = false;
		});

		function execute_actions(state) {
			var action_queue = state.meta.action_queue;
			for (var order in action_queue) {
				for (var i = action_queue[order].length - 1; i >= 0; i--) {
					var action_data = action_queue[order][i].data;
					var action = ACTIONS[action_data.action];
					var unit = null;

					if ('player_id' in action_data && 'unit_id' in action_data) {
						unit = state.player(action_data.player_id).unit(action_data.unit_id);

						if (unit.position != null) {
							action_data.position = [unit.position.q, unit.position.r];
						}
					}

					if (action.check_for_unit != false && unit != null && !(action.key in unit.type.actions)) {
						// This unit is not able to perform that action, so skip it.
						DEBUG.fatal("Unit tried to execute", "'"+action.key+"'", "without access.", "Type:", unit.type);
						continue;
					}

					DEBUG.temp("Executing action", action.key);
					action_queue[order][i].affected_hexes = action.execute(state, action_data);
				}
			}

			send_actions(state);
		}

		function send_actions(state) {
			var players = state.players();

			for (var key in players) {
				var player = players[key];
				DEBUG.temp('SEND ACTIONS TO #'+player.id);

				var updates = [];
				var action_queue = state.meta.action_queue;
				for (var order in action_queue) {
					for (var i = action_queue[order].length - 1; i >= 0; i--) {
						var action_data = action_queue[order][i].data;
						var action = ACTIONS[action_data.action];

						DEBUG.temp('checking visibility for', action.key, action_queue[order][i].affected_hexes);
						if (check_visibility(state, player, action_queue[order][i].affected_hexes) || (action_data.player_id === player.id && action.key != "skip")) {
							DEBUG.temp('result is true');
							updates.push(action_data);
						}
					}
				}

				//updates = HOOKS.filter("game:send_actions", null, updates, player);
				MESSAGE.send('update', updates, player.client);
			};
		}

		function check_visibility(state, player, hexes) {
			for (var i = hexes.length - 1; i >= 0; i--) {
				var q = hexes[i][0];
				var r = hexes[i][1];
				var hex = state.hex(q, r);

				if (hex != null) {
					DEBUG.temp(player.id, ':', hexes[i], player.team.visibility(hex));
					if (player.team.visibility(hex) > TEAM.VISION_NONE) {
						return true;
					}
				}
			}

			return false;
		} 
	}
);

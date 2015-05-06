
define(
	['shared/util', 'shared/actions/all', 'shared/message', 'shared/state/team'],
	function(UTIL, ACTIONS, MESSAGE, TEAM) {

		HOOKS.on('meta:new', function() {
			reset_data(this);

			this.queue_update = function(args) {
				var key = args.object.key;

				if (key == null) {
					DEBUG.fatal("Tried to queue an object without a key");
				}

				if (!(key in this._update_queue)) {
					this._update_queue[key] = {
						type: args.type,
						object: args.object,
						values: {},
					};
				}

				var entry = this._update_queue[key];
				var group_key = 'all';

				if ('team' in args) {
					group_key = args.team.key;
				} else if ('player' in args) {
					group_key = args.player.key;
				}

				if (args.values == null) {
					entry.values[group_key] = 'all';
				} else {
					entry.values[group_key] = UTIL.union(entry.values[group_key], args.values);
				}
			};

			this.dequeue_update = function(key, player) {
				var entry = this._update_queue[key];
				var data_obj = {};

				var global_values = entry.values['all'];
				var team_values = entry.values[player.team.key];
				var player_values = entry.values[player.key];

				if ([global_values, team_values, player_values].indexOf('all') !== -1) {
					HOOKS.trigger(entry.type+':data', entry.object, {
						data: data_obj,
						player: player,
					});
				} else {
					values = UTIL.union(global_values, team_values, player_values);

					HOOKS.trigger(entry.type+':data', entry.object, {
						data: data_obj,
						include: values,
						player: player,
					});
				}

				return data_obj;
			};
		});

		HOOKS.on('state:sync', function() {
			execute_actions(this);
			reset_data(this.meta);
		}, HOOKS.ORDER_FIRST);

		function reset_data(meta) {
			meta._action_queue = [];
			meta._update_queue = {};
		}

		function execute_actions(state) {
			var action_queue = state.meta._action_queue;
			for (var order in action_queue) {
				for (var i = action_queue[order].length - 1; i >= 0; i--) {
					var action_data = action_queue[order][i].data;
					var action = ACTIONS[action_data.action];

					ACTIONS.execute(action_data.action, state, action_data);
				}
			}

			send_actions(state);
		}

		function send_actions(state) {
			var players = state.players();

			for (var key in players) {
				var player = players[key];

				var updates = [];

				DEBUG.flow("Processing action queue.");
				var action_queue = state.meta._action_queue;
				for (var order in action_queue) {
					for (var i = action_queue[order].length - 1; i >= 0; i--) {
						var action_data = action_queue[order][i].data;
						var action = ACTIONS[action_data.action];

						DEBUG.flow("Checking action visibility for player", player.id, "and action", action.key);
						var tiles = action.affected_hexes(action_data);
						var team = state.player(action_data.player_id).team;

						if ((team === player.team || check_any_visible(state, player, tiles)) && action.key != "skip") {
							updates.push(action_data);
						}
					}
				}

				DEBUG.flow("Processing update queue.");
				for (var key in state.meta._update_queue) {
					updates.push(state.meta.dequeue_update(key, player));
				}

				MESSAGE.send('sync', updates, player.client);
			};
		}

		function check_any_visible(state, player, tiles) {
			for (var i = tiles.length - 1; i >= 0; i--) {
				var tile = tiles[i];

				if (tile.hidden != true) {
					var hex = state.hex(tile.q, tile.r);

					if (hex != null) {
						DEBUG.temp(player.id, ':', tile.q, tile.r, '=', player.team.visibility(hex));
						if (player.team.visibility(hex) > TEAM.VISION_NONE) {
							return true;
						}
					}
				}
			}

			return false;
		}

		HOOKS.on('hex:change_visibility', function(args) {
			if (args.new_value > TEAM.VISION_HIDDEN && args.old_value <= TEAM.VISION_HIDDEN) {
				this.parent_state.meta.queue_update({
					type: 'hex',
					object: this,
					team: args.team,
				});
			}
		});

		HOOKS.on('team:change_points', function() {
			this.parent_state.meta.queue_update({
				type: 'team',
				object: this,
				values: ['points'],
			});
		});

		HOOKS.on('hex:change_owner', function() {
			this.parent_state.meta.queue_update({
				type: 'hex',
				object: this,
				values: ['owner'],
			});
		});

		HOOKS.on('hex:change_lockdown', function() {
			this.parent_state.meta.queue_update({
				type: 'hex',
				object: this,
				values: ['lockdown'],
			});
		});
	}
);

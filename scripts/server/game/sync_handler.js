
define(
	['shared/util', 'server/database', 'shared/actions/all', 'shared/message', 'shared/state/team'],
	function(UTIL, DATABASE, ACTIONS, MESSAGE, TEAM) {

		HOOKS.on('meta:new', function() {
			//this._synced_clients = DATABASE.integer(this, 'synced_client_count');
			this._action_list = DATABASE.list(this, 'actions');
			this._action_queue = [];
			this._update_queue = DATABASE.hash(this, 'updates');
			// TODO: Figure out when to clear the above collections.

			this.queue_update = function(args) {
				var key = args.object.key;

				if (key == null) {
					DEBUG.fatal("Tried to queue an object without a key");
				}

				var entry = this._update_queue.get(key);

				if (entry == null) {
					entry = {
						type: args.type,
						values: {},
					};
				}

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

				this._update_queue.set(key, JSON.stringify(entry));
			};

			this.dequeue_update = function(key, player) {
				var entry = this._update_queue.get(key);
				var data_obj = {};

				var global_values = entry.values['all'];
				var team_values = entry.values[player.team.key];
				var player_values = entry.values[player.key];

				var object = this.parent_state[entry.type](key);

				if ([global_values, team_values, player_values].indexOf('all') !== -1) {
					HOOKS.trigger(entry.type+':data', object, {
						data: data_obj,
						player: player,
					});
				} else {
					values = UTIL.union(global_values, team_values, player_values);

					HOOKS.trigger(entry.type+':data', object, {
						data: data_obj,
						include: values,
						player: player,
					});
				}

				return data_obj;
			};
		});

		HOOKS.on('action:queue', function(args) {
			var data = args.data;
			var state = args.state;

			if (state.meta._action_queue[this.order] == null) {
				state.meta._action_queue[this.order] =  DATABASE.list(this, 'actions_'+this.order);
			}

			DEBUG.flow("Queueing up an action", data);
			state.meta._action_queue[this.order].push(data);
			state.meta._action_list.push(data);

			var player = state.player(data.player_id);

			if (this.key == 'skip') {
				// TODO: This is a hack.
				player.action_points = 0;
			} else {
				player.action_points -= this.cost;
			}

			// TODO: Communicate the reduction in action points to other players.

			if ('unit_id' in data) {
				// Attach the unit's position to this action.
				unit = player.unit(data.unit_id);

				if (unit.position != null) {
					data.position = [unit.position.q, unit.position.r];
				}
			}

			MESSAGE.send('confirm', {
				player_id: data.player_id,
				number: player.action_points,
			});
		}, HOOKS.ORDER_EXECUTE);

		HOOKS.on('state:sync', function() {
			var MAX_ORDER_INDEX = 7; // TODO: Define this in an extensible way.
			var order_index = 0;

			while (order_index <= MAX_ORDER_INDEX) {
				if (order_index in this.meta._action_queue) {
					var loop = true;

					while (loop) {
						var entry = this.meta._action_queue[order_index].pop();

						if (entry != null) {
							ACTIONS.execute(entry.action, this, entry);
						} else {
							loop = false;
						}
					}
				}
			}

			synchronize_game_state(this);
		}, HOOKS.ORDER_FIRST);

		function synchronize_game_state(state) {
			var players = state.players();

			for (var key in players) {
				var player = players[key];

				var updates = [];

				DEBUG.flow("Processing action queue.");
				var action_list = state.meta._action_list.get();

				for (var i = action_list.length - 1; i >= 0; i--) {
					var action_data = action_list[order][i];
					var action = ACTIONS[action_data.action];

					DEBUG.flow("Checking action visibility for player", player.id, "and action", action.key);
					var tiles = action.affected_hexes(action_data);
					var team = state.player(action_data.player_id).team;

					if ((team === player.team || check_tile_visibility(state, player, tiles)) && action.key != "skip") {
						updates.push(action_data);
					}
				}

				DEBUG.flow("Processing update queue.");
				for (var key in state.meta._update_queue) {
					updates.push(state.meta.dequeue_update(key, player));
				}

				MESSAGE.send('sync', updates, player.client);
			};
		}

		function check_tile_visibility(state, player, tiles) {
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

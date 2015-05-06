
define(
	['shared/message', 'shared/util', 'shared/directions', 'shared/state/team', 'server/actions_handler', 'server/rout', 'server/sync'],
	function(MESSAGE, UTIL, DIRECTIONS, TEAM) {
		var object = {

			reset: function(state, player_id) {
				var data = [];

				// Add meta data to tell the player what his id is.
				// This information MUST be added first,
				// otherwise when the player gets the data they won't know when a player id refers to themselves.
				var meta_data = {};
				HOOKS.trigger('meta:data', state.meta, {
					data: meta_data,
					player: state.player(player_id),
				});

				data.push(meta_data);
				// ===== ===== ===== =====

				// Add data for all players.
				var players = state.players();
				for (var i in players) {
					var player = players[i];

					if (!player.active) {
						var player_data = {};
						HOOKS.trigger('player:data', player, {
							data: player_data
						});

						data.push(player_data);
					}

					var units = player.units();
					for (var key in units) {
						var unit_data = {};
						HOOKS.trigger('unit:data', units[key], {
							data: unit_data,
						});

						data.push(unit_data);
					}
				}

				// Add all the hex data.
				var hexes = state.hexes();
				for (var key in hexes) {
					var hex = hexes[key];

					if (hex.type != null) {
						var hex_data = {};
						HOOKS.trigger('hex:data', hex, {
							data: hex_data,
							player: state.player(player_id),
						});

						data.push(hex_data);
					}
				}

				// Add all the edge data.
				var edges = state.edges();
				for (var key in edges) {
					var edge_data = {};
					HOOKS.trigger('edge:data', edges[key], {
						data: edge_data,
					});
					
					data.push(edge_data);
				}

				// Check if the reply has contents.
				if (data.length > 0) {
					// If so, send the update back to the requestor.
					MESSAGE.send('reset', data, state.player(player_id).client);
				}
			},
		};

		HOOKS.on('state:new', function() {
			DEBUG.game("Generating new game.");
			var board_density = 0.5;
			var mirrored = false;
			var qMax = this.max_q();

			this.meta.player_count = 2; // TODO: Define thie elsewhere.

			if (mirrored) {
				qMax = Math.floor(CONFIG.board.width / 2);
			}

			var spawn_chance = 0.035;
			var relay_chance = 0.025;
			var access_chance = 0.03;
			var accel_chance = 2.3;

			for (var qN = this.min_q(); qN <= qMax; qN++) {
				var rMin = this.min_r(qN);
				var rMax = this.max_r(qN);

				for (var rN = rMin; rN <= rMax; rN++) {
					var q = qN;
					var r = rN;

					if (Math.random() < spawn_chance) {
						this.hex(q, r).type = 'uplink';
						spawn_chance -= 0.005;
					} else {
						//spawn_chance += 0.001;
					}

					/*if (Math.random() < relay_chance) {
						this.hex(q, r).type = 'relay';
						relay_chance -= 0.025;
					} else {
						//relay_chance += 0.001;
					}*/

					if (Math.random() < access_chance) {
						this.hex(q, r).type = 'access';
						access_chance -= 0.03;
					} else {
						//access_chance += 0.0005;
					}

					for (var i in DIRECTIONS.keys) {
						if (Math.random() < board_density) {
							var key = DIRECTIONS.keys[i];

							if (key != 'south' && key != 'north') {
								var q2 = q + DIRECTIONS[key].offset.q;
								var r2 = r + DIRECTIONS[key].offset.r;
								var edge = this.edge(q, r, q2, r2);
								edge.active = true;
							}
						}
					}

					if (mirrored) {
						q = CONFIG.board.width - qN;
						r = this.max_r(q) - rN + rMin;

						for (var i in DIRECTIONS.keys) {
							var key = DIRECTIONS.keys[i];
							var q2 = qN + DIRECTIONS[key].offset.q;
							var r2 = rN + DIRECTIONS[key].offset.r;
							var mirrored_edge = this.edge(qN, rN, q2, r2);

							if (mirrored_edge.active) {
								key = DIRECTIONS[key].opposite;
								q2 = q + DIRECTIONS[key].offset.q;
								r2 = r + DIRECTIONS[key].offset.r;
								var edge = this.edge(q, r, q2, r2)
								edge.active = true;
								edge.cost = mirrored_edge.cost;
							}
						}
					}
				}
			}

			/* When it was enabled this was causing some serious weirdness.
			var queue = [ this.hex(6, 1) ];
			var decayed_chance = accel_chance;

			while (queue.length > 0 && decayed_chance > 0.2) {
				var hex = queue.pop();
				var chance = decayed_chance;

				loop:
				while (chance > 0) {
					var keys = UTIL.shuffle(DIRECTIONS.keys);

					for (var i in keys) {
						var direction = DIRECTIONS[keys[i]];

						if (Math.random() <= chance / Math.ceil(chance)) {
							hex.edge(direction).cost = 0;

							var neighbour = hex.neighbour(direction);
							if (neighbour != null) {
								queue.push(neighbour);
							}

							chance -= 1;
							break loop;
						}	
					}
				}

				decayed_chance -= 0.2;
			}*/
		});

		return object;
	}
);

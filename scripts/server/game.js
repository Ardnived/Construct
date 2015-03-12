
define(
	['shared/message', 'shared/directions', 'shared/state/team', 'server/actions_handler'],
	function(MESSAGE, DIRECTIONS, TEAM) {
		var object = {

			reset: function(state, player_id) {
				var data = [];

				// Add meta data to tell the player what his id is.
				// This information MUST be added first,
				// otherwise when the player gets the data they won't know when a player id refers to themselves.
				data.push({
					type: 'meta',
					player_id: player_id,
					number: state.meta.player_count,
					// TODO: Send whatever units this player has.
				});
				// ===== ===== ===== =====

				// Add all the hex data.
				var hexes = state.hexes();
				for (var key in hexes) {
					var hex = hexes[key];

					if (hex.type != null) {
						data.push({
							type: 'hex',
							position: [hex.q, hex.r],
							hex_type: hex.type.key,
						});
					}
				}

				// Add data for all players.
				var players = state.players();
				for (var i in players) {
					var player = players[i];

					if (!player.active) {
						data.push({
							type: 'player',
							player_id: player.id,
							active: player.active,
						});
					}

					var units = player.units();
					for (var key in units) {
						var unit = units[key];

						var dat = {
							type: 'unit',
							unit_id: unit.id,
							player_id: unit.owner.id,
							unit_type: unit.type.key,
						};

						if (unit.position != null) {
							dat.position = [unit.position.q, unit.position.r];
						}

						data.push(dat);
					}
				}

				// Add all the edge data.
				var edges = state.edges();
				for (var key in edges) {
					var edge = edges[key];

					var dat = {
						type: 'edge',
						positions: [
							[edge.q1, edge.r1],
							[edge.q2, edge.r2],
						],
						active: edge.active,
					};

					if (edge.cost != 1) {
						dat.number = edge.cost;
					}

					data.push(dat);
				}

				// Check if the reply has contents.
				if (data.length > 0) {
					// If so, send the update back to the requestor.
					MESSAGE.send('update', data, state.player(player_id).client);
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
								//edge.cost = (Math.random() < 0.2) ? 0 : 1;
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
		});

		HOOKS.on('player:change_points', function() {
			// TODO: This information could be transmitted a lot more efficiently.
			MESSAGE.send('update', [{
				type: 'player',
				player_id: this.id,
				number: this.points,
			}]);
		});

		// TODO: Fix this function.
		HOOKS.on('hex:change_visibility', function(args) {
			if (args.new_value <= TEAM.VISION_HIDDEN) {
				return;
			}

			var data = {
				type: 'hex',
				position: [this.q, this.r],
				player_id: (this.owner != null) ? this.owner.id : null,
				units: {},
				edges: [],
			};

			var units = this.units();
			for (var p in units) {
				var owner = this.parent_state.player(p);

				if (owner.team != args.team) {
					var unit_group = [];
					for (var u in units[p]) {
						// TODO: Check if the unit is hidden.
						unit_group.push(units[p][u].id);
					}

					if (unit_group.length > 0) {
						data.units[p] = unit_group;
					}
				}
			}

			for (var i in DIRECTIONS.keys) {
				var key = DIRECTIONS.keys[i];
				
				if (this.edge(DIRECTIONS[key]).active) {
					data.edges.push(key);
				}
			}

			var players = this.parent_state.players();
			for (var p in players) {
				var player = players[p];
				var clients = [];

				if (player.team == args.team) {
					clients.push(player.client);
				}

				MESSAGE.send('update', [data], player.client);
			}
		})

		return object;
	}
);

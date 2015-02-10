
define(
	['shared/message', 'shared/directions', 'shared/actions/all'],
	function(message, directions, actions_list) {
		var object = {

			reset: function(state, player_id) {
				var data = [];

				// Add meta data to tell the player what his id is.
				// This information MUST be added first,
				// otherwise when the player gets the data they won't know when a player id refers to themselves.
				data.push({
					type: 'meta',
					player: player_id,
					number: state.meta.player_count,
					// TODO: Send whatever units this player has.
				});
				// ===== ===== ===== =====

				// Add data for all players.
				var players = state.players();
				for (var i in players) {
					var player = players[i];

					if (player.active) {
						data.push({
							type: 'player',
							player: player.id,
							active: player.active,
						});
					}

					var units = player.units();
					for (var key in units) {
						var unit = units[key];

						var dat = {
							type: 'unit',
							unit: unit.id,
							player: unit.owner,
							unit_type: unit.type().key,
						};

						if (unit.q != null && unit.r != null) {
							dat.q = unit.q;
							dat.r = unit.r;
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
						q: [edge.q1, edge.q2],
						r: [edge.r1, edge.r2],
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
					message.send('update', data, state.player(player_id).client);
				}
			},
		};

		hooks.on('game:action', function(args) {
			var request = args.data;
			var state = args.state;

			if (!(request.player in state.players())) {
				debug.error("Non-existant player", player.id, "tried to act.");
				return;
			}

			var player = state.player(request.player);

			if (player.active == false) {
				debug.error("Player", player.id, "tried to act when it was not their turn.");
				return;
			}

			var action = actions_list[request.action];

			/*if (typeof request.q === 'number') {
				var target_q = [request.q];
				var target_r = [request.r];
			} else {
				var target_q = request.q;
				var target_r = request.r;
			}

			for (var i = action.targets.length - 1; i >= 0; i--) {
				var is_valid = action.targets[i];

				if (!is_valid(state, { q: target_q[i], r: target_r[i] }, request.player)) {
					debug.error("Player", player.id, "tried to use an action on an invalid target.");
					return;
				}
			};*/

			var update = [];
			update = update.concat(action.execute(state, request));

			hooks.trigger('player:update', player, {
				active: false,
			});

			update.push({
				type: 'player',
				player: request.player,
				active: false,
			});

			// TODO: Only push updates to all clients when everyone is ready.

			message.send('update', update);
		});

		hooks.on('state:new', function() {
			debug.game("Generating new game.");
			var board_density = 0.5;
			var mirrored = false;
			var qMax = this.max_q();

			this.meta.player_count = 2; // TODO: Define thie elsewhere.

			if (mirrored) {
				qMax = Math.floor(config.board.width / 2);
			}

			for (var qN = this.min_q(); qN <= qMax; qN++) {
				var rMin = this.min_r(qN);
				var rMax = this.max_r(qN);

				for (var rN = rMin; rN <= rMax; rN++) {
					var q = qN;
					var r = rN;

					for (var i in directions.keys) {
						if (Math.random() < board_density) {
							var key = directions.keys[i];

							if (key != 'south' && key != 'north') {
								var q2 = q + directions[key].offset.q;
								var r2 = r + directions[key].offset.r;
								var edge = this.edge(q, r, q2, r2);
								//debug.temp(q, r, q2, r2, this.in_bounds(q, r, q2, r2));
								edge.active = true;
								//edge.cost = (Math.random() < 0.2) ? 0 : 1;
							}
						}
					}

					if (mirrored) {
						q = config.board.width - qN;
						r = this.max_r(q) - rN + rMin;

						for (var i in directions.keys) {
							var key = directions.keys[i];
							var q2 = qN + directions[key].offset.q;
							var r2 = rN + directions[key].offset.r;
							var mirrored_edge = this.edge(qN, rN, q2, r2);

							if (mirrored_edge.active) {
								key = directions[key].opposite;
								q2 = q + directions[key].offset.q;
								r2 = r + directions[key].offset.r;
								var edge = this.edge(q, r, q2, r2)
								edge.active = true;
								edge.cost = mirrored_edge.cost;
							}
						}
					}
				}
			}
		});

		return object;
	}
);

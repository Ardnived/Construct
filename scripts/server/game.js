
define(
	['shared/state', 'shared/logic', 'shared/message', 'shared/directions'],
	function(state, logic, message, directions) {
		var object = {

			reset: function(state, player_id) {
				var data = [];

				// Add meta data to tell the player what his id is.
				// This information MUST be added first,
				// otherwise when the player gets the data they won't know who it is addressed to.
				data.push({
					type: 'meta',
					player: player_id,
					/*unit: [
						'sniffer',
						'sniffer',
						'sniffer',
					],*/
				});
				// ===== ===== ===== =====
				
				// Add data for all players.
				var players = state.players();
				for (var i in players) {
					var player = players[i];
					// TODO: Fix this calculation.
					var inprogress = true; //player.turn <= board.player.other(player.id).turn;
					
					if (player.turn > 0 || inprogress == false) {
						data.push({
							type: 'player',
							player: player.id,
							turn: player.turn,
							active: inprogress ? 1 : 0,
						});
					}

					var units = player.units();
					for (var key in units) {
						var unit = units[key];

						data.push({
							type: 'unit',
							unit: unit.id,
							player: unit.owner,
							q: unit.q,
							r: unit.r,
						});
					}
				}				
				// Add all the edge data.
				var edges = state.edges();
				for (var key in edges) {
					var edge = edges[key];

					data.push({
						type: 'edge',
						q: [edge.q1, edge.q2],
						r: [edge.r1, edge.r2],
						active: edge.active,
					});
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

			// TODO: Check that the request comes from a real player.
			// TODO: Check that it is the player's turn.
			// TODO: Check that the action is valid.

			requirejs(
				['shared/actions'],
				function(actions) {
					var update = [];
					update = update.concat(actions[request.action].execute(state, request));

					// TODO: Update the player turns.

					message.send('update', update);
				}
			);
		});

		hooks.on('state:new', function() {
			debug.game("Generating new game.");
			var board_density = 0.5;
			var mirrored = false;
			var qMax = this.max_q();

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
							var q2 = q + directions[key].offset.q;
							var r2 = r + directions[key].offset.r;

							this.edge(q, r, q2, r2).active = true;
						}
					}

					if (mirrored) {
						q = config.board.width - qN;
						r = this.max_r(q) - rN + rMin;

						for (var i in directions.keys) {
							var key = directions.keys[i];
							var q2 = qN + directions[key].offset.q;
							var r2 = rN + directions[key].offset.r;

							if (this.edge(qN, rN, q2, r2).active) {
								key = directions[key].opposite;
								q2 = q + directions[key].offset.q;
								r2 = r + directions[key].offset.r;

								this.edge(q, r, q2, r2).active = true;
							}
						}
					}
				}
			}
		});

		return object;
	}
);

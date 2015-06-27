
define(
	['shared/state/player', 'shared/state/team', 'shared/state/hex', 'shared/state/edge', 'shared/state/meta', 'shared/directions', 'shared/message', 'shared/round'],
	function(PLAYER, TEAM, HEX, EDGE, META, DIRECTIONS, MESSAGE) {
		function state(id) {
			this.id = id;
			this._next_player_index = 0;
			this._player_list = [];
			this._edge_list = {};
			this._hex_list = {};
			this._team_list = {};
			this.meta = META.create(this);
		}

		state.prototype = {
			hex: function(q, r) {
				var key;
				
				if (typeof q === 'string') {
					key = q;
					var position = HEX.parse_key(key);
					q = position.q;
					r = position.r;
				} else {
					key = HEX.key(q, r);
				}

				if (this.in_bounds(q, r)) {
					if (!(key in this._hex_list)) {
						this._hex_list[key] = HEX.create(this, q, r);
					}

					return this._hex_list[key];
				} else {
					DEBUG.error("Attempted to retrieve an out of bounds hex.", q, r);
					return null;
				}
			},

			hexes: function(q, r) {
				if (typeof q === 'undefined') {
					return this._hex_list;
				} else if (typeof r === 'undefined') {
					var results = [];
					for (var r = this.max_r(q); r >= this.min_r(q); r--) {
						results.push(this.hex(q, r));
					};

					return results;
				} else {
					var result = [];

					for (var i = DIRECTIONS.keys.length - 1; i >= 0; i--) {
						var offset = DIRECTIONS[DIRECTIONS.keys[i]].offset;

						if (this.in_bounds(q + offset.q, r + offset.r)) {
							result.push(this.hex(q + offset.q, r + offset.r));
						}
					}

					return result;
				}
			},

			edge: function(q1, r1, q2, r2) {
				var key;
				
				if (typeof q1 === 'string') {
					key = q1;
					var position = EDGE.parse_key(key);
					q1 = position.q1;
					r1 = position.r1;
					q2 = position.q2;
					r2 = position.r2;
				} else {
					key = EDGE.key(q1, r1, q2, r2);
				}

				if (this.in_bounds(q1, r1, q2, r2)) {
					if (!(key in this._edge_list)) {
						this._edge_list[key] = EDGE.create(this, q1, r1, q2, r2);
					}

					return this._edge_list[key];
				} else {
					DEBUG.error("Attempted to retrieve an out of bounds edge.", q1, r1, q2, r2);
					return null;
				}
			},

			edges: function(q, r) {
				if (typeof q !== 'undefined' && typeof r !== 'undefined') {
					var result = [];

					if (this.in_bounds(q, r)) {
						for (var i = DIRECTIONS.keys.length - 1; i >= 0; i--) {
							var offset = DIRECTIONS[DIRECTIONS.keys[i]].offset;

							result.push(this.edge(q, r, q + offset.q, r + offset.r));
						}
					}

					return result;
				} else {
					return this._edge_list;
				}
			},

			player: function(player_index) {
				var key;

				if (typeof player_index === 'string') {
					key = player_index;
					player_index = PLAYER.parse_key(key);
				} else {
					key = PLAYER.key(player_index);
				}

				if (player_index != null && player_index != NaN && player_index < this.meta.player_count) {
					if (this._player_list[key] == null) {
						this._player_list[key] = PLAYER.create(this, player_index);
					}

					return this._player_list[key];
				} else {
					return null;
				}
			},

			players: function() {
				return this._player_list;
			},

			team: function(team_index) {
				var key;

				if (typeof team_index === 'string') {
					key = team_index;
					team_index = TEAM.parse_key(key);
				} else {
					key = TEAM.key(team_index);
				}

				if (team_index != null && team_index != NaN) {
					if (this._team_list[key] == null) {
						this._team_list[key] = TEAM.create(this, team_index);
					}

					return this._team_list[key];
				} else {
					return null;
				}
			},

			teams: function() {
				return this._team_list;
			},

			in_bounds: function(q1, r1, q2, r2) {
				if (typeof q2 !== 'undefined') {
					result = DIRECTIONS.find(q2 - q1, r2 - r1) != null
						&& ((this.min_q() <= q1 && q1 <= this.max_q() && this.min_r(q1) <= r1 && r1 <= this.max_r(q1))
						|| (this.min_q() <= q2 && q2 <= this.max_q() && this.min_r(q2) <= r2 && r2 <= this.max_r(q2)));
				} else {
					result = (this.min_q() <= q1 && q1 <= this.max_q() && this.min_r(q1) <= r1 && r1 <= this.max_r(q1));
				}

				if (!result) {
					DEBUG.error("Tried to access an out of bounds location", q1, r1, q2, r2);
				}

				return result;
			},

			distance: function(q1, r1, q2, r2) {
				return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(q1 + r1 - q2 - r2)) / 2;
			},

			path: function(qStart, rStart, qEnd, rEnd, limit) {
				if (qStart === qEnd && rStart === rEnd) {
					return [{ q: qStart, r: rStart }];
				}

				var closed_list = {};
				var open_list = {};
				var came_from = {};
				var actual_cost = {};
				var estimate_cost = {};

				if (typeof limit === 'undefined') limit = 10;

				var start_key = HEX.key(qStart, rStart);
				open_list[start_key] = { q: qStart, r: rStart };
				open_list.count = 1;
				actual_cost[start_key] = 0;
				estimate_cost[start_key] = this.distance(qStart, rStart, qEnd, rEnd);

				var head = null;
				var head_key = null;
				var success = false;

				while (open_list.count > 0) {
					var head_heuristic = Number.POSITIVE_INFINITY;

					for (var key in open_list) {
						if (key === 'count') continue;

						if (estimate_cost[key] < head_heuristic) {
							head_key = key;
							head_heuristic = estimate_cost[key];
						}
					}

					if (head_heuristic > limit) {
						success = false;
						break;
					}

					closed_list[head_key] = open_list[head_key];
					delete open_list[head_key];
					open_list.count--;

					head = closed_list[head_key];

					if (this.distance(head.q, head.r, qEnd, rEnd) == 0) {
						success = true;
						break;
					}

					for (var i = DIRECTIONS.keys.length - 1; i >= 0; i--) {
						var offset = DIRECTIONS[DIRECTIONS.keys[i]].offset;
						var qN = head.q + offset.q;
						var rN = head.r + offset.r;
						var key = HEX.key(qN, rN);

						if (key in closed_list) {
							continue;
						}

						var edge = this.edge(head.q, head.r, qN, rN);
						var test_actual_cost = actual_cost[head_key] + edge.cost;

						if (head_key in open_list && actual_cost[key] <= test_actual_cost) {
							continue;
						}

						if (edge == null || edge.active == false) {
							continue;
						}

						if (!(head_key in open_list)) {
							open_list[key] = { q: qN, r: rN };
							open_list.count++;
						}

						came_from[key] = head_key;
						actual_cost[key] = test_actual_cost;
						estimate_cost[key] = test_actual_cost + this.distance(qN, rN, qEnd, rEnd);
					};
				}

				if (success) {
					DEBUG.temp('build path');
					var path = [];

					while (head_key in closed_list) {
						head = closed_list[head_key];
						path.push(head);

						head_key = came_from[head_key];
					};

					return path;
				} else {
					return null;
				}
			},

			min_q: function() { return 1; },
			max_q: function() { return CONFIG.board.width - 1; },
			min_r: function(q) { return -Math.floor(q / 2); },
			max_r: function(q) { return (CONFIG.board.height + ((q + 1) % 2)) - Math.floor(q / 2); },
		};

		HOOKS.on('state:sync', function() {
			var active_player_count = 0;

			var hexes = this.hexes();
			for (var k in hexes) {
				HOOKS.trigger('hex:sync', hexes[k], this.meta.round);
			}

			for (var i = this.meta.player_count - 1; i >= 0; i--) {
				var player = this.player(i);

				if (player.playing) {
					player.active = true;
					active_player_count++;
					HOOKS.trigger('player:sync', player, this.meta.round);
				}
			}

			var teams = this.teams()
			for (var k in teams) {
				HOOKS.trigger('team:sync', teams[k], this.meta.round);
			}

			HOOKS.trigger('meta:sync', this.meta, this.meta.round);

			if (active_player_count <= 1 && CONFIG.platform === 'server') {
				// If there's only one player left, that means they've won.
				// TODO: Implement victory.
				for (var i = this.meta.player_count - 1; i >= 0; i--) {
					var player = this.player(i);

					if (player.playing) {
						MESSAGE.send('gameover', {
							message: "200", // Victory
						}, player.client);
					} else {
						MESSAGE.send('gameover', {
							message: "100", // Defeat
						}, player.client);
					}
				}
				
				DEBUG.flow('========= GAME OVER =========');
			}
		}, HOOKS.ORDER_EXECUTE);

		HOOKS.on('state:sync', function() {
			DEBUG.flow('--------- PROCESSING TURN ---------');
		}, HOOKS.ORDER_FIRST * 2);

		HOOKS.on('state:sync', function() {
			DEBUG.flow('--------- SYNCED ---------');
		}, HOOKS.ORDER_LAST * 2);

		return state;
	}
);

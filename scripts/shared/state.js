
define(
	['shared/state/player', 'shared/state/hex', 'shared/state/edge', 'shared/directions'],
	function(player, hex, edge, directions) {
		function state(id) {
			this.id = id;
			this._next_player_index = 0;
			this._player_list = {};
			this._edge_list = {};
			this._hex_list = {};
			this.meta = {};
		}

		function make_key(q1, r1, q2, r2) {
			if (arguments.length > 2) {
				if (q1 > q2) {
					var temp = q1;
					q1 = q2;
					q2 = temp;

					temp = r1;
					r1 = r2;
					r2 = temp;
				}

				return q1+','+r1+'/'+q2+','+r2;
			} else {
				return q1+','+r1;
			}
		}

		state.prototype = {
			hex: function(q, r) {
				if (this.in_bounds(q, r)) {
					var key = make_key(q, r);
					if (!(key in this._hex_list)) {
						this._hex_list[key] = hooks.trigger('hex:new', new hex(this, q, r));
					}

					return this._hex_list[key];
				} else {
					return null;
				}
			},

			hexes: function(q) {
				if (typeof q === 'undefined') {
					return this._hex_list;
				} else {
					var results = [];
					for (var r = this.max_r(q); r >= this.min_r(q); r--) {
						results.push(this.hex(q, r));
					};

					return results;
				}
			},

			edge: function(q1, r1, q2, r2) {
				if (this.in_bounds(q1, r1, q2, r2)) {
					var key = make_key(q1, r1, q2, r2);

					if (!(key in this._edge_list)) {
						this._edge_list[key] = hooks.trigger('edge:new', new edge(this, q1, r1, q2, r2));
					}

					return this._edge_list[key];
				} else {
					return null;
				}
			},

			edges: function() {
				return this._edge_list;
			},

			new_player: function(user_id) {
				var player_id = this._next_player_index;
				this._next_player_index++;
				
				var player = this.player(player_id);
				player.user_id = user_id;

				return player_id;
			},

			player: function(player_id) {
				if (typeof player_id === 'undefined') {
					return null;
				} else {
					if (!(player_id in this._player_list)) {
						this._player_list[player_id] = hooks.trigger('player:new', new player(this, player_id));
					}

					return this._player_list[player_id];
				}
			},

			players: function() {
				return this._player_list;
			},

			in_bounds: function(q1, r1, q2, r2) {
				if (typeof q2 !== 'undefined') {
					return directions.find(q2 - q1, r2 - r1) != null
						&& ((this.min_q() <= q1 && q1 <= this.max_q() && this.min_r(q1) <= r1 && r1 <= this.max_r(q1))
						|| (this.min_q() <= q2 && q2 <= this.max_q() && this.min_r(q2) <= r2 && r2 <= this.max_r(q2)));
				} else {
					return (this.min_q() <= q1 && q1 <= this.max_q() && this.min_r(q1) <= r1 && r1 <= this.max_r(q1));
				}
			},

			min_q: function() { return 1; },
			max_q: function() { return config.board.width - 1; },
			min_r: function(q) { return -Math.floor(q / 2); },
			max_r: function(q) { return (config.board.height + ((q + 1) % 2)) - Math.floor(q / 2); },
		};

		return state;
	}
);

hooks.on('state:update', function(updates) {
	debug.flow('got state:update');
	for (var i in updates) {
		var data = updates[i];
		var object = null;

		switch (data.type) {
			case 'hex':
				object = this.hex(data.q, data.r);
				break;
			case 'edge':
				object = this.edge(data.q[0], data.r[0], data.q[1], data.r[1]);
				break;
			case 'player':
				object = this.player(data.player);
				break;
			case 'unit':
				object = this.player(data.player).unit(data.unit);
				break;
			case 'meta':
				//debug.temp("TODO: Implement the meta:update handler", data);
				this.meta.local_player_id = data.player;

				// TODO: This is client-side only code, it shouldn't be in the shared folder.
				document.getElementById('local_player_title').innerHTML = "Player "+data.player;
				continue;
			default:
				// Do nothing
				break;
		}

		hooks.trigger(data.type+':update', object, data);
	}
});

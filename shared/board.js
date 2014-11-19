// Import data for a nodejs module.
if (typeof module !== 'undefined') {
	var hex = require("../shared/abstract_hex");
	var edge = require("../shared/abstract_edge");
	var directions = require("../library/misc").directions;
	var hooks = require("../shared/hooks");
	var utility = require("../shared/utility");
	var debug = require("../server/debug");
}

var board = {};

board.meta = {
	max_turns: 3,
	round_length: 3,
	width: 12,
	height: 8,
	min_q: function() { return 1; },
	max_q: function() { return this.width - 1; },
	min_r: function(q) { return -Math.floor(q / 2); },
	max_r: function(q) { return (this.height + ((q + 1) % 2)) - Math.floor(q / 2); },
	min: { q: Number.POSITIVE_INFINITY, r: Number.POSITIVE_INFINITY },
	max: { q: Number.NEGATIVE_INFINITY, r: Number.NEGATIVE_INFINITY },

	new_round: function () {
		this.round_length = this.max_turns;
	}
};

board.player = {
	// ==================== PUBLIC ==================== //
	set: function(id, data) {
		if (!this.has(id)) {
			this._players[id] = {
				id: id,
				turn: 1,
				inprogress: 1
			}
		}

		if (data != null) {
			for (var key in data) {
				this._players[id][key] = data[key];
			}
		}

		return this._players[id];
	},
	
	get: function(id) {
		if (id == null) {
			return null;
		} else if (this.has(id)) {
			return this._players[id];
		} else {
			return this.set(id);
		}
	},
	
	remove: function(id) {
		delete this._players[id];
	},

	has: function(id) {
		return id in this._players;
	},
	
	all: function() {
		return this._players;
	},

	is_opponent: function(id) {
		return id != null && !this.is_self(id);
	},

	is_self: function(id) {
		return id == this._self;
	},

	self: function(id) {
		if (typeof id !== 'undefined') {
			this._self = id;
		}

		return this.get(this._self);
	},

	other: function(id) {
		return this.get(id === 1 ? 0 : 1);
	},
	
	
	// ==================== PRIVATE ==================== //
	_self: null, // Only makes sense on the client-side.
	_players: {},
	_increment: 0
};

board.hex = {
	// ==================== PUBLIC ==================== //
	add: function(q, r) {
		var instance = new hex.instance(q, r);
		this._grid[this._key(q, r)] = instance;
		
		if (q > board.meta.max.q) board.meta.max.q = q;
		if (q < board.meta.min.q) board.meta.min.q = q;
		if (r > board.meta.max.r) board.meta.max.r = r;
		if (r < board.meta.min.r) board.meta.min.r = r;
		
		return instance;
	},
	
	get: function(q, r) {
		return this._grid[this._key(q, r)];
	},
	
	remove: function(q, r) {
		delete this._grid[this._key(q, r)];
	},
	
	has: function(q, r) {
		return this._key(q, r) in this._grid;
	},
	
	all: function() {
		return this._grid;
	},
	
	distance: function(q1, r1, q2, r2) {
		return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(q1 + r1 - q2 - r2)) / 2;
	},
	
	neighbour: function(q, r, direction) {
		return this.get(q + direction.offset.q, r + direction.offset.r);
	},
	
	neighbours: function(q, r) {
		var results = [];
		
		for (var name in directions) {
			var hex = this.neighbour(q, r, directions[name]);
			
			if (hex != undefined) {
				results.push(hex);
			}
		}
		
		return results;
	},
	
	edge: function(q, r, direction) {
		return board.edge.get(q, r, q + direction.offset.q, r + direction.offset.r);
	},
	
	edges: function(q, r) {
		var results = [];
		
		for (var i in directions.keys) {
			var name = directions.keys[i];
			var edge = this.edge(q, r, directions[name]);
			
			if (edge != undefined) {
				results.push(edge);
			}
		}
		
		return results;
	},
	
	get_x: function(q, r) {
		return board.meta.offset.x + (q * this.width);
	},
	
	get_y: function(q, r) {
		return board.meta.offset.y + (r + q/2) * this.height;
	},
	
	
	// ==================== PRIVATE ==================== //
	_grid: {},
	
	_key: function(q, r) {
		return q+","+r;
	}
};

board.edge = {
	// ==================== PUBLIC ==================== //
	add: function(q1, r1, q2, r2) {
		var instance = new edge.instance(q1, r1, q2, r2);
		this._grid[this._key(q1, r1, q2, r2)] = instance;
		return instance;
	},
	
	get: function(q1, r1, q2, r2) {
		return this._grid[this._key(q1, r1, q2, r2)];
	},
	
	remove: function(q1, r1, q2, r2) {
		delete this._grid[this._key(q1, r1, q2, r2)];
	},
	
	has: function(q1, r1, q2, r2) {
		return this._key(q1, r1, q2, r2) in this._grid;
	},
	
	all: function() {
		return this._grid;
	},

	angle: function(q1, r1, q2, r2) {
		return directions.find(q2 - q1, r2 - r1).angle;
	},
	
	neighbours: function(q1, r1, q2, r2) {
		return [board.hex.get(q1, r1), board.hex.get(q2, r2)];
	},

	get_x: function(q1, r1, q2, r2) {
		return (board.hex.get_x(q1, r1) + board.hex.get_x(q2, r2)) / 2;
	},

	get_y: function(q1, r1, q2, r2) {
		return (board.hex.get_y(q1, r1) + board.hex.get_y(q2, r2)) / 2;
	},
	
	// ==================== PRIVATE ==================== //
	_grid: {},
	
	_key: function(q1, r1, q2, r2) {
		if (q1 > q2) {
			low_q = q2;
			high_q = q1;
		} else {
			low_q = q1;
			high_q = q2;
		}
		
		if (r1 > r2) {
			low_r = r2;
			high_r = r1;
		} else {
			low_r = r1;
			high_r = r2;
		}
		
		return low_q+","+low_r+"/"+high_q+","+high_r;
	}
};

board.hex.type = {
	hex: function(data, player) {
		return data.hasOwnProperty('q') && data.hasOwnProperty('r')
			&& board.hex.get(data.q, data.r) != null;
	},
	empty_hex: function(data, player) {
		return board.hex.type.hex(data, player)
			&& board.hex.get(data.q, data.r).struct() == null;
	},
	struct: function(data, player) {
		return board.hex.type.hex(data, player)
			&& board.hex.get(data.q, data.r).struct() != null;
	},
	owned_hex: function(data, player) {
		return board.hex.type.hex(data, player)
			&& board.hex.get(data.q, data.r).owner() == player;
	},
	owned_empty_hex: function(data, player) {
		return board.hex.type.empty_hex(data, player)
			&& board.hex.get(data.q, data.r).owner() == player;
	},
	owned_struct: function(data, player) {
		return board.hex.type.struct(data, player)
			&& board.hex.get(data.q, data.r).owner() == player;
	},
};

// =========== DEFINE CONSTANTS =========== //
hooks.on('init_board', function() {
	board.hex.size = 30;
	board.hex.width = 1.5 * board.hex.size;
	board.hex.height = Math.sqrt(3) * board.hex.size;
	board.hex.scale = 100 * board.hex.height/80;

	board.edge.offset = {
		x: board.hex.width - 5,
		y: board.hex.height - 30,
	};
	
	board.meta.offset = {
		x: (canvas.width - (12/2 * 3 * board.hex.size)) / 2,
		y: 60
	};
});



// Export data for a nodejs module.
if (typeof module !== 'undefined') {
	exports.hex = board.hex;
	exports.edge = board.edge;
	exports.player = board.player;
	exports.meta = board.meta;
}
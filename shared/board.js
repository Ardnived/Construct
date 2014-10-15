// Import data for a nodejs module.
if (typeof exports !== 'undefined') {
	var hex = require("../server/hex");
	var edge = require("../server/edge");
	var directions = require("../library/misc").directions;
	var hooks = require("../shared/hooks");
	var utility = require("../shared/utility");
}

var TURNS_IN_A_ROUND = 3;

var board = {
	round_length: TURNS_IN_A_ROUND,
	
	new_round: function () {
		this.round_length = TURNS_IN_A_ROUND;
	}
};

board.player = {
	// ==================== PUBLIC ==================== //
	add: function(name) {
		this._players[this._increment](name);
		this._increment++;
		return this._increment;
	},
	
	get: function(id) {
		return this._players[id];
	},
	
	remove: function(id) {
		delete this._players[id];
	},
	
	all: function() {
		return this._players;
	},
	
	opponent: function(id) {
		if (id == 0) {
			return 1;
		} else {
			return 0;
		}
	},
	
	
	// ==================== PRIVATE ==================== //
	_players: {},
	_increment: 0
};

board.hex = {
	// ==================== PUBLIC ==================== //
	add: function(q, r) {
		var instance = new hex.instance(q, r);
		this._grid[this._key(q, r)] = instance;
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
		return board.offset_x + (q * this.width);
	},
	
	get_y: function(q, r) {
		return board.offset_y + (r + q/2) * this.height;
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
	empty_tile: function(data) {
		return this.empty_hex(data) || this.empty_edge(data);
	},
	empty_hex: function(data) {
		return data.hasOwnProperty(q) && data.hasOwnProperty(r)
			&& board.hex.get(q, r).struct == null;
	},
	empty_edge: function(data) {
		return data.hasOwnProperty(q1) && data.hasOwnProperty(r1)
			&& data.hasOwnProperty(q2) && data.hasOwnProperty(r2)
			&& board.hex.get(q1, r1, q2, r2).struct == null;
	},
	tile: function(data) {
		return this.hex(data) || this.edge(data);
	},
	hex: function(data) {
		return data.hasOwnProperty(q) && data.hasOwnProperty(r)
			&& board.hex.get(q, r) != null;
	},
	edge: function(data) {
		return data.hasOwnProperty(q1) && data.hasOwnProperty(r1)
			&& data.hasOwnProperty(q2) && data.hasOwnProperty(r2)
			&& board.hex.get(q1, r1, q2, r2) != null;
	},
	struct: function(data) {
		return this.node(data) || this.gate(data);
	},
	node: function(data) {
		return this.hex(data)
			&& board.hex.get(q, r).struct != null;
	},
	gate: function(data) {
		return this.edge(data)
			&& board.hex.get(q1, r1, q2, r2).struct != null;
	}
};

// =========== DEFINE CONSTANTS =========== //
hooks.on('init_board', function() {
	board.hex.size = 30;
	board.hex.width = 1.5 * board.hex.size;
	board.hex.height = Math.sqrt(3) * board.hex.size;
	board.hex.scale = 100 * board.hex.height/80;

	board.edge.offset = {
		x: board.hex.width - 5,
		y: board.hex.height - 15
	};
	
	board.offset_x = (canvas.width - (12/2 * 3 * board.hex.size)) / 2;
	board.offset_y = 60;
	board.width = 0;
	board.height = 0;
});



// Export data for a nodejs module.
if (typeof exports !== 'undefined') {
	exports.hex = board.hex;
	exports.edge = board.edge;
}
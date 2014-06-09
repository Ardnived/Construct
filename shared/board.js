// Import data for a nodejs module.
if (typeof exports !== 'undefined') {
	var tile = require("../server/tile");
	var edge = require("../server/edge");
	var directions = require("../data/misc").directions;
}

board.tile = {
	// ==================== PUBLIC ==================== //
	add: function(q, r) {
		var instance = new tile.instance(q, r);
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
	
	neighbour: function(q, r, direction) {
		return this.get(q + direction.offset.q, r + direction.offset.r);
	},
	
	neighbours: function(q, r) {
		var results = [];
		
		for (var name in directions) {
			var tile = this.neighbour(q, r, directions[name]);
			
			if (tile != undefined) {
				results.push(tile);
			}
		}
		
		return results;
	},
	
	edge: function(q, r, direction) {
		return exports.edge.get(q, r, q + direction.offset.q, r + direction.offset.r);
	},
	
	edges: function(q, r) {
		var results = [];
		
		for (var name in directions) {
			var edge = this.edge(q, r, directions[name]);
			
			if (edge != undefined) {
				results.push(edge);
			}
		}
		
		return results;
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
	
	neighbours: function(q1, r1, q2, r2) {
		return [exports.tile.get(q1, r1), exports.tile.get(q2, r2)];
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

// Export data for a nodejs module.
if (typeof exports !== 'undefined') {
	exports.tile = board.tile;
	exports.edge = board.edge;
}
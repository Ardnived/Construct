
var Board = {
	// ==================== PUBLIC ==================== //
	add: function(q, r) {
		tile = new Tile(q, r);
		this._grid[this._key(q, r)] = tile;
		tile._hexagon.add();
		
		return tile;
	},
	
	get: function(q, r) {
		return this._grid[this._key(q, r)];
	},
	
	has: function(q, r) {
		return this._key(q, r) in this._grid;
	},
	
	
	// ==================== PRIVATE ==================== //
	_grid: {},
	
	_key: function(q, r) {
		return q+","+r;
	}
};

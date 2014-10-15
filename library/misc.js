var directions = {
	north: {
		id: 'n',
		offset: {q: +0, r: -1},
		angle: Math.PI / 3 * 4.5 * (180 / Math.PI)
	},
	northwest: {
		id: 'nw',
		offset: {q: -1, r: +0},
		angle: Math.PI / 3 * 3.5 * (180 / Math.PI)
	},
	northeast: {
		id: 'ne',
		offset: {q: +1, r: -1},
		angle: Math.PI / 3 * 5.5 * (180 / Math.PI)
	},
	south: {
		id: 's',
		offset: {q: +0, r: +1},
		angle: Math.PI / 3 * 1.5 * (180 / Math.PI)
	},
	southwest: {
		id: 'sw',
		offset: {q: -1, r: +1},
		angle: Math.PI / 3 * 2.5 * (180 / Math.PI)
	},
	southeast: {
		id: 'se',
		offset: {q: +1, r: +0},
		angle: Math.PI / 3 * 0.5 * (180 / Math.PI)
	},
	
	keys: ["north", "northwest", "northeast", "south", "southwest", "southeast"],
	
	get: function(id) {
		for (var name in directions) {
			var direction = directions[name];
			
			if (direction.id == id) {
				return direction;
			}
		}
	},
	
	find: function(q, r) {
		for (var i in directions.keys) {
			var direction = directions[directions.keys[i]];
			
			if (direction.offset.q == q && direction.offset.r == r) {
				return direction;
			}
		}
	}
};

// Export data for a nodejs module.
if (typeof exports !== 'undefined') {
	exports.directions = directions;
}
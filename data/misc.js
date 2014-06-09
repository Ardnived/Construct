Directions = {
	north: {
		id: 'n',
		offset: {q: +0, r: -1},
		angle: Math.PI / 3 * 4.5
	},
	northwest: {
		id: 'nw',
		offset: {q: -1, r: +0},
		angle: Math.PI / 3 * 3.5
	},
	northeast: {
		id: 'ne',
		offset: {q: +1, r: -1},
		angle: Math.PI / 3 * 5.5
	},
	south: {
		id: 's',
		offset: {q: +0, r: +1},
		angle: Math.PI / 3 * 1.5
	},
	southwest: {
		id: 'sw',
		offset: {q: -1, r: +1},
		angle: Math.PI / 3 * 2.5
	},
	southeast: {
		id: 'se',
		offset: {q: +1, r: +0},
		angle: Math.PI / 3 * 0.5
	},
	
	keys: ["north", "northwest", "northeast", "south", "southwest", "southeast"],
	
	get: function(id) {
		for (var name in Directions) {
			var direction = Directions[name];
			
			if (direction.id == id) {
				return direction;
			}
		}
	}
};

// Export data for a nodejs module.
if (typeof exports !== 'undefined') {
	exports.directions = Directions;
}
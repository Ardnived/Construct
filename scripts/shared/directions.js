
define(
	{
		north: {
			key: 'north',
			offset: {q: +0, r: -1},
			angle: Math.PI / 3 * 4.5 * (180 / Math.PI),
			opposite: 'south',
			compliment: 'south',
			mirror: 'south',
		},
		northwest: {
			key: 'northwest',
			offset: {q: -1, r: +0},
			angle: Math.PI / 3 * 3.5 * (180 / Math.PI),
			opposite: 'southeast',
			compliment: 'southwest',
			mirror: 'northeast',
		},
		northeast: {
			key: 'northeast',
			offset: {q: +1, r: -1},
			angle: Math.PI / 3 * 5.5 * (180 / Math.PI),
			opposite: 'southwest',
			compliment: 'southeast',
			mirror: 'northwest',
		},
		south: {
			key: 'south',
			offset: {q: +0, r: +1},
			angle: Math.PI / 3 * 1.5 * (180 / Math.PI),
			opposite: 'north',
			compliment: 'north',
			mirror: 'north',
		},
		southwest: {
			key: 'southwest',
			offset: {q: -1, r: +1},
			angle: Math.PI / 3 * 2.5 * (180 / Math.PI),
			opposite: 'northeast',
			compliment: 'northwest',
			mirror: 'southeast',
		},
		southeast: {
			key: 'southeast',
			offset: {q: +1, r: +0},
			angle: Math.PI / 3 * 0.5 * (180 / Math.PI),
			opposite: 'northwest',
			compliment: 'northeast',
			mirror: 'southwest',
		},
		
		keys: ["north", "northwest", "northeast", "south", "southwest", "southeast"],
		
		get: function(key) {
			return this[key];
		},
		
		find: function(q, r) {
			for (var i in this.keys) {
				var direction = this[this.keys[i]];
				
				if (direction.offset.q == q && direction.offset.r == r) {
					return direction;
				}
			}

			return null;
		}
	}
);
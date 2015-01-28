
var hex_path = 'shared/abstract_hex';

if (!config.is_server) {
	hex_path = 'client/hex';
}

define(
	[hex_path, 'shared/directions'],
	function(construct, directions) {
		var self = {
			key: function(q, r) {
				return q+","+r;
			},
		};

		var STATE = null;
		
		return {
			attach: function(object) {
				object.hex = {
					using: function(state) {
						STATE = state;
						return this;
					},

					add: function(q, r) {
						var instance = new construct(object, q, r);
						STATE.hexes[self.key(q, r)] = instance;
						//debug.flow("create hex", self.key(q, r), instance);
						
						if (q > STATE.max.q) STATE.max.q = q;
						if (q < STATE.min.q) STATE.min.q = q;
						if (r > STATE.max.r) STATE.max.r = r;
						if (r < STATE.min.r) STATE.min.r = r;
						
						return instance;
					},
					
					get: function(q, r) {
						return STATE.hexes[self.key(q, r)];
					},
					
					remove: function(q, r) {
						delete STATE.hexes[self.key(q, r)];
					},
					
					has: function(q, r) {
						return self.key(q, r) in STATE.hexes;
					},
					
					all: function() {
						return STATE.hexes;
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
						return object.edge.get(q, r, q + direction.offset.q, r + direction.offset.r);
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

					min_q: function() { return 1; },
					max_q: function() { return config.board.width - 1; },
					min_r: function(q) { return -Math.floor(q / 2); },
					max_r: function(q) { return (config.board.height + ((q + 1) % 2)) - Math.floor(q / 2); },
				};
			}
		};
	}
);

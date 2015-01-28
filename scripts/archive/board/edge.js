
var edge_path = 'shared/abstract_edge';

if (!config.is_server) {
	edge_path = 'client/edge';
}

define(
	[edge_path, 'shared/directions'],
	function(construct, directions) {
		var self = {
			key: function(q1, r1, q2, r2) {
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
			},
		};

		var STATE = null;
		
		return {
			attach: function(object) {
				object.edge = {
					using: function(state) {
						STATE = state;
						return this;
					},

					add: function(q1, r1, q2, r2) {
						var instance = new construct(object, q1, r1, q2, r2);
						STATE.edges[self.key(q1, r1, q2, r2)] = instance;
						return instance;
					},
					
					get: function(q1, r1, q2, r2) {
						var key = self.key(q1, r1, q2, r2);
						if (!(key in STATE.edges)) {
							STATE.edges[key] = {
								q1: q1,
								r1: r1,
								q2: q2,
								r2: r2,
								cost: 1, // The movement cost of traversing this edge.
								active: false,
							}
						}

						return STATE.edges[key];
					},
					
					all: function() {
						return STATE.edges;
					},
					
					neighbours: function(q1, r1, q2, r2) {
						return [object.hex.get(q1, r1), object.hex.get(q2, r2)];
					},
				};
			}
		};
	}
);

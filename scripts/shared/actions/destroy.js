
define(
	['shared/targets', 'shared/util'],
	function(TARGETS, UTIL) {
		return {
			key: 'destroy',
			targets: [{
				test: TARGETS.vacant,
				error: "invalid",
			}],
			order: 3,
			max_range: 1,
			cost: 1,
			execute: function(state, data) {
				UTIL.require_properties(['player_id', 'unit_id', 'positions'], data);

				var results = [];				
				var unit = state.player(data.player_id).unit(data.unit_id);
				var hex = state.hex(data.positions[0][0], data.positions[0][1]);
				
				var units = hex.units();
				for (var owner_id in units) {
					if (owner_id != data.player_id) {
						for (var unit_id in units[owner_id]) {
							units[owner_id][unit_id].position = null;
						}
					}
				}

				hex.clear_traps();
			},
			affected_hexes: function(data, future) {
				UTIL.require_properties(['positions', 'position'], data);

				return [{
					title: 'source',
					source: true,
					hidden: true,
					q: data.position[0],
					r: data.position[1],
				}, {
					title: (future ? 'destroying' : 'destroyed'),
					q: data.positions[0][0],
					r: data.positions[0][1],
				}];
			},
		};
	}
);
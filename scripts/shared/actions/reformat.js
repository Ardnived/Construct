
define(
	['shared/conditions', 'shared/util'],
	function(CONDITIONS, UTIL) {
		return {
			key: 'reformat',
			targets: [],
			order: 3,
			cost: 1,
			execute: function(state, data) {
				UTIL.require_properties(['player_id', 'unit_id'], data);

				var results = [];				
				var unit = state.player(data.player_id).unit(data.unit_id);
				var units = unit.hex.units();

				for (var owner_id in units) {
					if (owner_id != data.player_id) {
						for (var unit_id in units[owner_id]) {
							units[owner_id][unit_id].position = null;
						}
					}
				}
			},
			affected_hexes: function(data, future) {
				UTIL.require_properties(['position'], data);

				return [{
					title: (future ? 'reformatting' : 'reformatted'),
					source: true,
					q: data.position[0],
					r: data.position[1],
				}];
			},
		};
	}
);
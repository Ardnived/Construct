
define(
	['shared/targets', 'shared/util'],
	function(TARGETS, UTIL) {
		return {
			targets: [],
			order: 3,
			text: {
				name: 'reformat',
				future: 'reformatting',
				past: 'reformatted',
			},
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

				return [
					[unit.q, unit.r]
				];
			}
		};
	}
);
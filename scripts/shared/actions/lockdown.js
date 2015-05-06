
define(
	['shared/targets', 'shared/util'],
	function(TARGETS, UTIL) {
		return {
			key: 'lockdown',
			targets: [{
				test: TARGETS.hex,
				error: "invalid",
			}],
			order: 4,
			max_range: 1,
			cost: 1,
			execute: function(state, data) {
				UTIL.require_properties(['player_id', 'unit_id', 'positions'], data);
				state.hex(data.positions[0][0], data.positions[0][1]).lockdown = true;
			},
			affected_hexes: function(data, future) {
				UTIL.require_properties(['position'], data);

				return [{
					title: (future ? 'locking down' : 'locked down'),
					source: true,
					hidden: true,
					q: data.position[0],
					r: data.position[1],
				}];
			},
		};
	}
);

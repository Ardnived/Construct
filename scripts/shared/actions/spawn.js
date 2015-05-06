
define(
	['shared/targets', './move', 'shared/util'],
	function(TARGETS, MOVE, UTIL) {
		return {
			key: 'spawn',
			targets: [{
				test: TARGETS.spawnzone,
				error: 'needs uplink',
			}],
			order: 5,
			cost: 1,
			globally_available: true,
			execute: MOVE.execute,
			affected_hexes: function(data, future) {
				UTIL.require_properties(['positions'], data);

				return [{
					title: (future ? 'spawning' : 'spawned'),
					source: true,
					q: data.positions[0][0],
					r: data.positions[0][1],
				}];
			},
		};
	}
);
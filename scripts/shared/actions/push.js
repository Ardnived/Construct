
define(
	['shared/conditions', './move'],
	function(CONDITIONS, MOVE) {
		return {
			key: 'push',
			targets: MOVE.targets,
			order: MOVE.order,
			cost: 0,
			globally_available: true,
			execute: MOVE.execute,
			affected_hexes: function(data, future) {
				UTIL.require_properties(['positions', 'position'], data);

				return [{
					title: 'source',
					source: true,
					q: data.position[0],
					r: data.position[1],
				}, {
					title: (future ? 'pushing' : 'pushed'),
					q: data.positions[0][0],
					r: data.positions[0][1],
				}];
			},
		};
	}
);
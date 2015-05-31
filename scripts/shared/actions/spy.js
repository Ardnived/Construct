
define(
	['shared/conditions', 'shared/util', 'shared/round', 'shared/state/team'],
	function(CONDITIONS, UTIL, ROUND, TEAM) {
		return {
			key: 'spy',
			targets: [{
				conditions: [/* any */],
				error: "invalid",
			}],
			order: 0,
			cost: 1,
			execute: function(state, data) {
				UTIL.require_properties(['positions', 'player_id'], data);
				var hex = state.hex(data.positions[0][0], data.positions[0][1]);
				var interval_key = ROUND.interval(state.meta.round, ROUND.DURATION_LONG);

				state.player(data.player_id).team.visibility(hex, interval_key, TEAM.VISION_FULL);
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
					title: (future ? 'spying' : 'spied'),
					hidden: true,
					q: data.positions[0][0],
					r: data.positions[0][1],
				}];
			},
		};
	}
);
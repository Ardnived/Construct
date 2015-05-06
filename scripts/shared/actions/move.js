
define(
	['shared/targets', 'shared/util', 'shared/round', 'shared/state/team'],
	function(TARGETS, UTIL, ROUND, TEAM) {
		return {
			key: 'move',
			targets: [{
				test: TARGETS.traversable,
				error: "blocked",
			}],
			order: 1,
			cost: 1,
			globally_available: true,
			execute: function(state, data) {
				UTIL.require_properties(['positions', 'player_id', 'unit_id'], data);

				var player = state.player(data.player_id);
				var unit = player.unit(data.unit_id);
				var hex = state.hex(data.positions[0][0], data.positions[0][1]);
				
				unit.position = { q: hex.q, r: hex.r };

				// TODO: Reevaluate whether this should be here.
				player.team.visibility(hex, ROUND.INTERVAL_NONE, TEAM.VISION_PARTIAL);
				// ----------------
			},
			affected_hexes: function(data, future) {
				UTIL.require_properties(['positions', 'position'], data);

				return [{
					title: 'source',
					source: true,
					q: data.position[0],
					r: data.position[1],
				}, {
					title: (future ? 'moving' : 'moved'),
					q: data.positions[0][0],
					r: data.positions[0][1],
				}];
			},
		};
	}
);
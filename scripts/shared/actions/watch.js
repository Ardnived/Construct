
define(
	['shared/conditions', 'shared/util', 'shared/round', 'shared/state/team'],
	function(CONDITIONS, UTIL, ROUND, TEAM) {
		return {
			key: 'watch',
			targets: [],
			order: 0,
			cost: 1,
			execute: function(state, data) {
				UTIL.require_properties(['player_id', 'unit_id'], data);

				var player = state.player(data.player_id);
				var unit = player.unit(data.unit_id);
				var interval_key = ROUND.interval(state.meta.round, ROUND.DURATION_SHORT);
				var adjacent_hexes = state.hexes(unit.position.q, unit.position.r);

				for (var key in adjacent_hexes) {
					player.team.visibility(adjacent_hexes[key], interval_key, TEAM.VISION_PARTIAL);
				}

				// TODO: More efficient to remove this?
				player.team.visibility(unit.hex, interval_key, TEAM.VISION_PARTIAL);
			},
			affected_hexes: function(data, future) {
				UTIL.require_properties(['position'], data);

				return [{
					title: (future ? 'watching' : 'watched'),
					source: true,
					hidden: true,
					q: data.position[0],
					r: data.position[1],
				}];
			},
		};
	}
);
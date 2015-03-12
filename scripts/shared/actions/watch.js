
define(
	['shared/targets', 'shared/util', 'shared/round', 'shared/state/team'],
	function(TARGETS, UTIL, ROUND, TEAM) {
		return {
			targets: [],
			order: 0,
			text: {
				name: 'watch',
				future: 'watching',
				past: 'watcher',
			},
			execute: function(state, data) {
				UTIL.require_properties(['player_id', 'unit_id'], data);

				var player = state.player(data.player_id);
				var unit = player.unit(data.unit_id);
				var interval_key = ROUND.interval(state.meta.round, ROUND.DURATION_INSTANT);
				var adjacent_hexes = state.hexes(unit.position.q, unit.position.r);

				for (var key in adjacent_hexes) {
					player.team.visibility(adjacent_hexes[key], interval_key, TEAM.VISION_PARTIAL);
				}

				// TODO: More efficient to remove this?
				player.team.visibility(unit.hex, interval_key, TEAM.VISION_PARTIAL);

				return [];
			}
		};
	}
);

define(
	['shared/targets', 'shared/util', 'shared/round', 'shared/state/team'],
	function(TARGETS, UTIL, ROUND, TEAM) {
		return {
			targets: [{
				test: TARGETS.hex,
				error: "invalid",
			}],
			order: 0,
			text: {
				name: 'spy',
				future: 'spying',
				past: 'spied',
			},
			execute: function(state, data) {
				UTIL.require_properties(['positions', 'player_id'], data);
				var hex = state.hex(data.positions[0][0], data.positions[0][1]);
				var interval_key = ROUND.interval(state.meta.round, ROUND.DURATION_SHORT);

				state.player(data.player_id).team.visibility(hex, interval_key, TEAM.VISION_FULL);

				return [];
			}
		};
	}
);

define(
	['shared/targets', 'shared/util', 'shared/round', 'shared/state/team'],
	function(TARGETS, UTIL, ROUND, TEAM) {
		return {
			targets: [{
				test: TARGETS.vacant,
				error: "occupied",
			}],
			order: 1,
			text: {
				name: 'move',
				future: 'moving',
				past: 'moved',
			},
			check_for_unit: false,
			execute: function(state, data) {
				UTIL.require_properties(['positions', 'player_id', 'unit_id'], data);
				var affected_hexes = [
					data.positions[0],
				];

				var player = state.player(data.player_id);
				var unit = player.unit(data.unit_id);
				var hex = state.hex(data.positions[0][0], data.positions[0][1]);
				var old_position = unit.position;

				if (old_position != null) {
					affected_hexes.push([old_position.q, old_position.r]);
				}

				unit.position = { q: hex.q, r: hex.r };

				// TODO: Reevaluate whether this should be here.
				player.team.visibility(hex, ROUND.INTERVAL_NONE, TEAM.VISION_PARTIAL);
				// ----------------

				return affected_hexes;
			}
		};
	}
);
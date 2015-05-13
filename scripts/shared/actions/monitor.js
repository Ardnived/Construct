
requirejs(
	['shared/round', 'shared/state/team'],
	function(ROUND, TEAM) {
		HOOKS.on('unit:move', function(args) {
			if (args.new_position != null) {
				var hex = this.parent_state.hex(args.new_position.q, args.new_position.r);
				var traps = hex.traps('monitor');

				for (var i in traps) {
					var team_id = traps[i];

					if (team_id !== this.owner.team.id) {
						this.owner.team.visibility(hex, 'monitor', TEAM.VISION_NONE);
						hex.traps('monitor', team_id, false);
					}
				}
			}
		}, HOOKS.ORDER_LAST);
	}
);

define(
	['shared/targets', 'shared/util', 'shared/state/team'],
	function(TARGETS, UTIL, TEAM) {
		return {
			key: 'monitor',
			targets: [],
			order: 2,
			cost: 1,
			execute: function(state, data) {
				UTIL.require_properties(['player_id', 'unit_id'], data);
				
				var player = state.player(data.player_id);
				var unit = player.unit(data.unit_id);

				unit.owner.team.visibility(unit.hex, 'monitor', TEAM.VISION_HIDDEN);
				unit.hex.traps('monitor', player.team.id, true);
			},
			affected_hexes: function(data, future) {
				UTIL.require_properties(['position'], data);

				return [{
					title: (future ? 'planting monitor' : 'planted monitor'),
					source: true,
					hidden: true,
					q: data.position[0],
					r: data.position[1],
				}];
			},
		};
	}
);

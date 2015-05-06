
define(
	['shared/targets', 'shared/util'],
	function(TARGETS, UTIL) {
		return {
			key: 'prism',
			targets: [],
			order: 2,
			cost: 1,
			execute: function(state, data) {
				UTIL.require_properties(['player_id', 'unit_id'], data);
				
				var player = state.player(data.player_id);
				var unit = player.unit(data.unit_id);
				unit.hex.traps('prism', player.team.id, true);
			},
			affected_hexes: function(data, future) {
				UTIL.require_properties(['position'], data);

				return [{
					title: (future ? 'planting prism' : 'planted prism'),
					source: true,
					hidden: true,
					q: data.position[0],
					r: data.position[1],
				}];
			},
		};
	}
);

HOOKS.on('unit:move', function(args) {
	if (args.new_position != null) {
		var hex = this.parent_state.hex(args.new_position.q, args.new_position.r);
		var traps = hex.traps('prism');

		for (var i = traps.length - 1; i >= 0; i--) {
			var team_id = traps[i];

			if (team_id !== this.owner.team.id) {
				hex.lockdown = true;
				hex.traps('prism', team_id, false);
			}
		}
	}
});

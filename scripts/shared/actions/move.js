
define(
	['shared/targets', 'shared/util'],
	function(targets, util) {
		return {
			targets: [targets.empty],
			execute: function(state, data) {
				util.require_properties(['q', 'r', 'player', 'unit'], data);

				var unit = state.player(data.player).unit(data.unit)
				unit.position(data.q, data.r);

				return [{
					type: 'unit',
					player: data.player,
					unit: data.unit,
					q: data.q,
					r: data.r,
				}];
			}
		};
	}
);
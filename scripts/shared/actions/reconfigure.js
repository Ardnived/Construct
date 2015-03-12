
define(
	['shared/targets', 'shared/util'],
	function(TARGETS, UTIL) {
		return {
			targets: [],
			order: 4,
			text: {
				name: 'reconfigure',
				future: 'reconfiguring',
				past: 'reconfigured',
			},
			execute: function(state, data) {
				UTIL.require_properties(['player_id', 'unit_id'], data);

				var results = [];				
				var unit = state.player(data.player_id).unit(data.unit_id);
				var affected_hexes = [
					data.position,
				];
				var edges = state.edges(unit.position.q, unit.position.r);

				for (var i = edges.length - 1; i >= 0; i--) {
					var edge = edges[i];
					edge.active = !edge.active;

					if (edge.q1 != unit.position.q && edge.r1 != unit.position.r) {
						affected_hexes.push([edge.q1, edge.r1]);
					} else {
						affected_hexes.push([edge.q2, edge.r2]);
					}
				};

				return affected_hexes;
			}
		};
	}
);
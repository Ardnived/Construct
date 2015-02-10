
define(
	['shared/targets', 'shared/util'],
	function(targets, util) {
		return {
			targets: [],
			execute: function(state, data) {
				util.require_properties(['player', 'unit'], data);

				var results = [];				
				var unit = state.player(data.player).unit(data.unit);
				var edges = state.edges(unit.q, unit.r);

				for (var i = edges.length - 1; i >= 0; i--) {
					var edge = edges[i];
					edge.active = !edge.active;

					results.push({
						type: 'edge',
						q: [edge.q1, edge.q2],
						r: [edge.r1, edge.r2],
						active: edge.active,
					});
				};

				return results;
			}
		};
	}
);
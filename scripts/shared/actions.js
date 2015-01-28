
define(
	['shared/targets'],
	function(targets) {

		var root = {
			build: { // Build a unit.
				targets: [targets.empty],
				execute: function(state, data) {
					debug.temp('apply build', data);
					var unit = state.player(data.player).unit(data.unit)
					unit.position(data.q, data.r);

					return [
						{
							type: 'unit',
							player: data.player,
							unit: data.unit,
							q: data.q,
							r: data.r,
						},
					];
				}
			},
		};

		for (var key in root) {
			root[key].key = key;
		};

		return root;
	}
);

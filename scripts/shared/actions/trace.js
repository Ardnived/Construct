
define(
	['shared/targets', 'shared/util'],
	function(targets, util) {
		hooks.on('hex:unit_gained', function(unit) {
			this._last_unit = unit;
		});

		return {
			targets: [],
			execute: function(state, data) {
				util.require_properties(['q', 'r'], data);

				var hex = state.hex(data.q, data.r);

				if (hex != null) {
					// Reveal the unit.
					// hex._last_unit
				}
			},
		};
	}
);

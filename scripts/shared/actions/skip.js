
define(
	['shared/targets', 'shared/util'],
	function(TARGETS, UTIL) {
		return {
			targets: [],
			order: 1,
			check_for_unit: false,
			execute: function(state, data) {
				return [];
			}
		};
	}
);
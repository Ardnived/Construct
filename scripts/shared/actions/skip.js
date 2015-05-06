
define(
	['shared/targets', 'shared/util'],
	function(TARGETS, UTIL) {
		return {
			key: 'skip',
			targets: [],
			order: 1,
			cost: 1,
			globally_available: true,
			execute: function() {},
			affected_hexes: function() { return []; },
		};
	}
);
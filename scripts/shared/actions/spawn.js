
define(
	['shared/targets', './move'],
	function(TARGETS, MOVE) {
		return {
			targets: [{
				test: TARGETS.spawnzone,
				error: 'needs uplink',
			}],
			order: 5,
			text: {
				name: 'spawn',
				future: 'spawning',
				past: 'spawned',
			},
			check_for_unit: false,
			execute: MOVE.execute,
		};
	}
);
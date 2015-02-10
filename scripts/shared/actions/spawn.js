
define(
	['shared/targets', './move'],
	function(targets, move_action) {
		return {
			targets: [targets.empty],
			execute: move_action.execute,
		};
	}
);
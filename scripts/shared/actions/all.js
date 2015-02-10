
define(
	['./spawn', './move', './bug', './trace', './reconfigure'],
	function(spawn, move, bug, trace, reconfigure) {
		var root = {
			spawn: spawn,
			move: move,
			bug: bug,
			trace: trace,
			reconfigure: reconfigure,
		};

		for (var key in root) {
			root[key].key = key;
		};

		return root;
	}
);

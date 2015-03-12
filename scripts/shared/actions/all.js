
define(
	['./skip', './spawn', './move', './reconfigure', './reformat', './spy', './watch'],
	function(SKIP, SPAWN, MOVE, RECONFIGURE, REFORMAT, SPY, WATCH) {
		var root = {
			skip: SKIP,
			spawn: SPAWN,
			move: MOVE,
			reconfigure: RECONFIGURE,
			reformat: REFORMAT,
			spy: SPY,
			watch: WATCH,
		};

		for (var key in root) {
			root[key].key = key;
		};

		return root;
	}
);

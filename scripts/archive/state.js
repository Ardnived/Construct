
define(
	['shared/board', 'shared/directions'],
	function(board, directions) {
		function generate(state) {
			debug.game("Generating new game.");
			board.using(state);
			var board_density = 0.5;

			for (var qN = board.hex.min_q(); qN <= Math.floor(config.board.width / 2); qN++) {
				var rMin = board.hex.min_r(qN);
				var rMax = board.hex.max_r(qN);

				for (var rN = rMin; rN <= rMax; rN++) {
					var q = qN;
					var r = rN;

					board.hex.add(q, r);

					for (var i in directions.keys) {
						if (Math.random() < board_density) {
							var key = directions.keys[i];
							var q2 = q + directions[key].offset.q;
							var r2 = r + directions[key].offset.r;

							board.edge.add(q, r, q2, r2);
						}
					}

					q = config.board.width - qN;
					r = board.hex.max_r(q) - rN + rMin;

					board.hex.add(q, r);

					for (var i in directions.keys) {
						var key = directions.keys[i];

						if (board.hex.edge(qN, rN, directions[key]) != null) {
							key = directions[key].opposite;
							var q2 = q + directions[key].offset.q;
							var r2 = r + directions[key].offset.r;

							board.edge.add(q, r, q2, r2);
						}
					}
				}
			}
		}

		return function() {
			this.max = { q: Math.POSITIVE_INFINITY, r: Math.POSITIVE_INFINITY };
			this.min = { q: Math.NEGATIVE_INFINITY, r: Math.NEGATIVE_INFINITY };

			this.players = {};
			this.edges = {};
			this.hexes = {};

			if (config.is_server) {
				generate(this);
			}
		};
	}
);

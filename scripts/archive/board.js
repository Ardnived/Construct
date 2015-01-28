
define(
	['./board/player', './board/hex', './board/edge'],
	function(player, hex, edge) {
		var board = {};
		player.attach(board);
		hex.attach(board);
		edge.attach(board);

		board.using = function(state) {
			this.player.using(state);
			this.hex.using(state);
			this.edge.using(state);
			return this;
		}

		return board;
	}
);

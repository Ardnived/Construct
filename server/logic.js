var directions = require("../data/misc").directions;

exports.request_build = function(board, q, r, struct) {
	var tile = board.tile.get(q, r);
	
	if (tile.struct == null) {
		tile.struct = struct;
		console.log("set", struct);
		return true;
	} else {
		return false;
	}
};

exports.send_wave = function(board) {
	var edges = [];
	
	var q = 1;
	for (var r = 0; r < 10; r++) {
		if (board.edge.has(q, r, q + directions.southwest.offset.q, r + directions.southwest.offset.r)) {
			edges.push(board.edge.get(q, r, q + directions.southwest.offset.q, r + directions.southwest.offset.r));
		}
		
		if (board.edge.has(q, r, q + directions.northwest.offset.q, r + directions.northwest.offset.r)) {
			edges.push(board.edge.get(q, r, q + directions.northwest.offset.q, r + directions.northwest.offset.r));
		}
	}
	
	return edges;
};

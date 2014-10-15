var debug = require("../server/debug");
var directions = require("../library/misc").directions;

exports.request_build = function(board, q, r, struct) {
	debug.flow('request_build', q, r, struct);
	var hex = board.hex.get(q, r);
	
	if (hex.struct == null) {
		hex.struct = struct;
		debug.game("set struct "+struct);
		return true;
	} else {
		return false;
	}
};

exports.send_wave = function(board) {
	var reply = [];
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
	
	for (var i in edges) {
		update = new hs.request();
		update.type = hs.update_type.edge;
		update.q = [edges[i].q1, edges[i].q2];
		update.r = [edges[i].r1, edges[i].r2];
		update.player = 0;
		
		// Add to our reply.
		reply.push(update.get_data());
	}
	
	edges = [];
	q = 11;
	for (r = -5; r < 5; r++) {
		if (board.edge.has(q, r, q + directions.southwest.offset.q, r + directions.southwest.offset.r)) {
			edges.push(board.edge.get(q, r, q + directions.southwest.offset.q, r + directions.southwest.offset.r));
		}
		
		if (board.edge.has(q, r, q + directions.northwest.offset.q, r + directions.northwest.offset.r)) {
			edges.push(board.edge.get(q, r, q + directions.northwest.offset.q, r + directions.northwest.offset.r));
		}
	}
	
	for (i in edges) {
		update = new hs.request();
		update.type = hs.update_type.edge;
		update.q = [edges[i].q1, edges[i].q2];
		update.r = [edges[i].r1, edges[i].r2];
		update.player = 0;
		
		// Add to our reply.
		reply.push(update.get_data());
	}
	
	return edges;
};

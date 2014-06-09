/*
var playerstate = {
	allowed_clicks: {},
	prospective_build: null,
	
	key: function(q, r) {
		return q+","+r;
	}
};

exports.get_build_locations = function(board, struct) {
	var tiles = board.tile.all();
	var results = [];
	
	for (var key in tiles) {
		var tile = tiles[key];
		if (tile.struct == null) {
			results.push(tile);
			playerstate.allowed_clicks[playerstate.key(tile.q, tile.r)] = true;
		}
	}
	
	playerstate.prospective_build = struct;
	return results;
};
exports.request_build = function(board, q, r) {
	if (playerstate.key(q, r) in playerstate.allowed_clicks) {
		board.tile.get(q, r).struct = playerstate.prospective_build;
		playerstate.allowed_clicks = {};
		return true;
	} else {
		return false;
	}
};
*/

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
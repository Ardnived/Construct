if (typeof exports != 'undefined') {
	var directions = require("../library/misc").directions;
}

var logic = {};

logic.can_apply_action = function(board, player, action) {
	return board.tile.get(action.q, action.r).owner == player
		&& action.targets[0](action);
};

logic.is_turn_over = function(board) {
	var players = board.player.all();
	var turn;
	
	for (var i in players) {
		if (turn == null) {
			turn = players[i].turn;
		} else if (turn != players[i].turn) {
			return false;
		}
	}
	
	return true;
};

logic.is_round_over = function(board) {
	var players = board.player.all();
	
	for (var i in players) {
		if (players[i].turn < board.round_length) {
			return false;
		}
	}
	
	return true;
};

logic.resolve_round = function(board) {
	var players = board.player.all();
	
	for (var i in players) {
		players[i].turn = 0;
	}
};

if (typeof exports != 'undefined') {
	for (var property in logic) {
		exports[property] = logic[property];
	}
}
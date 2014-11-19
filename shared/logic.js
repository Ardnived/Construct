if (typeof exports != 'undefined') {
	var directions = require("../library/misc").directions;
	var structs = require("../library/struct").nodes;
	var actions = require("../library/action");
	var debug = require("../server/debug");
}

var logic = {};

logic.can_apply_action = function(board, player, action, targets) {
	action = actions.micro[action];

	for (var i = action.targets.length - 1; i >= 0; i--) {
		if (targets[i] == null || !action.targets[i](targets[i], player)) {
			return false;
		}
	};

	return true;
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
	
	for (var id in players) {
		if (players[id].turn <= board.meta.round_length) {
			// At least one player has a turn remaining. Terminate.
			debug.temp("Round has not ended because player", id, "has not completed all turns.");
			return;
		}
	}

	var pulselist = this.generate_wave(board);

	while (pulselist.length > 0) {
		debug.game("process", pulselist);
		pulselist = this.resolve_step(board, pulselist);
	}

	for (var id in players) {
		players[id].turn = 1;
		players[id].inprogress = 1;
	}
};

logic.generate_wave = function(board) {
	var pulselist = [];
	var pulse = null;
	var q, player;

	q = board.meta.min_q() - 1;
	player = 0;
	for (var r = board.meta.max_r(q); r >= board.meta.min_r(q); r--) {

		pulse = this.generate_pulse(board, q, r, directions.northeast, player);
		if (pulse != null) pulselist.push(pulse);

		pulse = this.generate_pulse(board, q, r, directions.southeast, player);
		if (pulse != null) pulselist.push(pulse);
	};

	q = board.meta.max_q() + 1;
	player = 1;
	for (var r = board.meta.max_r(q); r >= board.meta.min_r(q); r--) {
		pulse = this.generate_pulse(board, q, r, directions.northwest, player);
		if (pulse != null) pulselist.push(pulse);

		pulse = this.generate_pulse(board, q, r, directions.southwest, player);
		if (pulse != null) pulselist.push(pulse);
	};

	return pulselist;
};

logic.generate_pulse = function(board, q, r, direction, player) {
	if (board.hex.edge(q, r, direction) != null) {
		return {
			q: q,
			r: r,
			count: 2,
			direction: direction.key,
			owner: player
		}
	}
};

logic.resolve_step = function(board, pulselist) {
	var newlist = [];

	for (var i = pulselist.length - 1; i >= 0; i--) {
		var pulse = pulselist[i];
		var direction = directions[pulse.direction];
		var source = board.hex.get(pulse.q, pulse.r);
		var edge = board.hex.edge(pulse.q, pulse.r, direction);

		if (edge == null) {
			direction = directions.get(direction.compliment);
			edge = board.hex.edge(pulse.q, pulse.r, direction);
		}

		/*	// Careful of loops.
		if (edge == null) {
			direction = directions.get(direction.opposite);
			edge = board.hex.edge(pulse.q, pulse.r, direction);
		}
		*/

		/* // Can't go back the way we came.
		if (edge == null) {
			direction = directions.get(direction.compliment);
			edge = board.hex.edge(pulse.q, pulse.r, direction);
		}
		*/

		if (source != null && source.struct() != null) {
			pulse.count = structs[source.struct()].discharge(source, pulse.count, pulse.owner);
		}

		if (pulse.count < 1) {
			continue;
		}

		var target = board.hex.neighbour(pulse.q, pulse.r, direction);

		if (edge == null) {
			continue;
		}

		edge.owner(pulse.owner);

		if (target == null) {
			continue;
		}

		target.owner(pulse.owner);

		if (target.struct() != null) {
			pulse.count = structs[target.struct()].charge(target, pulse.count, pulse.owner);
		}

		if (pulse.count == 0) {
			continue;
		}

		pulse.direction = direction.key;
		pulse.q = target.q;
		pulse.r = target.r;

		newlist.push(pulse);
	};

	return newlist;
};

if (typeof exports != 'undefined') {
	for (var property in logic) {
		exports[property] = logic[property];
	}
}

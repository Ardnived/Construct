var board = require("../shared/board");
var logic = require("../server/logic");
var actions = require("../library/action");
var perks = require("../library/perk");
var directions = require("../library/misc").directions;
var debug = require("../server/debug");
var dispatch = require("../server/dispatch");
var message = require("../shared/message");

var MAX_TURN = 3;

var players = [{// Player 1
	turn : 1,
	client : null
}, {// Player 2
	turn : 1,
	client : null
}];

// TODO: Encapsulate this more.
exports.players = players;

var routes = {};
routes['click'] = on_request_click;
routes['action'] = on_request_action;
routes['cancel'] = on_request_cancel;

/**
 * Initialize the game, for now this means creating random connections.
 */
exports.create = function() {
	for (var qN = 1; qN < 12; qN++) {
		for (var rN = 0; rN < 10; rN++) {
			var q = qN;
			var r = rN - Math.floor(q / 2);

			board.hex.add(q, r);

			for (var i in directions.keys) {
				if (Math.random() < 0.5) {
					var key = directions.keys[i];
					board.edge.add(q, r, q + directions[key].offset.q, r + directions[key].offset.r);
				}
			}
		}
	}
};

/**
 * Routes standard game requests from the server.
 */
exports.on_request = function(data, client) {
	if (data.type in routes) {
		debug.game("Received Request", data);
		routes[data.type](board, data, client);
	} else {
		debug.game("Unrecognized request: " + data.type);
	}
};

/**
 * Resend all data to synchronize the client with the server.
 */
exports.refresh = function(client) {
	debug.game("Received Refresh");
	var hexs = board.hex.all();
	var edges = board.edge.all();
	var msg = new message.instance('update');
	msg.data = [];

	// Add meta data to tell the player what his id is.
	// This information MUST be added first,
	// otherwise when the player gets the data they won't know who it is addressed to.
	for (var i in players) {
		if (players[i].client === client) {
			msg.data.push({
				type : 'meta',
				player : parseInt(i)
			});
			break;
		}
	}
	// ===== ===== ===== =====

	// Add all the hex data.
	for (var i in hexs) {
		var hex = hexs[i];

		if (hex.struct != null) {
			var dat = {
				type : 'hex',
				q : hex.q,
				r : hex.r,
				struct : hex.struct
			};

			if (hex.struct != null) {
				dat.struct = hex.struct.id;
			}

			msg.data.push(dat);
		}
	}

	// Add all the edge data.
	for (var i in edges) {
		var edge = edges[i];
		var dat = {
			type : 'edge',
			q : [edge.q1, edge.q2],
			r : [edge.r1, edge.r2]
		};

		msg.data.push(dat);
	}

	// Add date for all players.
	for (var i in players) {
		var player = players[i];

		if (player.turn > 0) {
			msg.data.push({
				type : 'player',
				player : parseInt(i),
				turn : player.turn,
				//inprogress: player.turn <= opponent.turn
				// TODO: Fix this ^
			});
		}
	}

	// Check if the reply has contents.
	if (msg.data.length > 0) {
		// If so, send the update back to the requestor.
		msg.to(client).send();
	}
};

/**
 * A request from the client to build something on a hex.
 */
function on_request_action(board, request, client) {
	// TEST CODE
	request.struct = 'mainframe';
	// / TEST CODE

	var reply = [];

	// Make sure that this request is from the client.
	var player_id, opponent_id;
	if (players[0].client === client) {
		player_id = 0;
		opponent_id = 1;
	} else if (players[1].client === client) {
		player_id = 1;
		opponent_id = 0;
	} else {
		debug.game("Request from unexpected player.");
		return;
	}

	// Indicate who is who.
	var player = players[player_id];
	var opponent = players[opponent_id];
	
	// Check if it is not the player's turn.
	if (player.turn > opponent.turn || player.turn > MAX_TURN) {
		// Tell the client that we're rejecting it's request because it is not their turn.
		message.send('rejected', {
			message: "400"
		});
		return;
	}

	// Attempt the requested action.
	var success = logic.request_build(board, request.q, request.r, request.struct);

	// Check if we succeeded on the request.
	if (!success) {
		// Tell the client that we're rejecting it's request because the game logic has rejected the build.
		message.send('rejected', {
			message: "401"
		});
		return;
	}

	var msg = new message.instance('update');
	msg.data = [];

	// Indicate the new id for the requested struct.
	msg.data.push({
		type: 'hex',
		struct: request.struct,
		q: request.q,
		r: request.r
	});

	// Update the player's turn.
	player.turn++;

	msg.data.push({
		type: 'player',
		player: player_id,
		turn: player.turn,
		inprogress: (player.turn > opponent.turn) ? 0 : 1 // Should we tell the client that the player can currently take his turn?
	});

	// Check to see if we need to update the opponent's status.
	if (player.turn == opponent.turn) {
		// This means that the opponent was previously waiting for the player to take his turn.
		// Add an update to note that the opponent's turn is now in progress.
		msg.data.push({
			type: 'player',
			player: opponent_id,
			inprogress: 1
		});
	}

	// Send a game update to all players in the game.
	msg.send();

	_check_round_end();
};

function _check_round_end() {
	/*
	for (var index in players) {
	if (players[index].turn < MAX_TURN) {
	// At least one player has a turn remaining. Terminate.
	return;
	}
	}
	*/

	// Send a game update to all players in the game.
	//dispatch.io.to("game").emit(hs.message_type.update, logic.send_wave(board));
}

/**
 * Request sent when the user clicks on a hex.
 */
function on_request_click(board, request, client) {

};

/**
 * A request from the client to cancel the last request.
 */
function on_request_cancel(board, request, client) {

};

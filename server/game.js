var board = require("../shared/board");
var logic = require("../shared/logic");
var actions = require("../library/action");
var perks = require("../library/perk");
var directions = require("../library/misc").directions;
var debug = require("../server/debug");
var dispatch = require("../server/dispatch");
var message = require("../shared/message");

/**
 * Initialize the game, for now this means creating random connections.
 */
exports.create = function() {
	var board_density = 0.5;

	for (var qN = board.meta.min_q(); qN <= Math.floor(board.meta.width / 2); qN++) {
		var rMin = board.meta.min_r(qN);
		var rMax = board.meta.max_r(qN);

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

			q = board.meta.width - qN;
			r = board.meta.max_r(q) - rN + rMin;

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

	logic.resolve_round(board);
};

/**
 * Routes standard game requests from the server.
 */
exports.on_request = function(data, client) {
	var func_name = 'on_request_' + data.type;

	if (func_name != null) {
		debug.game("Received Request", data);
		request_handlers[func_name](board, data, client);
	} else {
		debug.game("Unrecognized request: " + data.type);
	}
};

/**
 * Resend all data to synchronize the client with the server.
 */
exports.on_refresh = function(client) {
	debug.game("Received Refresh");
	var msg = new message.instance('update');
	msg.data = [];

	var players = board.player.all();

	// Add meta data to tell the player what his id is.
	// This information MUST be added first,
	// otherwise when the player gets the data they won't know who it is addressed to.
	for (var i in players) {
		if (players[i].client === client) {
			msg.data.push({
				type: 'meta',
				player: parseInt(i)
			});
			break;
		}
	}
	// ===== ===== ===== =====
	
	// Add data for all players.
	for (var i in players) {
		var player = players[i];
		var inprogress = player.turn <= board.player.other(player.id).turn;
		
		if (player.turn > 0 || inprogress == false) {
			msg.data.push({
				type: 'player',
				player: parseInt(i),
				turn: player.turn,
				inprogress: inprogress ? 1 : 0,
			});
		}
	}
	
	// Add all the hex data.
	var hexes = board.hex.all();
	for (var i in hexes) {
		var hex = hexes[i];

		if (hex.struct() != null || hex.owner() != null) {
			var dat = {
				type: 'hex',
				q: hex.q,
				r: hex.r,
				charge: hex.charge(),
			};

			if (hex.struct() != null) {
				dat.struct = hex.struct();
			}

			if (hex.owner() != null) {
				dat.player = hex.owner();
			}

			msg.data.push(dat);
		}
	}
	
	// Add all the edge data.
	var edges = board.edge.all();
	for (var i in edges) {
		var edge = edges[i];
		var dat = {
			type: 'edge',
			q: [edge.q1, edge.q2],
			r: [edge.r1, edge.r2]
		};

		if (edge.owner() != null) {
			dat.player = edge.owner();
		}

		msg.data.push(dat);
	}
	
	// Check if the reply has contents.
	if (msg.data.length > 0) {
		// If so, send the update back to the requestor.
		msg.to(client).send();
	}
};

var request_handlers = {
	/**
	 * A request from the client to build something on a hex.
	 */
	on_request_action: function(board, request, client) {
		// TEST CODE
		request.struct = 'mainframe';
		// / TEST CODE

		var reply = [];

		// Make sure that this request is from the client.
		var player_id, opponent_id;
		if (board.player.get(0).client === client) {
			player_id = 0;
			opponent_id = 1;
		} else if (board.player.get(1).client === client) {
			player_id = 1;
			opponent_id = 0;
		} else {
			debug.game("Request from unexpected player.");
			return;
		}

		// Indicate who is who.
		var player = board.player.get(player_id);
		var opponent = board.player.get(opponent_id);
		
		// Check if it is not the player's turn.
		if (player.turn > opponent.turn || player.turn > board.round_length) {
			// Tell the client that we're rejecting it's request because it is not their turn.
			message.send('rejected', {
				message: "400"
			});
			return;
		}

		// Attempt the requested action.
		var success = logic.can_apply_action(board, player_id, request.action, [{
			q: request.q,
			r: request.r
		}]);

		// Check if we succeeded on the request.
		if (success) {
			actions.micro[request.action].apply(board.hex.get(request.q, request.r), request.struct);
		} else {
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
			inprogress: (player.turn > opponent.turn || player.turn > board.round_length) ? 0 : 1 // Should we tell the client that the player can currently take his turn?
		});

		// Check to see if we need to update the opponent's status.
		if (player.turn == opponent.turn) {
			// This means that the opponent was previously waiting for the player to take his turn.
			// Add an update to note that the opponent's turn is now in progress.
			msg.data.push({
				type: 'player',
				player: opponent_id,
				inprogress: (opponent.turn > board.round_length) ? 0 : 1
			});
		}

		// Send a game update to all players in the game.
		msg.send();

		logic.resolve_round(board);
	},

	/**
	 * Request sent when the user clicks on a hex.
	 */
	on_request_click: function(board, request, client) {

	},

	/**
	 * A request from the client to cancel the last request.
	 */
	on_request_cancel: function(board, request, client) {

	},
}

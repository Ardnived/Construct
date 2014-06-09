var board = require("../server/board");
var logic = require("../server/logic");
var hs = require("../shared/handshake");
var actions = require("../data/action");
var perks = require("../data/perk");
var structs = require("../data/struct");
var directions = require("../data/misc").directions;
var debug = require("../server/debug");
var server = require("../server/connect");

var MAX_TURN = 3;

var players = [
	{ // Player 1
		turn: 1,
		socket: null
	},
	{ // Player 2
		turn: 1,
		socket: null
	}
];

// TODO: Encapsulate this more.
exports.players = players;

var routes = {};
routes[hs.request_type.click] = on_request_click;
routes[hs.request_type.build] = on_request_build;
routes[hs.request_type.cancel] = on_request_cancel;

/**
 * Initialize the game, for now this means creating random connections.
 */
exports.create = function() {
	for (var qN = 1; qN < 12; qN++) {
		for (var rN = 0; rN < 10; rN++) {
			var q = qN;
			var r = rN - Math.floor(q/2);
			
			board.tile.add(q, r);
			
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
exports.on_request = function(data) {
	var request = new hs.request(data);
	
	if (request.type in routes) {
		debug.game("Received Request", data);
		routes[request.type](board, request, this);
	} else {
		debug.game("Unrecognized request: "+request.type);
	}
};

/**
 * A request from the client to resend all new data to synchronize the client with the server.
 */
exports.on_refresh = function(data) {
	debug.game("Received Refresh");
	var socket = this;
	var reply = [];
	var tiles = board.tile.all();
	var edges = board.edge.all();
	
	// Add meta data to tell the player what his id is.
	// This information MUST be added first, 
	// otherwise when the player gets the data they won't know who it is addressed to.
	for (var i in players) {
		if (players[i].socket === socket) {
			var update = new hs.request();
			update.type = hs.update_type.meta;
			update.player = i;
			
			reply.push(update.get_data());
			break;
		}
	}
	// ===== ===== ===== =====
	
	// Add all the tile data.
	for (var i in tiles) {
		var tile = tiles[i];
		
		if (tile.struct != null) {
			var update = new hs.request();
			update.type = hs.update_type.tile;
			
			if (tile.struct != null) {
				update.struct = tile.struct.id;
			}
			
			update.q = tile.q;
			update.r = tile.r;
			
			reply.push(update.get_data());
		}
	}
	
	// Add all the edge data.
	console.log(edges);
	for (var i in edges) {
		var edge = edges[i];
		
		var update = new hs.request();
		update.type = hs.update_type.edge;
		update.q = [edge.q1, edge.q2];
		update.r = [edge.r1, edge.r2];
		
		reply.push(update.get_data());
	}
	
	// Add date for all players.
	for (var i in players) {
		var player = players[i];
		
		if (player.turn > 0) {
			var update = new hs.request();
			update.type = hs.update_type.player;
			update.player = i;
			update.turn = player.turn;
			//update.inprogress = player.turn <= opponent.turn;
			// TODO: Fix this ^
			
			reply.push(update.get_data());
		}
	}
	
	// Check if the reply has contents.
	if (reply.length > 0) {
		// If so, send the update back to the requestor.
		socket.emit(hs.message_type.update, reply);
	}
};

/**
 * A request from the client to build something on a tile.
 */
function on_request_build(board, request, socket) {
	var reply = [];
	
	// Make sure that this request is from the client.
	var player_id, opponent_id;
	if (players[0].socket === socket) {
		player_id = 0;
		opponent_id = 1;
	} else if (players[1].socket === socket) {
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
		var data = new hs.request();
		data.message = "It is not your turn.";
	  	socket.emit(hs.message_type.rejected, data.get_data());
	}
	
	// Attempt the requested action.
	var success = logic.request_build(board, request.q, request.r, structs.nodes.get(request.struct));
	
	// Check if we succeeded on the request.
	if (!success) {
		// Tell the client that we're rejecting it's request because the game logic has rejected the build.
		var data = new hs.request();
		data.message = "Prohibited tile.";
	  	socket.emit(hs.message_type.rejected, data.get_data());
	}
	
	var update = new hs.request();
	
	// Indicate the new id for the requested struct.
	update.type = hs.update_type.tile;
	update.struct = board.tile.get(request.q, request.r).struct.id;
	update.q = request.q;
	update.r = request.r;
	
	reply.push(update.get_data());
	
	// Update the player's turn.
	player.turn++;
	
	update = new hs.request();
	update.type = hs.update_type.player;
	update.player = player_id;
	update.turn = player.turn;
	
	// Should we tell the client that the player can currently take his turn?
	if (player.turn > opponent.turn) {
		// The opponent has not taken his turn yet, so return false.
		update.inprogress = 0; //false
	} else {
		update.inprogress = 1; //true
	}
	
	// Add to our reply.
	reply.push(update.get_data());
	
	// Check to see if we need to update the opponent's status.
	if (player.turn == opponent.turn) {
		// This means that the opponent was previously waiting for the player to take his turn.
		// Add an update to note that the opponent's turn is now in progress.
		update = new hs.request();
		update.type = hs.update_type.player;
		update.player = opponent_id;
		update.inprogress = 1; //true
		
		// Add to our reply.
		reply.push(update.get_data());
	}
	
	// Send a game update to all players in the game.
  	server.io.to("game").emit(hs.message_type.update, reply);
  	
  	_check_round_end();
};

function _check_round_end() {
	for (var index in players) {
		if (players[index].turn < MAX_TURN) {
			// At least one player has a turn remaining. Terminate.
			return;
		}
	}
	
	
}

/**
 * Request sent when the user clicks on a hex.
 */
function on_request_click(board, request, socket) {
	
};

/**
 * A request from the client to cancel the last request.
 */
function on_request_cancel(board, request, socket) {
	
};

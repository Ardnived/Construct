var dispatch = require("./server/dispatch");
var game = require("./server/game");
var board = require("./shared/board");
var debug = require("./server/debug");

/*
 * nodejs modules:
 * ws
 * colors
 */

// Initialize the server.
game.create();
dispatch.start(3000, 3001);

/**
 * When a new user connects, handle it.
 */
dispatch.on('connection', function(client) {
	debug.game("Received Connection.");
	
	for (var i = 0; i <= 1; i++) {
		board.player.set(i);
	}

	for (var i = 0; i <= 1; i++) {
		var player = board.player.get(i);

		if (board.player.has(i)) {
			player = board.player.get(i);
		} else {
			player = board.player.set(i);
		}

		if (player.client == null) {
			player.client = client;
			game.on_refresh(client);
			return;
		}
	}
	
	debug.game("Setting incoming connection to spectator.");
	game.on_refresh(client);
});

dispatch.on('request', game.on_request);
dispatch.on('refresh', game.on_refresh);

var dispatch = require("./server/dispatch");
var game = require("./server/game");
var debug = require("./server/debug");

/*
 * nodejs modules:
 * ws
 * colors
 */

// Initialize the server.
game.create();
dispatch.start(3000, 8082);

/**
 * When a new user connects, handle it.
 */
dispatch.on('connection', function(client) {
	debug.game("Received Connection.");
	
	for (var i in game.players) {
		if (game.players[i].client == null) {
			game.players[i].client = client;
			game.refresh(client);
			return;
		}
	}
	
	debug.game("Setting incoming connection to spectator.");
	game.refresh(client);
});

dispatch.on('request', game.on_request);
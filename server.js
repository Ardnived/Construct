var server = require("./server/connect");
var game = require("./server/game");
var debug = require("./server/debug");

// Initialize the server.
game.create();
server.start(8888);

/**
 * When a new user connects, handle it.
 */
server.io.on('connection', function(socket) {
	debug.game("Received Connection.");
	
	socket.join("game");
	socket.on(hs.message_type.refresh, game.on_refresh);
	
	for (var i in game.players) {
		if (game.players[i].socket == null) {
			game.players[i].socket = socket;
			socket.on(hs.message_type.request, game.on_request);
			return;
		}
	}
	
	debug.game("Setting incoming connection to spectator.");
});

/**
 * When a user disconnects, handle it.
 */
server.io.on('disconnect', function(socket) {
	var rooms = server.io.manager.roomClients[socket.id];
	
	for (var room in rooms) {
		server.io.to(room).emit(MessageType.rejected, { message: "Another client has disconnected from "+room });
	}
});

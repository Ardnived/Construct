var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname+'/scripts/',
	nodeRequire: require,
});

requirejs(['global/config', 'global/debug', 'global/hooks']);

requirejs(
	['http', 'fs', 'path', 'url'],
	function(HTTP, FS, PATH, URL) {
		function respond(type, response, param, content_type) {
			switch (type) {
				case 404:
					response.writeHead(404, { "Content-Type" : "text/plain" });
					response.write("404 Not Found\n");
					break;
				case 500:
					var error = param;
					response.writeHead(500, { "Content-Type" : "text/plain" });
					response.write(error+"\n");
					break;
				case 200:
					var file = param;
					if (typeof content_type === 'undefined') {
						response.writeHead(200);
					} else {
						response.writeHead(200, { "Content-Type" : content_type });
					}
					response.write(file, "binary");
					break;
			}
			
			response.end();
		}

		HTTP.createServer(function(request, response) {
			var uri = URL.parse(request.url).pathname;
			
			if (uri.indexOf("server") > -1) {
				// Don't allow access to server files.
				respond(404, response);
				return;
			}
			
			var filename = PATH.join(process.cwd(), "/", uri);
			
			//DEBUG.dispatch("Request received. ["+uri+"]");
			
			FS.exists(filename, function(exists) {
				if (exists) {
					if (FS.statSync(filename).isDirectory()) {
						filename += 'client.html';
					}

					FS.readFile(filename, "binary", function(error, file) {
						if (error) {
							respond(500, response, error);
						} else {
							var content_type;
							if (filename.indexOf('js', filename.length - 2) !== -1) {
								content_type = "application/javascript";
							} else if (filename.indexOf('html', filename.length - 4) !== -1) {
								content_type = "text/html";
							} else if (filename.indexOf('css', filename.length - 3) !== -1) {
								content_type = "text/css";
							}

							respond(200, response, file, content_type);
						}
					});
				} else {
					respond(404, response);
				}
			});
		}).listen(CONFIG.port.http);

		DEBUG.dispatch("Launched HTTP Server on port", CONFIG.port.http);
	}
);

requirejs(
	['server/dispatch', 'server/game', 'shared/state', 'node-uuid'],
	function(DISPATCH, GAME, STATE, UUID) {
		DISPATCH.start(CONFIG.port.socket);

		var clients = {};
		var games = {};

		// TODO: Change this set up.
		var game_id = UUID.v4();
		var game_state = HOOKS.trigger('state:new', new STATE(game_id));
		games[game_id] = game_state;

		var player_increment = 0;

		HOOKS.on('dispatch:connection', function(client) {
			DEBUG.game("Received connection with socket id", client.id);
			
			// TODO: Assign a player id.
			var user_id = UUID.v4();
			var player_id = player_increment;
			player_increment++;

			var player = game_state.player(player_id);

			if (player != null) {
				client.game_id = game_state.id;
				client.player_id = player_id;
				player.user_id = user_id;
				player.client = client;
				GAME.reset(game_state, player_id);

				DEBUG.game("User has been assigned id #"+player_id+" and has joined game \'"+game_state.id+"\'");
			} else {
				DEBUG.game("A spectator has joined game \'"+game_state.id+"\'");
			}
		});

		HOOKS.on('dispatch:update', function(args) {
			args.state = games[args.client.game_id];
			DEBUG.temp("sending game:"+args.data.type, args.data);
			HOOKS.trigger('game:'+args.data.type, null, args);
		});

		HOOKS.on('dispatch:chat', function(args) {
			// TODO: Unimplemented
		});
	}
);

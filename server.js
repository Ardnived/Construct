var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname+'/scripts/',
	nodeRequire: require,
});

requirejs(['global/config', 'global/debug', 'global/hooks']);

requirejs(
	['http', 'fs', 'path', 'url'],
	function(http, fs, path, url) {
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

		http.createServer(function(request, response) {
			var uri = url.parse(request.url).pathname;
			
			if (uri.indexOf("server") > -1) {
				// Don't allow access to server files.
				respond(404, response);
				return;
			}
			
			var filename = path.join(process.cwd(), "/", uri);
			
			debug.dispatch("Request received. ["+uri+"]");
			
			fs.exists(filename, function(exists) {
				if (exists) {
					if (fs.statSync(filename).isDirectory()) {
						filename += 'client.html';
					}

					fs.readFile(filename, "binary", function(error, file) {
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
		}).listen(config.port.http);

		debug.dispatch("Launched HTTP Server on port", config.port.http);
	}
);

requirejs(
	['server/dispatch', 'server/game', 'shared/state', 'node-uuid'],
	function(dispatch, game, state, uuid) {
		dispatch.start(config.port.socket);

		var clients = {};
		var games = {};

		// TODO: Change this set up.
		var game_id = uuid.v4();
		var game_state = hooks.trigger('state:new', new state(game_id));
		games[game_id] = game_state;

		hooks.on('dispatch:connection', function(client) {
			debug.game("Received connection with socket id", client.id);
			
			// TODO: Assign a player id.
			var user_id = uuid.v4();
			var player_id = game_state.new_player(user_id);
			client.game_id = game_state.id;
			client.player_id = player_id;
			game_state.player(player_id).client = client;
			game.reset(game_state, player_id);

			debug.game("User has been assigned id #"+player_id+" and has joined game \'"+game_state.id+"\'");
		});

		hooks.on('dispatch:update', function(args) {
			args.state = games[args.client.game_id];
			debug.temp("sending game:"+args.data.type, args.data);
			hooks.trigger('game:'+args.data.type, null, args);
		});

		hooks.on('dispatch:chat', function(args) {
			// TODO: Unimplemented
		});
	}
);

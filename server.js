var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname+'/scripts/',
	nodeRequire: require,
});

requirejs(['global/config', 'global/debug', 'global/hooks']);

var http_server;

requirejs(
	['http', 'fs', 'path', 'url', 'server/router', 'server/lobby/main'],
	function(HTTP, FS, PATH, URL, ROUTER) {
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

		http_server = HTTP.createServer(function(request, response) {
			var uri = URL.parse(request.url).pathname;
			
			if (uri.indexOf("server") > -1) {
				// Don't allow access to server files.
				respond(404, response);
				return;
			}
			
			var filename = PATH.join(process.cwd(), "/", uri);
			
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
		}).listen(CONFIG.port);

		DEBUG.dispatch("Launched HTTP Server on port", CONFIG.port);

		ROUTER.start(http_server)

		DEBUG.dispatch("Launched Socket Server on port", CONFIG.port);
	}
);

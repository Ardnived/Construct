var http = require("http");
var url = require("url");
var socket = require("socket.io");
var path = require("path");
var fs = require("fs");
var debug = require("../server/debug");


// ==================== PUBLIC ==================== //
exports.io;

/**
 * Initialize an http and socket server.
 */
exports.start = function(port, route) {
	var app = http.createServer(on_http_request).listen(port);
	exports.io = socket.listen(app).sockets;
	
	debug.server("Waiting for incoming connections...");
};


// ==================== PRIVATE ==================== //
/**
 * Handle an incoming request from the client.
 * This does not handle socket request, purely http requests.
 */
function on_http_request(request, response) {
	var uri = url.parse(request.url).pathname;
	
	if (uri.indexOf("server") > -1) {
		// Don't allow access to server files.
		respond(404, response);
		return;
	}
	
	var filename = path.join(process.cwd(), "/", uri);
	
	debug.server("Request received. ["+uri+"]");
	
	fs.exists(filename, function(exists) {
		if (!exists) {
			respond(404, response);
			return;
		}

		if (fs.statSync(filename).isDirectory()) {
			filename += '/client.html';
		}

		fs.readFile(filename, "binary", function(error, file) {
			if (error) {
				respond(500, response, error);
			} else {
				respond(200, response, file);
			}
		});
	});
}

function respond(type, response, param) {
	switch (type) {
		case 404:
			response.writeHead(404, {"Content-Type" : "text/plain"});
			response.write("404 Not Found\n");
			break;
		case 500:
			var error = param;
			response.writeHead(500, {"Content-Type" : "text/plain"});
			response.write(error+"\n");
			break;
		case 200:
			var file = param;
			response.writeHead(200);
			response.write(file, "binary");
			break;
	}
	
	response.end();
}
var http = require("http");
var url = require("url");
var binaryserver = require('binaryjs').BinaryServer;
var path = require("path");
var fs = require("fs");
var debug = require("../server/debug");
var message = require("../shared/message");


// ==================== PUBLIC ==================== //
var server;
var callbacks = {
	on_connection: function() {}
};

/**
 * Initialize an http and socket server.
 */
exports.start = function(http_port, socket_port) {
	http.createServer(on_http_request).listen(http_port);
	server = binaryserver({ port: socket_port });
	server.on("error", callbacks.on_error);

	server.on("connection", function(connection) {
		debug.dispatch("Incoming connection.");

		connection.on("open", callbacks.on_open);
		connection.on("close", callbacks.on_close);
		connection.on("error", callbacks.on_error);
		connection.on("stream", callbacks.on_message);

		callbacks.on_connection(connection);
	});
	
	debug.dispatch("Waiting for incoming connections...");
};

exports.on = function(event, callback) {
	callbacks["on_"+event] = callback;
};

exports.send = function(binary, length, targets) {
	if (typeof targets === 'undefined') {
		debug.dispatch("Sending to all clients.");
		targets = server.clients;
	} else if (Object.prototype.toString.call(targets) !== '[object Array]') {
		targets = [targets];
	}

	var buffer = new Buffer(length);
	for (var n = 0; n < buffer.length; ++n) {
		buffer[n] = binary[n];
	}

	for (var id in targets) {
		debug.dispatch("Sending to client #"+id);
		targets[id].send(buffer);
	}
};

callbacks.on_open = function() {
	debug.dispatch("Connection Open");
};

callbacks.on_close = function() {
	debug.dispatch("Connection Closed");
};

callbacks.on_error = function(error) {
	debug.error("Dispatch "+error);
};

callbacks.on_message = function(stream, meta) {
	debug.dispatch("Began message.", meta);
	
	var client = this;
	var buffer = new Buffer(meta.size);
	var pointer = 0;
	
	stream.on('data', function(data) {
		data.copy(buffer, pointer);
		debug.dispatch("Received data", buffer.readInt8(0), buffer.readUInt8(0), buffer, "of length", buffer.length);
		pointer += buffer.length;
	});

	stream.on('end', function() {
		debug.dispatch("Finished message", buffer.readInt8(0), buffer.readUInt8(0), buffer);
		var msg = message.decode(buffer);

		if (typeof callbacks['on_'+msg.type] !== 'undefined') {
			callbacks['on_'+msg.type](msg.data, client);
		}
	})

	/*
	var parts = [];
	stream.on('data', function(data) {
    	parts.push(data);
    });
    
    stream.on('end', function() {
    	var blob = new Blob(parts);
		
		var reader = new FileReader();
		reader.addEventListener("loadend", function() {
			var msg = new message.instance();
			msg.binary = new Int8Array(reader.result);
			msg.decode();
			
			debug.dispatch("Received", msg.type+":", msg.data);
			callbacks["on_"+msg.type](msg.data);
		});

		reader.readAsArrayBuffer(blob);
    });
    */
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
	
	debug.dispatch("Request received. ["+uri+"]");
	
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
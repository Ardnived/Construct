
function on_open() {
	debug.dispatch("Connection Open");
};

function on_close() {
	debug.dispatch("Connection Closed");
};

function on_error(error) {
	debug.error("Dispatch "+error);
};

function on_message(stream, meta) {
	debug.dispatch("Began message.", meta);
	
	var client = this;
	var buffer = new Buffer(meta.size);
	var pointer = 0;
	
	stream.on('data', function(data) {
		data.copy(buffer, pointer);
		pointer += buffer.length;
	});

	stream.on('end', function() {
		debug.dispatch("Received message", buffer.readInt8(0), buffer.readUInt8(0), buffer);

		requirejs(
			['shared/message'],
			function(message) {
				var msg = message.decode(buffer);

				hooks.trigger('dispatch:'+msg.type, null, {
					client: client,
					data: msg.data,
				});
			}
		);
	})
};

define(
	['binaryjs'],
	function(binaryjs) {
		return {
			server: null,

			start: function(port) {
				this.server = binaryjs.BinaryServer({ port: port });
				this.server.on("error", on_error);

				this.server.on("connection", function(connection) {
					debug.dispatch("Incoming connection.");

					connection.on("open", on_open);
					connection.on("close", on_close);
					connection.on("error", on_error);
					connection.on("stream", on_message);

					hooks.trigger("dispatch:connection", null, connection);
				});
				
				debug.dispatch("Waiting for incoming connections...");
			},

			send: function(binary, length, targets) {
				if (typeof targets === 'undefined') {
					targets = this.server.clients;
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
			},
		};
	}
);

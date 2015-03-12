
function on_open() {
	DEBUG.dispatch("Connection Open");
};

function on_close() {
	DEBUG.dispatch("Connection Closed");
};

function on_error(error) {
	DEBUG.error("Dispatch "+error);
};

function on_message(stream, meta) {
	DEBUG.dispatch("Began message.", meta);
	
	var client = this;
	var buffer = new Buffer(meta.size);
	var pointer = 0;
	
	stream.on('data', function(data) {
		data.copy(buffer, pointer);
		pointer += buffer.length;
	});

	stream.on('end', function() {
		DEBUG.dispatch("Received message", buffer.readInt8(0), buffer.readUInt8(0), buffer);

		requirejs(
			['shared/message'],
			function(message) {
				var msg = message.decode(buffer);

				HOOKS.trigger('dispatch:'+msg.type, null, {
					client: client,
					data: msg.data,
				});
			}
		);
	})
};

define(
	['binaryjs'],
	function(BINARYJS) {
		return {
			server: null,

			start: function(port) {
				this.server = BINARYJS.BinaryServer({ port: port });
				this.server.on("error", on_error);

				this.server.on("connection", function(connection) {
					DEBUG.dispatch("Incoming connection.");

					connection.on("open", on_open);
					connection.on("close", on_close);
					connection.on("error", on_error);
					connection.on("stream", on_message);

					HOOKS.trigger("dispatch:connection", null, connection);
				});
				
				DEBUG.dispatch("Launched Socket Server on port", CONFIG.port.socket);
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
					DEBUG.dispatch("Sending to client #"+id);
					targets[id].send(buffer);
				}
			},
		};
	}
);

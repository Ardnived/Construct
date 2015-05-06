

// TODO: Implement this file.

define(
	['binaryjs'],
	function(BINARYJS) {
		var chat_clients = 

		function on_open() {
			DEBUG.chat("Connection Opened");
		};

		function on_close() {
			DEBUG.chat("Connection Closed");
		};

		function on_error(error) {
			DEBUG.error("Chat: "+error);
		};

		function on_message(stream, meta) {
			var client = this;
			var buffer = new Buffer(meta.size);
			var pointer = 0;
			
			stream.on('data', function(data) {
				data.copy(buffer, pointer);
				pointer += buffer.length;
			});

			stream.on('end', function() {
				DEBUG.dispatch("Received chat");

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

		HOOKS.on("")

		return {
			server: null,

			start: function(server) {
				this.server = BINARYJS.BinaryServer({ server: server });
				this.server.on("error", on_error);

				this.server.on("connection", function(connection) {
					DEBUG.dispatch("Incoming connection.");

					connection.on("open", on_open);
					connection.on("close", on_close);
					connection.on("error", on_error);
					connection.on("stream", on_message);

					HOOKS.trigger("chat:connection", null, connection);
				});
				
				DEBUG.dispatch("Launched Socket Server on port", CONFIG.port);
			},
		};
	}
);

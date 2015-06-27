
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
	DEBUG.dispatch("Receiving message.", meta);
	
	var client = this;
	var buffer = new Buffer(meta.size);
	var pointer = 0;
	
	stream.on('data', function(data) {
		data.copy(buffer, pointer);
		pointer += buffer.length;
	});

	stream.on('end', function() {
		requirejs(
			['shared/message'],
			function(MESSAGE) {
				var msg = MESSAGE.decode(buffer);

				HOOKS.trigger('dispatch:'+msg.type, null, {
					source: 'client',
					client: client,
					meta: meta,
					data: msg.data,
				});
			}
		);
	})
};

define(
	['binaryjs'],
	function(BINARYJS) {
		/*var relayed_events = ['lobby'];

		for (var i = relayed_events.length - 1; i >= 0; i--) {
			HOOKS.on('dispatch:'+relayed_events[i], function(event) {
				if (event.source === 'client') {

				}
			}
		};*/

		var server;

		return {
			server: null,

			start: function(server) {
				server = BINARYJS.BinaryServer({ server: server });
				server.on("error", on_error);

				server.on("connection", function(connection) {
					DEBUG.dispatch("Incoming connection.");

					connection.on("open", on_open);
					connection.on("close", on_close);
					connection.on("error", on_error);
					connection.on("stream", on_message);

					HOOKS.trigger("dispatch:connection", null, connection);
				});
				
				DEBUG.dispatch("Launched Socket Server on port", CONFIG.port);
			},

			send: function(binary, length, targets, meta) {
				if (typeof targets === 'undefined') {
					targets = server.clients;
				} else if (Object.prototype.toString.call(targets) !== '[object Array]') {
					targets = [targets];
				}

				var buffer = new Buffer(length);
				for (var n = 0; n < buffer.length; ++n) {
					buffer[n] = binary[n];
				}

				for (var id in targets) {
					DEBUG.dispatch("Sending to client #"+id);
					targets[id].send(buffer, meta);
				}
			},
		};
	}
);


define(
	['shared/message', 'external/binary'],
	function(MESSAGE) {
		var socket = null;

		function on_open(event) {
			DEBUG.dispatch("Socket Open");
		};

		function on_close(event) {
			DEBUG.dispatch("Socket Closed:", event.code, event.reason);
		};

		function on_error(event) {
			DEBUG.error("Socket Error: ", event);
		};
		
		function on_message(stream, meta) {
			DEBUG.dispatch("Received message", "( metadata:", meta, ")");

			var parts = [];
			stream.on('data', function(data) {
				parts.push(data);
			});

			stream.on('end', function() {
				var blob = new Blob(parts);
				
				var reader = new FileReader();
				reader.addEventListener("loadend", function() {
					var binary = new Int8Array(reader.result);
					var msg = MESSAGE.decode(binary);
					
					DEBUG.flow('doing dispatch:'+msg.type, msg.data);
					HOOKS.trigger('dispatch:'+msg.type, null, {
						meta: meta,
						data: msg.data,
					});
				});

				reader.readAsArrayBuffer(blob);
			});
		};

		setInterval(function() {
			MESSAGE.send('keep-alive', []);
		}, 45000); // Send a keep alive message every 45 seconds.

		return {
			init: function(port) {
				DEBUG.dispatch("Connecting to server on port", port, "...");
				socket = new BinaryClient("ws://"+location.hostname+":"+port+"/");
				socket.on('stream', on_message);
				socket.on('error', on_error);
				socket.on('open', on_open);
				socket.on('close', on_close);
			},
			
			send: function(binary, length) {
				DEBUG.dispatch("Sending data", binary, "with length", length);
				socket.send(binary, {
					size: length,
				});
			},
		};
	}
);

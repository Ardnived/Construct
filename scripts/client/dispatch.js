
var socket = null;

define(
	['shared/message', 'external/binary'],
	function(message) {

		function on_open(event) {
			debug.dispatch("Socket Open");
		};

		function on_close(event) {
			debug.dispatch("Socket Closed:", event.code, event.reason);
		};

		function on_error(event) {
			debug.error("Socket Error: ", event);
		};
		
		function on_message(stream, meta) {
			debug.dispatch("Received message", "( metadata:", meta, ")");

			var parts = [];
			stream.on('data', function(data) {
				parts.push(data);
			});

			stream.on('end', function() {
				var blob = new Blob(parts);
				
				var reader = new FileReader();
				reader.addEventListener("loadend", function() {
					var binary = new Int8Array(reader.result);
					var msg = message.decode(binary);
					
					debug.flow('triggering dispatch:'+msg.type, msg.data);
					hooks.trigger('dispatch:'+msg.type, null, msg.data);
				});

				reader.readAsArrayBuffer(blob);
			});
		};

		return {
			init: function(port) {
				debug.dispatch("Connecting to server...");
				socket = new BinaryClient("ws://"+location.hostname+":"+port+"/");
				socket.on('stream', on_message);
				socket.on('error', on_error);
				socket.on('open', on_open);
				socket.on('close', on_close);
			},
			
			send: function(binary, length) {
				debug.dispatch("Sending data", binary, "with length", length);
				socket.send(binary, {
					size: length
				});
			},
		};
	}
);

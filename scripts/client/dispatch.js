
var socket = null;

define(
	['shared/message', 'external/binary'],
	function(MESSAGE) {

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
					
					DEBUG.flow('triggering dispatch:'+msg.type, msg.data);
					HOOKS.trigger('dispatch:'+msg.type, null, msg.data);
				});

				reader.readAsArrayBuffer(blob);
			});
		};

		return {
			init: function(port) {
				DEBUG.dispatch("Connecting to server...");
				socket = new BinaryClient("ws://"+location.hostname+":"+port+"/");
				socket.on('stream', on_message);
				socket.on('error', on_error);
				socket.on('open', on_open);
				socket.on('close', on_close);
			},
			
			send: function(binary, length) {
				DEBUG.dispatch("Sending data", binary, "with length", length);
				socket.send(binary, {
					size: length
				});
			},
		};
	}
);

var dispatch = {
	_socket: null,
	
	init: function() {
		console.log("Connecting to socket.");
		this._socket = new BinaryClient("ws://"+location.hostname+":8082/");
		this._socket.on('stream', this._on_message);
		this._socket.on('error', this._on_error);
		this._socket.on('open', this._on_open);
		this._socket.on('close', this._on_close);
	},
	
	on: function(type, func) {
		this["_on_"+type] = func;
	},
	
	send: function(binary, length) {
		debug.dispatch("Sending data", binary, "with length", length);
		this._socket.send(binary, {
			size: length
		});
	},
	
	_on_open: function(event) {
		debug.dispatch("Socket Open");
	},
	
	_on_close: function(event) {
		debug.dispatch("Socket Closed:", event.code, event.reason);
	},
	
	_on_error: function(event) {
		debug.error("Socket Error: ", event);
	},
	
	_on_message: function(stream, meta) {
		debug.dispatch("Received message", meta);

		var parts = [];
		stream.on('data', function(data) {
	    	parts.push(data);
	    });
	    
	    stream.on('end', function() {
	    	var blob = new Blob(parts);
			debug.dispatch("On Message:", blob);
			
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				var msg = new message.instance();
				msg.binary = new Int8Array(reader.result);
				msg.decode();
				
				debug.dispatch("Received", msg.type+":", msg.data);
				
				if (typeof dispatch["_on_"+msg.type] !== 'undefined') {
					dispatch["_on_"+msg.type](msg.data);
				} else {
					debug.error("No dispatch handler defined for type", msg.type);
				}
			});

			reader.readAsArrayBuffer(blob);
	    });
	}
};


var dispatch_path = 'client/dispatch';

if (config.is_server) {
	dispatch_path = 'server/dispatch';
}

define(
	['shared/actions'],
	function(actions) {
		var RELATION = 127;
		var JSON_OPEN = 126;
		var JSON_CLOSE = 125;
		var ARRAY_OPEN = 124;
		var ARRAY_CLOSE = 123;
		var NULL = 122;
		 
		var BUFFER_SIZE = 16;
		var message = {};

		var text = {
			"400": "It is not your turn.",
			"401": "Prohibited hex.",
			"404": "Not found.",
			"500": "That action would be considered cheating",
			"501": "You cannot act on another player's behalf!",
		};

		var keys = ['type', 'message', 'q', 'r', 'unit', 'player', 'active', 'turn', 'action'];

		var values = {
			type: ['action', 'meta', 'hex', 'edge', 'player', 'unit'],
			action: Object.keys(actions),
			message: Object.keys(text),
			//unit: ['sniffer', 'peeper', 'bouncer', 'enforcer', 'seeker', 'cleaner', 'carrier'],
		};

		var types = ['default', 'update', 'response', 'chat'];

		function construct(type) {
			this.type = typeof type !== 'undefined' ? type : types[0];
			this.binary = null;
			this.data = null;
			this.length = 0;
		};

		/**
		 * Updates this.binary by encoding this.data
		 */
		construct.prototype.encode = function(data, dictionary) {
			if ( typeof data === 'undefined') {
				data = this.data;
				this.binary = new Int8Array(new ArrayBuffer(BUFFER_SIZE));

				if (this.type == null) {
					debug.error("Encoding failed: Message type has not been set.");
					return false;
				}

				this.write(this.type, types);
			}

			if (this.binary === null) {
				this.binary = new Int8Array(new ArrayBuffer(BUFFER_SIZE));
			}

			if ( typeof dictionary === 'undefined') {
				dictionary = keys;
			}

			debug.parse("encoding", toString.call(data), data);

			if (toString.call(data) === '[object Array]') {
				this.write(ARRAY_OPEN);

				for (var key in data) {
					if (typeof data[key] === 'undefined' || data[key] == null) {
						this.write(NULL);
					} else {
						this.encode(data[key], dictionary);
					}
				}

				this.write(ARRAY_CLOSE);
			} else if (toString.call(data) === '[object Object]') {
				this.write(JSON_OPEN);

				for (var key in data) {
					this.write(RELATION);
					this.write(key, dictionary);
					debug.parse("encode data for "+key);

					if (typeof data[key] === 'undefined' || data[key] == null) {
						this.write(NULL);
					} else if (values.hasOwnProperty(key)) {
						this.encode(data[key], values[key]);
					} else {
						this.encode(data[key], dictionary);
					}
				}

				this.write(JSON_CLOSE);
			} else if ( typeof data === 'number') {
				this.write(data);
			} else if ( typeof data === 'boolean') {
				this.write(data ? 1 : 0);
			} else {
				this.write(data, dictionary);
			}

			return true;
		};

		construct.prototype.write = function(value, dictionary) {
			//debug.parse("write", value, "to", this.length);
			var query = value; //TODO: remove this debug code.

			if (this.length >= this.binary.length) {
				//debug.parse("enlarge buffer to", this.binary.length + BUFFER_SIZE);
				var newbuffer = new ArrayBuffer(this.binary.length + BUFFER_SIZE);
				var newbinary = new Int8Array(newbuffer);
				newbinary.set(this.binary);
				this.binary = newbinary;
			}

			if (typeof dictionary !== 'undefined') {
				value = dictionary.indexOf(value);

				if (value == -1) {
					debug.error("Unrecognized key on encode:", query);
					debug.parse(dictionary);
					return;
				}
			}

			this.binary[this.length] = value;
			this.length++;
		};

		construct.prototype.decode = function() {
			this.data = null;
			var jsonkey = null;
			var key = null;
			var mode = 'value';

			var jsontree = [];
			var dicttree = [];
			var depth = -1;

			debug.parse("received", this.binary);
			outerloop:
			for (var index in this.binary) {
				var value;

				if (index == 0) {
					this.type = this.read(this.binary[index], types);
					debug.parse("type is", this.type);
					continue;
				} else {
					value = this.read(this.binary[index]);
				}

				debug.parse("parse", this.binary[index], "=", value);

				switch (value) {
					case 'JSON_OPEN':
						depth++;
						jsontree[depth] = {};
						jsonkey = key;
						key = null;
						mode = 'value';
						debug.parse("json open ", depth);
						break;
					case 'ARRAY_OPEN':
						depth++;
						jsontree[depth] = [];
						jsonkey = key;
						key = null;
						mode = 'value';
						debug.parse("array open", depth);
						break;
					case 'CLOSE':
						if (depth == 0)
							break outerloop;

						if (jsonkey != null) {
							jsontree[depth-1][jsonkey] = jsontree[depth];
							jsonkey = null;
						} else {
							jsontree[depth - 1].push(jsontree[depth]);
						}
						
						delete jsontree[depth];
						depth--;
						debug.parse("close to depth", depth);
						break;
					case 'RELATION':
						mode = 'key';
						debug.parse("mode: key");
						break;
					default:
						switch (mode) {
							case 'key':
								key = this.read(this.binary[index], keys);
								mode = 'keyvalue';
								debug.parse("mode: keyvalue");
								break;
							case 'keyvalue':
								if ( typeof values[key] != 'undefined') {
									value = this.read(this.binary[index], values[key]);
								}

								jsontree[depth][key] = value;
								key = null;
								mode = 'value';
								debug.parse("mode: value");
								break;
							case 'value':
								jsontree[depth].push(value);
								break;
						}
				}

				debug.parse("->", jsontree);
			}

			debug.parse("-->", jsontree);
			this.data = jsontree[0];
		};

		construct.prototype.read = function(index, dictionary) {
			switch (index) {
				case JSON_OPEN:
					return 'JSON_OPEN';
				case ARRAY_OPEN:
					return 'ARRAY_OPEN';
				case JSON_CLOSE:
				case ARRAY_CLOSE:
					return 'CLOSE';
				case RELATION:
					return 'RELATION';
				case NULL:
					return null;
			}

			// No lookup table, therefore return the raw number.
			if ( typeof dictionary === 'undefined') {
				debug.parse("Returning raw.");
				return index;
			}

			var result = dictionary[index];
			if ( typeof result === 'undefined') {
				debug.error("Unrecognized value on decode:", index, "Searched: [" + dictionary + "]");
			} else {
				debug.parse("Returning", index, "=", result);
				return result;
			}
		};

		return {
			send: function(type, data, targets) {
				requirejs(
					[dispatch_path], 
					function(dispatch) {
						if (typeof type === 'undefined') {
							debug.error("Cannot dispatch message with undefined type.");
						}

						if (typeof data === 'undefined') {
							debug.error("Cannot dispatch message with no data.");
						}

						var msg = new construct();
						msg.type = type;
						msg.data = data;
						msg.encode();

						debug.dispatch("Sending", msg.type, "with length", msg.data.length);
						dispatch.send(msg.binary, msg.length, targets);
				});
				
			},

			decode: function(binary) {
				var buffer = new ArrayBuffer(binary.length);
			    var view = new Int8Array(buffer);
			    for (var i = 0; i < binary.length; ++i) {
			        view[i] = binary[i];
			    }

				var msg = new construct();
				msg.binary = view;
				msg.decode();
				
				return {
					type: msg.type,
					data: msg.data,
				};
			},
		};
	}
);

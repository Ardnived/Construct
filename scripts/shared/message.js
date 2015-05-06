
var dispatch_path = 'client/dispatch';

if (CONFIG.is_server) {
	dispatch_path = 'server/dispatch';
}

define(
	['shared/actions/all', 'shared/units/all', 'shared/structs/all', 'shared/directions'],
	function(ACTIONS, UNITS, STRUCTS, DIRECTIONS) {
		var RELATION = 127;
		var JSON_OPEN = 126;
		var JSON_CLOSE = 125;
		var ARRAY_OPEN = 124;
		var ARRAY_CLOSE = 123;
		var NULL = 122;
		 
		var BUFFER_SIZE = 16;

		var text = {
			// Defeat
			"100": "Defeat",
			// Victory
			"200": "Victory",
			// Approved
			"300": "Approved",
			"301": "Execute locally",
			// Rejected, not now.
			"400": "It is not your turn.",
			"401": "Prohibited hex.",
			"404": "Not found.",
			// Rejected, illegal move.
			"500": "You are not a player.",
			"501": "That action would be considered cheating.",
			"502": "You cannot act on another player's behalf!",
		};

		var keys = [
			'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', // Integers up to 10 can be used as keys.
			'type', 'unit_id', 'player_id', 'action',
			'position', 'positions', 'units', 'edges', 'traps',
			'message',
			'active', 'number', 'reveal',
			'unit_type', 'hex_type',
		];

		var values = {
			type: ['action', 'meta', 'hex', 'edge', 'player', 'unit', 'team'],
			action: Object.keys(ACTIONS),
			message: Object.keys(text),
			unit_type: Object.keys(UNITS),
			hex_type: Object.keys(STRUCTS),
			edges: DIRECTIONS.keys,
			traps: ['prism', 'monitor'],
		};

		var types = ['default', 'update', 'sync', 'reset', 'confirm', 'rejected', 'gameover', 'chat'];

		var root = {
			send: function(type, data, targets) {
				requirejs(
					[dispatch_path], 
					function(dispatch) {
						if (typeof type === 'undefined') {
							DEBUG.error("Cannot dispatch message with undefined type.");
						}

						if (typeof data === 'undefined') {
							DEBUG.error("Cannot dispatch message with no data.");
						}

						var msg = root.encode(type, data);

						//if (msg.blocks > 0) {
							DEBUG.dispatch("Sending", type, data, "with length", msg.blocks);
							dispatch.send(msg.binary, msg.length, targets);
						//} else {
						//	DEBUG.error("Didn't send data, because it was empty.");
						//}
				});	
			},

			encode: function(type, data) {
				var msg = new message();
				msg.type = type;
				msg.data = data;
				msg.encode();

				return {
					binary: msg.binary,
					length: msg.length,
					blocks: (msg.data instanceof Array) ? msg.data.length : 1,
				}
			},

			decode: function(binary) {
				var buffer = new ArrayBuffer(binary.length);
			    var view = new Int8Array(buffer);
			    for (var i = 0; i < binary.length; ++i) {
			        view[i] = binary[i];
			    }

				var msg = new message();
				msg.binary = view;
				msg.decode();
				
				return {
					type: msg.type,
					data: msg.data,
				};
			},

			text: text,
		};

		function message(type) {
			this.type = typeof type !== 'undefined' ? type : types[0];
			this.binary = null;
			this.data = null;
			this.length = 0;
		};

		/**
		 * Updates this.binary by encoding this.data
		 */
		message.prototype.encode = function(data, dictionary) {
			if ( typeof data === 'undefined') {
				if (this.type == null) {
					DEBUG.error("Encoding failed: Message type has not been set.");
					return false;
				}

				data = this.data;
				this.binary = new Int8Array(new ArrayBuffer(BUFFER_SIZE));

				this.write(this.type, types);
			}

			DEBUG.parse("Encoding", this.type, toString.call(data), data);

			if (this.binary === null) {
				this.binary = new Int8Array(new ArrayBuffer(BUFFER_SIZE));
			}

			if ( typeof dictionary === 'undefined') {
				dictionary = keys;
			}

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
					DEBUG.parse("encode data for "+key);

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

		message.prototype.write = function(value, dictionary) {
			//DEBUG.parse("write", value, "to", this.length);
			var query = value; //TODO: remove this DEBUG code.

			if (this.length >= this.binary.length) {
				//DEBUG.parse("enlarge buffer to", this.binary.length + BUFFER_SIZE);
				var newbuffer = new ArrayBuffer(this.binary.length + BUFFER_SIZE);
				var newbinary = new Int8Array(newbuffer);
				newbinary.set(this.binary);
				this.binary = newbinary;
			}

			if (typeof dictionary !== 'undefined') {
				value = dictionary.indexOf(value);

				if (value == -1) {
					DEBUG.parse(dictionary);
					DEBUG.fatal("Unrecognized key on encode:", query, '\n', this.data, '\n', dictionary);
					return;
				}
			}

			this.binary[this.length] = value;
			this.length++;
		};

		message.prototype.decode = function() {
			this.data = null;
			var jsonkeys = [];
			var key = null;
			var mode = 'value';

			var jsontree = [];
			var dicttree = [];
			var depth = -1;

			DEBUG.parse("received", this.binary);
			outerloop:
			for (var index in this.binary) {
				var value;

				if (index == 0) {
					this.type = this.read(this.binary[index], types);
					DEBUG.parse("type is", this.type);
					continue;
				} else {
					value = this.read(this.binary[index]);
				}

				switch (value) {
					case 'JSON_OPEN':
						depth++;
						jsontree[depth] = {};
						jsonkeys.push(key);
						key = null;
						mode = 'value';
						DEBUG.parse("json open ", depth);
						break;
					case 'ARRAY_OPEN':
						depth++;
						jsontree[depth] = [];
						jsonkeys.push(key);
						key = null;
						mode = 'value';
						DEBUG.parse("array open", depth);
						break;
					case 'CLOSE':
						if (depth == 0)
							break outerloop;

						var jsonkey = jsonkeys.pop();
						DEBUG.parse("Closing object with key", "'"+jsonkey+"'", 'of', jsonkeys);

						if (jsonkey != null) {
							jsontree[depth - 1][jsonkey] = jsontree[depth];
						} else {
							DEBUG.parse("attempting to push", depth, 'on to', jsontree);
							jsontree[depth - 1].push(jsontree[depth]);
						}
						
						delete jsontree[depth];
						depth--;
						DEBUG.parse("closing object at depth", depth);
						break;
					case 'RELATION':
						mode = 'key';
						DEBUG.parse("mode: key");
						break;
					default:
						switch (mode) {
							case 'key':
								var jsonkey = jsonkeys[depth];
								if (typeof values[jsonkey] !== 'undefined') {
									key = this.read(this.binary[index], values[jsonkey]);
								} else {
									key = this.read(this.binary[index], keys);
								}

								mode = 'keyvalue';
								DEBUG.parse("mode: keyvalue");
								break;
							case 'keyvalue':
								if (typeof values[key] !== 'undefined') {
									value = this.read(this.binary[index], values[key]);
								}

								jsontree[depth][key] = value;
								key = null;
								mode = 'value';
								DEBUG.parse("mode: value");
								break;
							case 'value':
								var parsekey = jsonkeys[jsonkeys.length-1];
								if (typeof values[parsekey] !== 'undefined') {
									value = this.read(this.binary[index], values[parsekey]);
								}

								jsontree[depth].push(value);
								break;
						}
				}

				DEBUG.parse("parse", this.binary[index], "=", value);
				DEBUG.parse("->", depth, jsontree);
			}

			DEBUG.parse("-->", depth, jsontree);
			this.data = jsontree[0];
		};

		message.prototype.read = function(index, dictionary) {
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
			if (typeof dictionary === 'undefined') {
				DEBUG.parse("Returning raw.", index);
				return index;
			}

			var result = dictionary[index];
			if (typeof result === 'undefined') {
				DEBUG.error("Unrecognized value on decode:", index, "Searched: [" + dictionary + "]");
			} else {
				DEBUG.parse("Returning", index, "=", result);
				return result;
			}
		};

		return root;
	}
);

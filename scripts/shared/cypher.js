
define(
	['shared/actions/all', 'shared/units/all', 'shared/structs/all', 'shared/directions', 'shared/util'],
	function(ACTIONS, UNITS, STRUCTS, DIRECTIONS, UTIL) {
		var RELATION = 127;
		var JSON_OPEN = 126;
		var JSON_CLOSE = 125;
		var ARRAY_OPEN = 124;
		var ARRAY_CLOSE = 123;
		var NULL = 122;
		 
		var BUFFER_SIZE = 16;

		var text = {
			// Defeat
			"100": "Defeat.",
			// Victory
			"200": "Victory.",
			// Approved
			"300": "Approved.",
			"301": "Execute locally.",
			"302": "Connected",
			// Rejected, not now.
			"400": "It is not your turn.",
			"401": "Prohibited hex.",
			"402": "Disconnected",
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

		var types = ['default', 'action', 'sync', 'gameover', 'lobby', 'response', 'keep-alive'];


		var raw, result, length, type, channel_id;

		var root = {
			LOBBY_ID: 0,
			TEXT: text,

			encode: function(type, channel_id, data) {
				result = new Int8Array(new ArrayBuffer(BUFFER_SIZE));
				set(data);

				insert(type, types);
				insert(channel_id);

				if (raw != null) {
					write(raw);
				} else {
					insert(NULL);
				}

				return {
					binary: result,
					length: length,
				}
			},

			decode: function(data) {
				var buffer = new ArrayBuffer(data.length);
				var view = new Int8Array(buffer);
				for (var i = 0; i < data.length; ++i) {
					view[i] = data[i];
				}

				set(view);
				read();

				return {
					type: type,
					channel_id: channel_id,
					data: result,
				};
			},
		};

		function set(data) {
			raw = data;
			result = null;
			length = 0;
			type = null;
			channel_id = null;
		}

		function write(data, dictionary) {
			if (typeof dictionary === 'undefined') {
				dictionary = keys;
			}

			if (toString.call(data) === '[object Array]') {
				insert(ARRAY_OPEN);

				for (var key in data) {
					if (typeof data[key] === 'undefined' || data[key] == null) {
						insert(NULL);
					} else {
						write(data[key], dictionary);
					}
				}

				insert(ARRAY_CLOSE);
			} else if (toString.call(data) === '[object Object]') {
				insert(JSON_OPEN);

				for (var key in data) {
					insert(RELATION);
					insert(key, dictionary);
					DEBUG.parse("encode data for "+key);

					if (typeof data[key] === 'undefined' || data[key] == null) {
						insert(NULL);
					} else if (values.hasOwnProperty(key)) {
						write(data[key], values[key]);
					} else {
						write(data[key], dictionary);
					}
				}

				insert(JSON_CLOSE);
			} else if ( typeof data === 'number') {
				insert(data);
			} else if ( typeof data === 'boolean') {
				insert(data ? 1 : 0);
			} else {
				insert(data, dictionary);
			}

			return true;
		};

		function insert(value, dictionary) {
			//DEBUG.parse("write", value, "to", length);
			var query = value; //TODO: remove this DEBUG code.

			if (length >= result.length) {
				//DEBUG.parse("enlarge buffer to", result.length + BUFFER_SIZE);
				var newbuffer = new ArrayBuffer(result.length + BUFFER_SIZE);
				var newbinary = new Int8Array(newbuffer);
				newbinary.set(result);
				result = newbinary;
			}

			if (typeof dictionary !== 'undefined') {
				value = dictionary.indexOf(value);

				if (value == -1) {
					DEBUG.parse(dictionary);
					DEBUG.fatal("Unrecognized key on encode:", query, '\n', raw, '\n', dictionary);
					return;
				}
			}

			result[length] = value;
			length++;
		};

		function read() {
			var jsonkeys = [];
			var key = null;
			var mode = 'value';

			var jsontree = [];
			var dicttree = [];
			var depth = -1;

			outerloop:
			for (var index in raw) {
				DEBUG.parse("Parsing", index);
				var value;

				switch (index) {
					case '0': 
						type = extract(index, types);
						DEBUG.parse("parsed type", raw[index], "=", type);
						continue;
					case '1':
						channel_id = extract(index);
						DEBUG.parse("parsed channel_id", raw[index], "=", channel_id);
						continue;
					case '2':
						value = extract(index);
						if (value == null) return null;
						break;
					default:
						value = extract(index);
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
									key = extract(index, values[jsonkey]);
								} else {
									key = extract(index, keys);
								}

								mode = 'keyvalue';
								DEBUG.parse("mode: keyvalue");
								break;
							case 'keyvalue':
								if (typeof values[key] !== 'undefined') {
									value = extract(index, values[key]);
								}

								jsontree[depth][key] = value;
								key = null;
								mode = 'value';
								DEBUG.parse("mode: value");
								break;
							case 'value':
								var parsekey = jsonkeys[jsonkeys.length-1];
								if (typeof values[parsekey] !== 'undefined') {
									value = extract(index, values[parsekey]);
								}

								jsontree[depth].push(value);
								break;
						}
						break;
				}

				DEBUG.parse("parse", raw[index], "=", value);
				DEBUG.parse("->", depth, jsontree);
			}

			DEBUG.parse("-->", depth, jsontree);
			result = jsontree[0];
			return true;
		};

		function extract(index, dictionary) {
			var code = raw[index];

			switch (code) {
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
				DEBUG.parse("Returning raw.", code);
				return code;
			}

			var result = dictionary[code];
			if (typeof result === 'undefined') {
				DEBUG.error("Unrecognized value on decode:", code, "Searched: [" + dictionary + "]");
			} else {
				DEBUG.parse("Returning", code, "=", result);
				return result;
			}
		};

		return root;
	}
);

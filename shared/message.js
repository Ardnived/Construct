if ( typeof exports !== 'undefined') {
	var debug = require("../server/debug");
	var dispatch = require("../server/dispatch");
	var library = require("../library/struct")
}

Messages = {
	"400": "It is not your turn.",
	"401": "Prohibited hex.",
	"404": "Not found."
}

/**
 * This file creates and parses communications between the server and client.
 */
Keys = ['type', 'message', 'rid', 'image', 'q', 'r', 'struct', 'player', 'inprogress', 'turn', 'action'];

Values = {
	type : ['action', 'click', 'cancel', 'meta', 'hex', 'edge', 'player'],
	action : ['build'], //TODO: Fix this.
	message : Object.keys(Messages),
	struct : Object.keys(library.nodes)
};

Types = ['default', 'request', 'update', 'confirm', 'rejected', 'chat'];

RejectionCode = [];

var RELATION = 127;
var JSON_OPEN = 126;
var JSON_CLOSE = 125;
var ARRAY_OPEN = 124;
var ARRAY_CLOSE = 123;
 
var BUFFER_SIZE = 16;
var message = {};

message.instance = function(type) {
	this.type = typeof type !== 'undefined' ? type : Types[0];
	this.binary = null;
	this.data = null;
	this.length = 0;
};

message.send = function(type, data) {
	var msg = new message.instance();
	msg.type = type;
	msg.data = data;
	msg.send();
};

message.decode = function(binary) {
	var buffer = new ArrayBuffer(binary.length);
    var view = new Int8Array(buffer);
    for (var i = 0; i < binary.length; ++i) {
        view[i] = binary[i];
    }

	var msg = new message.instance();
	msg.binary = view;
	msg.decode();
	return msg;
}

/**
 * Updates this.binary by encoding this.data
 */
message.instance.prototype.encode = function(data, dictionary) {
	if ( typeof data === 'undefined') {
		data = this.data;
		this.binary = new Int8Array(new ArrayBuffer(BUFFER_SIZE));

		if (this.type == null) {
			debug.error("Encoding failed: Message type has not been set.");
			return false;
		}

		this.write(this.type, Types);
	}

	if (this.binary === null) {
		this.binary = new Int8Array(new ArrayBuffer(BUFFER_SIZE));
	}

	if ( typeof dictionary === 'undefined') {
		dictionary = Keys;
	}

	debug.parse("encoding", toString.call(data), data);

	if (toString.call(data) === '[object Array]') {
		this.write(ARRAY_OPEN);

		for (var key in data) {
			if (typeof data[key] === 'undefined' || data[key] == null) {
				debug.error("Encoding failed: data was undefined.");
				return false;
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
				debug.error("Encoding failed: data was undefined.");
				return false;
			} else if (Values.hasOwnProperty(key)) {
				this.encode(data[key], Values[key]);
			} else {
				this.encode(data[key], dictionary);
			}
		}

		this.write(JSON_CLOSE);
	} else if ( typeof data === 'number') {
		this.write(data);
	} else {
		this.write(data, dictionary);
	}

	return true;
};

message.instance.prototype.write = function(value, dictionary) {
	//debug.parse("write", value, "to", this.length);
	var query = value;
	//TODO: remove this debug code.

	if (this.length >= this.binary.length) {
		//debug.parse("enlarge buffer to", this.binary.length + BUFFER_SIZE);
		var newbuffer = new ArrayBuffer(this.binary.length + BUFFER_SIZE);
		var newbinary = new Int8Array(newbuffer);
		newbinary.set(this.binary);
		this.binary = newbinary;
	}

	if ( typeof dictionary !== 'undefined') {
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

message.instance.prototype.decode = function() {
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
			this.type = this.read(this.binary[index], Types);
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
						key = this.read(this.binary[index], Keys);
						mode = 'keyvalue';
						debug.parse("mode: keyvalue");
						break;
					case 'keyvalue':
						if ( typeof Values[key] != 'undefined') {
							value = this.read(this.binary[index], Values[key]);
						}

						jsontree[depth][key] = value;
						mode = 'value';
						debug.parse("mode: value");
						break;
					case 'value':
						jsontree[depth].push(value);
						break;
				}
		}

		debug.parse(jsontree);
	}

	debug.parse(jsontree);
	this.data = jsontree[0];
};

message.instance.prototype.read = function(index, dictionary) {
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
		debug.parse("Returning ", index, " = ", result);
		return result;
	}
};

if ( typeof exports !== 'undefined') {
	message.instance.prototype.to = function(targets) {
		this.targets = targets;
		return this;
	};
}

message.instance.prototype.send = function() {
	debug.dispatch("Sending", this.type, this.data);
	this.encode();
	dispatch.send(this.binary, this.length, this.targets);
};

// Export data for a nodejs module.
if ( typeof exports !== 'undefined') {
	exports.instance = message.instance;
	exports.send = message.send;
	exports.decode = message.decode;
}

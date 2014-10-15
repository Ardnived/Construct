if ( typeof exports !== 'undefined') {
	var board = require("../shared/board");
}

if ( typeof library === 'undefined') {
	var library = {};
}

library.gates = {
	accel : {
		target : board.hex.type.empty_edge,

	},
	barrier : {
		target : board.hex.type.empty_edge,

	},
	attack_barrier : {
		target : board.hex.type.empty_edge,

	},
	barricade : {
		target : board.hex.type.empty_edge,

	},
};

library.nodes = {
	mainframe : {// MAINFRAME
		target : board.hex.type.empty_hex,
		image : "icon_17287.png",
		charge : function(hex, quantity) {
			hex.charge += quantity;
		},
		discharge : function(hex, quantity) {
			var edges = board.hex.edges(hex.q, hex.r);
		}
	},
	scrambler : {
		target : board.hex.type.empty_hex,
		image : "icon_21537.png",
		// TODO: Implement
	},
	prism : {
		target : board.hex.type.empty_hex,

	},
	diverter : {
		target : board.hex.type.empty_hex,

	},
	converter : {
		target : board.hex.type.empty_hex,

	},
	sensor : {
		target : board.hex.type.empty_hex,

	},
	pylon : {
		target : board.hex.type.empty_hex,

	},
	buffer : {
		target : board.hex.type.empty_hex,

	},
	alternator : {
		target : board.hex.type.empty_hex,

	},
};

library.nodes.get = function(id) {
	debug.flow('library.nodes.get', id, this[id], this);

	/*for (var name in library.nodes) {
		var node = library.nodes[name];

		if (node.id == id) {
			return node;
		}
	}*/
	return this[id];
};

library.gates.get = function(id) {
	for (var name in library.gates) {
		var gate = library.gates[name];

		if (gate.id == id) {
			return gate;
		}
	}
};

if ( typeof exports !== 'undefined') {
	exports.nodes = library.nodes;
	exports.gates = library.gates;
}
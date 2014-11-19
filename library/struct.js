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
	mainframe: { // MAINFRAME
		target: board.hex.type.empty_hex,
		init: function(hex) {},
		charge: function(hex, quantity, player) {
			if (hex.owner() === player) {
				hex.charge(quantity);
			} else {
				var remainder = Math.max(quantity - hex.charge(), 0);
				hex.charge(-quantity);

				if (remainder > 0) {
					hex.owner(player);
					hex.charge(remainder);
				} else {
					return 0;
				}
			}
			
			return hex.charge();
		},
		discharge: function(hex, quantity, player) {
			if (hex.charge() < 4) {
				quantity = Math.floor(quantity/2.0);
			}

			return hex.charge(-quantity, 1);
		}
	},
	scrambler : {
		target : board.hex.type.empty_hex,
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
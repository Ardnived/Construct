if (typeof exports !== 'undefined') {
	var board = require("../shared/board");
	var logic = require("../shared/logic");
}

if (typeof library === 'undefined') {
	var library = {};
}

library.micro = {
	decode: { // Reveal a single hex.
		target: [board.hex.type.hex],
		apply: function(target) {
			target.obscure = true;
		}
	},
	encode: { // Hide a single hex.
		targets: [board.hex.type.hex],
		apply: function(target) {
			target.obscure = false;
		}
	},
	reformat: { // Remove existing node or gate
		targets: [board.hex.type.struct],
		apply: function(target) {
			target.struct = null;
		}
	},
	empower: { // Charge a node or gate.
		targets: [board.hex.type.struct],
		apply: function(target) {
			target.charge++;
		}
	},
	reorient: { // Rotate a hex's edges. Clockwise or Counter-clockwise.
		targets: [board.hex.type.hex],
		apply: function(target) {
			board.hex.edges();
			// TODO: Do something.
		}
	},
	transfer: { // Swap all charge between two structs to another.
		targets: [board.hex.type.hex, board.hex.type.hex],
		apply: function(source, target) {
			var charge = source.charge;
			source.charge = target.charge;
			target.charge = charge;
		}
	},
	build: { // Build a structure.
		targets: [board.hex.type.empty_hex],
		apply: function(target, struct) {
			target.struct = struct;
		}
	}
};

library.macro = {
	wave: { // Send a wave of charges immediately.
		apply: function() {
			logic.resolve_round(board);
		}
	},
	power_surge: { // Charge all structs on the field.
		apply: function() {
			var hexes = board.hex.all();
			for (var key in hexes) {
				if (hexes[key].struct == null) {
					hexes[key].charge++;
				}
			}
			
			var edges = board.edge.all();
			for (var key in edges) {
				if (edges[key].struct == null) {
					edges[key].charge++;
				}
			}
		}
	},
	delay: { // Round will end one turn later.
		apply: function() {
			board.round_length++;
		}
	},
	relay: { // Round will end one turn earlier.
		apply: function() {
			board.round_length--;
		}
	},
};

for (var key in library.micro) {
	library.micro[key].key = key;
};

for (var key in library.macro) {
	library.macro[key].key = key;
};


if (typeof exports !== 'undefined') {
	exports.micro = library.micro;
	exports.macro = library.macro;
}
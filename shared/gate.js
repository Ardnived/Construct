if (typeof exports == 'undefined') {
	var board = require("../shared/board");
}

var gate = {};

gate._instance = function(sprite) {
	this.sprite = sprite;
};

gate._instance.prototype.attach = function(hex) {
	// Do Nothing
};

gate._instance.prototype.dettach = function(hex) {
	// Do Nothing
};

gate._instance.prototype.charge = function(hex, player, quantity) {
	if (hex.owner != player) {
		hex.charge -= quantity;
	} else {
		hex.charge += quantity;
	}
};

gate._instance.prototype.discharge = function(hex, quantity) {
	if (typeof quantity == 'undefined') {
		quantity = hex.charge;
	}
	
	var edges = board.hex.edges(hex.q, hex.r);
	var count = edges.length;
	for (var i in edges) {
		edges[i].charge(quantity/count);
	}
};

gate.super = gate._instance.prototype;


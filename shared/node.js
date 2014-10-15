if (typeof exports == 'undefined') {
	var board = require("../shared/board");
}

var node = {};

node._instance = function(sprite) {
	this.sprite = sprite;
};

node._instance.prototype.attach = function(hex) {
	// Do Nothing
};

node._instance.prototype.dettach = function(hex) {
	// Do Nothing
};

node._instance.prototype.charge = function(hex, player, quantity) {
	if (hex.owner != player) {
		hex.charge -= quantity;
	} else {
		hex.charge += quantity;
	}
};

node._instance.prototype.discharge = function(hex, quantity) {
	if (typeof quantity == 'undefined') {
		quantity = hex.charge;
	}
	
	var edges = board.hex.edges(hex.q, hex.r);
	var count = edges.length;
	for (var i in edges) {
		edges[i].charge(quantity/count);
	}
};

node.super = node._instance.prototype;

node.type.mainframe = new node._instance("icon_17287.png");
node.type.mainframe.charge = function(hex, player, quantity) {
	node.super.charge(hex, player, quantity);
	
	if (hex.charge <= 0) {
		// Player loses?
	}
};

node.type.scrambler = new node._instance("icon_21537.png");

node.type.prism = new node._instance("icon_17287.png");

node.type.diverter = new node._instance("icon_17287.png");

node.type.converter = new node._instance("icon_17287.png");

node.type.sensor = new node._instance("icon_17287.png");

node.type.pylon = new node._instance("icon_17287.png");

node.type.buffer = new node._instance("icon_17287.png");
node.type.buffer.attach = function(hex) {
	this.buffer = 0;
	this.threshhold = 20;
};
node.type.buffer.charge = function(hex, player, quantity) {
	this.buffer += quantity/2;
	quantity -= quantity/2;
	node.super.charge(hex, player, quantity);
};
node.type.buffer.discharge = function(hex, player, quantity) {
	if (typeof quantity == 'undefined') {
		quantity = hex.charge;
	}
	
	if (quantity > this.threshold) {
		node.super.discharge(this.threshhold);
	}
};

node.type.alternator = new node._instance("icon_17287.png");


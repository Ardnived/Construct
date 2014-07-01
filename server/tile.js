var board = require("../shared/board");

exports.instance = function(q, r) {
	this.q = q;
	this.r = r;
	this.struct = null;
};
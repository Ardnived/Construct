if (typeof module !== 'undefined') {
	var debug = require("../server/debug");
}

var abstract_edge = {
	instance: function(q1, r1, q2, r2) {
		this.q1 = q1;
		this.r1 = r1;
		this.q2 = q2;
		this.r2 = r2;
		this._owner = null;
	}
}

abstract_edge.instance.prototype.owner = function(new_owner) {
	if (typeof new_owner === 'undefined') {
		return this._owner;
	} else {
		this._owner = new_owner;
		return new_owner;
	}
}

if (typeof module != 'undefined') {
	exports.instance = abstract_edge.instance;
}

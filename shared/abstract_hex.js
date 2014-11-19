
var abstract_hex = {
	instance: function(q, r) {
		this.q = q;
		this.r = r;
		this._charge = 0;
		this._struct = null;
		this._owner = null;
	},
}

abstract_hex.instance.prototype.charge = function(quantity, min) {
	if (typeof min === 'undefined') min = 0;
	var result = this._charge;

	if (quantity != null) {
		if (quantity > 0) {
			this._charge += Math.abs(quantity);
		} else if (this._charge > 0) {
			quantity = Math.abs(quantity - min);

			if (this._charge >= quantity) {
				result = quantity;
				this._charge -= quantity;
			} else {
				result = this._charge - min;
				this._charge = min;
			}
		}
	}

	return result;
};

abstract_hex.instance.prototype.struct = function(new_struct) {
	if (typeof new_struct === 'undefined') {
		return this._struct;
	} else {
		this._struct = new_struct;
	}
};

abstract_hex.instance.prototype.owner = function(new_owner) {
	if (typeof new_owner === 'undefined') {
		return this._owner;
	} else {
		this._owner = new_owner;
	}
};

if (typeof module !== 'undefined') {
	exports.instance = abstract_hex.instance;
}

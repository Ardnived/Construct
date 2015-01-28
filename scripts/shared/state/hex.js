
define(
	function() {
		function hex(parent_state, q, r) {
			if (typeof q === 'undefined' || typeof r === 'undefined') {
				debug.error("A hex must have two coordinates", q, r);
			}
			
			this.parent_state = parent_state;
			this.q = q;
			this.r = r;
			this._units = {};
		};

		hex.prototype.units = function() {
			return this._units;
		}

		hex.prototype.edge = function(direction) {
			this.parent_state.edge(this.q, this.r, this.q + direction.offset.q, this.r + direction.offset.r);
		}

		return hex;
	}
);

hooks.on('unit:move', function(old_position) {
	debug.temp('got unit:move');
	var unit_index = this.owner+"_"+this.id;
	var hex;

	if (old_position != null) {
		hex = this.parent_state.hex(old_position.q, old_position.r);
		delete hex._units[unit_index];
		hooks.trigger('hex:unit_lost', hex, this);
	}
	
	if (this.q != null && this.r != null) {
		hex = this.parent_state.hex(this.q, this.r);
		hex._units[unit_index] = this;
		hooks.trigger('hex:unit_gained', hex, this);
	}
});

hooks.on('hex:is_visible', function(visible, player_id) {
	if (!visible) {
		var units = this.units();
		for (var i = units.length - 1; i >= 0; i--) {
			if (units[i].reveals && units[i].owner == player_id) {
				visible = true;
				break;
			}
		};
	}

	return visible;
});

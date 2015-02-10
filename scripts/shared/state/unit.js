
define(
	['shared/units/all'],
	function(unit_types) {
		var unit = function(parent_state, id, player_id) {
			this.parent_state = parent_state;
			this.id = id;
			this._type = 'sniffer'; // TODO: Define this properly.
			this.owner = player_id;
			this.q = null;
			this.r = null;
		};

		unit.prototype.type = function(new_type) {
			if (typeof new_type !== 'undefined') {
				this._type = new_type;
			}

			return unit_types[this._type];
		};

		unit.prototype.position = function(q, r) {
			// Both parameters are required.
			if (typeof q !== 'undefined') {
				var new_positon = null;
				if (q != null && typeof r !== 'undefined') {
					new_positon = { q: q, r: r };
				}

				var allowed = hooks.filter('unit:move', this, true, new_positon);

				if (allowed) {
					var old_position = null;
					if (this.q != null && this.r != null) {
						old_position = {
							q: this.q,
							r: this.r,
						};
					}

					if (new_positon == null) {
						this.q = null;
						this.r = null;
					} else {
						this.q = q;
						this.r = r;
					}

					hooks.trigger('unit:moved', this, old_position);
				}
			}

			return { q: this.q, r: this.r };
		};

		return unit;
	}
);

hooks.on('unit:update', function(data) {
	debug.temp('got unit:update', data);

	if ('q' in data || 'r' in data) {
		this.position(data.q, data.r);
	}
}, hooks.PRIORITY_CRITICAL);

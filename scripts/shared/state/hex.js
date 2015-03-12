
define(
	['shared/structs/all'],
	function(STRUCTS) {
		var root = {
			create: function(parent_state, q, r) {
				return HOOKS.trigger('hex:new', new hex(parent_state, q, r));
			},

			key: function(q, r) {
				return 'h'+q+','+r;
			},

			parse: function(key) {
				key = key.substring(1);
				key = key.split(",");

				return {
					q: parseInt(key[0]),
					r: parseInt(key[1]),
				}
			},
		};

		function hex(parent_state, q, r) {
			if (typeof q === 'undefined' || typeof r === 'undefined') {
				DEBUG.error("A hex must have two coordinates", q, r);
			}
			
			this.parent_state = parent_state;
			this.q = q;
			this.r = r;
			this._type = null;
			this._owner = null;
			this._units = {};
		};

		Object.defineProperty(hex.prototype, 'type', {
			get: function() {
				return this._type;
			},
			set: function(new_value) {
				if ((new_value !== null && this._type === null) || new_value !== this._type.key) {
					// TODO: Remove or refactor this check.
					if (typeof new_value !== 'string' && new_value != null) {
						DEBUG.fatal("Tried to set hex type as", new_value);
						return;
					}

					var old_type_key = null;

					if (this._type != null) {
						old_type_key = this._type.key;
					}

					if (new_value == null) {
						this._type = null;
					} else  {
						this._type = STRUCTS[new_value];
					}

					HOOKS.trigger('hex:change_type', this, old_type_key);
				}
			},
		});

		Object.defineProperty(hex.prototype, 'owner', {
			get: function() {
				return this._owner;
			},
			set: function(new_value) {
				if (new_value == null) {
					this._owner = null;
					return;
				}

				if (typeof new_value === 'object' && new_value.id != null) {
					new_value = new_value.id;
				}

				if (typeof new_value !== 'number') {
					debug.fatal("Tried to set unit type as", new_value);
				} else if (this._owner != new_value) {
					var old_owner = this._owner;
					this._owner = this.parent_state.player(new_value);
					HOOKS.trigger('hex:change_owner', this, old_owner);
				}
			},
		});

		Object.defineProperty(hex.prototype, 'key', {
			get: function() {
				return root.key(this.q, this.r);
			},
			set: undefined,
		});

		hex.prototype.unit = function(player_id) {
			if (player_id != null) {
				if (typeof player_id === 'object' && player_id.id != null) {
					player_id = player_id.id;
				}
				
				for (var key in this._units[player_id]) {
					var unit = this._units[player_id][key];

					if (unit.type.mobile) {
						return unit;
					}
				}
			}

			return null;
		};

		hex.prototype.units = function(player_id) {
			if (typeof player_id === 'object' && player_id.id != null) {
				player_id = player_id.id;
			}
			
			if (typeof player_id !== 'undefined') {
				return this._units[player_id];
			} else {
				return this._units;
			}
		};
		
		hex.prototype.edge = function(direction) {
			return this.parent_state.edge(this.q, this.r, this.q + direction.offset.q, this.r + direction.offset.r);
		};

		return root;
	}
);

HOOKS.on('unit:moved', function(old_position) {
	var hex;
	var key = this.key;

	if (old_position != null) {
		hex = this.parent_state.hex(old_position.q, old_position.r);
		delete hex._units[this.owner.id][this.id];

		if (hex.type != null && hex.type.ownable && this.owner === hex.owner) {
			var units = hex.units();

			for (var key in units) {
				var unit = units[key];

				if (unit.mobile && unit.owner !== hex.owner) {
					hex.owner = unit.owner;
					break;
				}
			}
		}

		HOOKS.trigger('hex:unit_lost', hex, this);
	}
	
	if (this.position != null) {
		hex = this.hex;

		if (!(this.owner.id in hex._units)) {
			hex._units[this.owner.id] = {};
		}

		if (hex.type != null && hex.type.ownable && hex.unit(hex.owner) == null) {
			hex.owner = this.owner;
		}

		hex._units[this.owner.id][this.id] = this;
		HOOKS.trigger('hex:unit_gained', hex, this);
	}
}, HOOKS.ORDER_EXECUTE);

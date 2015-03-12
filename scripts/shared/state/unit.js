
define(
	['shared/units/all'],
	function(UNITS) {
		var root = {
			create: function(parent_state, unit_index, player) {
				return HOOKS.trigger('unit:new', new unit(parent_state, unit_index, player));
			},

			key: function(unit_index, player_index) {
				return 'p'+player_index+'u'+unit_index;
			},
		};

		var unit = function(parent_state, unit_index, player) {
			this.parent_state = parent_state;
			this.id = unit_index;
			this._type = null;
			this._owner = player;
			this._position = null;
		};

		Object.defineProperty(unit.prototype, 'type', {
			get: function() {
				return this._type;
			},
			set: function(new_value) {
				if (typeof new_value !== 'string') {
					debug.fatal("Tried to set unit type as", new_value);
				} else {
					var old_value = this._type;
					this._type = UNITS[new_value];
					HOOKS.trigger('unit:change_type', this, old_value)
				}
			},
		});

		Object.defineProperty(unit.prototype, 'owner', {
			get: function() {
				return this._owner;
			},
			set: function(new_value) {
				if (typeof new_value === 'object' && new_value.id != null) {
					new_value = new_value.id;
				}

				if (typeof new_value !== 'number') {
					debug.fatal("Tried to set unit type as", new_value);
				} else {
					this._owner = this.parent_state.player(new_value);
				}
			},
		});

		Object.defineProperty(unit.prototype, 'hex', {
			get: function() {
				if (this._position == null) {
					return null;
				} else {
					return this.parent_state.hex(this._position.q, this._position.r);
				}
			},
			set: function(new_value) {
				this.position = {
					q: new_value.q, 
					r: new_value.r,
				};
			},
		});

		Object.defineProperty(unit.prototype, 'key', {
			get: function() {
				return root.key(this.id, this.owner.id);
			},
			set: undefined,
		});

		Object.defineProperty(unit.prototype, 'position', {
			get: function() {
				return this._position
			},
			set: function(new_value) {
				if (typeof new_value === 'array') {
					new_value = {
						q: new_value[0],
						r: new_value[1],
					};
				}

				var allowed = HOOKS.filter('unit:move', this, true, new_value);

				if (allowed) {
					var old_position = this._position;
					if (old_position == null) {
						HOOKS.trigger('unit:spawned', this);
					}

					this._position = new_value;

					if (new_value == null) {
						HOOKS.trigger('unit:destroyed', this, old_position);
					}

					HOOKS.trigger('unit:moved', this, old_position);
				}
			},
		});

		return root;
	}
);

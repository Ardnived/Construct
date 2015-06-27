
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

			parse_key: function(key) {
				return parseInt(key.split('u')[1]);
			},
		};

		var unit = function(parent_state, unit_index, player) {
			this.parent_state = parent_state;
			this.id = unit_index;
			this.last_action = -1;
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
					DEBUG.fatal("Tried to set unit type as", new_value);
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

				HOOKS.trigger('unit:move', this, {
					old_position: this._position,
					new_position: new_value,
				});
			},
		});

		HOOKS.on('unit:move', function(args) {
			if (args.old_position == null) {
				HOOKS.trigger('unit:spawned', this, args.new_position);
			}

			if (args.new_position == null) {
				DEBUG.game("Destroyed a unit at", args.old_position, this.key);
				HOOKS.trigger('unit:destroyed', this, args.old_position);
			}

			this._position = args.new_position;
		}, HOOKS.ORDER_EXECUTE);

		return root;
	}
);

HOOKS.on('unit:data', function(args) {
	var data = args.data;
	data.type = 'unit';
	data.unit_id = this.id;

	if (typeof args.include === 'undefined' || args.include.indexOf('owner') != -1) {
		data.player_id = this.owner.id;
	}

	if (typeof args.include === 'undefined' || args.include.indexOf('type') != -1) {
		if (this.type == null) {
			DEBUG.error("This unit's type is not set,", this);
		} else {
			data.unit_type = this.type.key;
		}
	}

	if (typeof args.include === 'undefined' || args.include.indexOf('position') != -1) {
		if (this.position != null) { // TODO: This check could maaaybe cause problems.
			data.position = [this.position.q, this.position.r];
		}
	}
}, HOOKS.ORDER_EXECUTE);

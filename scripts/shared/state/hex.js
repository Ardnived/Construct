
requirejs(
	['shared/state/team', 'shared/directions'],
	function(TEAM, DIRECTIONS) {
		HOOKS.on('hex:data', function(args) {
			var data = args.data;
			data.type = 'hex';
			data.position = [this.q, this.r];

			if (typeof args.include === 'undefined' || args.include.indexOf('owner') != -1) {
				if (this.owner != null) {
					data.player_id = this.owner.id;
				} else {
					data.player_id = null;
				}
			}

			if (typeof args.include === 'undefined' || args.include.indexOf('type') != -1) {
				if (this.type === null) {
					data.hex_type = null;
				} else {
					data.hex_type = this.type.key;
				}
			}

			if (typeof args.include === 'undefined' || args.include.indexOf('lockdown') != -1) {
				if (args.player.team.visibility(this) > TEAM.VISION_NONE) {
					data.active = !this.lockdown;
				}
			}

			if (typeof args.include === 'undefined' || args.include.indexOf('units') != -1) {
				data.units = {};

				var units = this.units();
				for (var p in units) {
					var owner = this.parent_state.player(p);

					if (owner.team != args.player.team) {
						data.units[p] = units[p].id;
					}
				}
			}

			if (typeof args.include === 'undefined' || args.include.indexOf('traps') != -1) {
				if (args.player.team.visibility(this) >= TEAM.VISION_FULL) {
					data.traps = {};

					var traps = this.traps();
					for (var trap_key in traps) {
						data.traps[trap_key] = [];

						for (var i = traps[trap_key].length - 1; i >= 0; i--) {
							data.traps[trap_key].push(parseInt(traps[trap_key][i]));
						}
					}
				}
			}

			if (typeof args.include === 'undefined' || args.include.indexOf('edges') != -1) {
				if (args.player.team.visibility(this) >= TEAM.VISION_PARTIAL) {
					data.edges = [];

					for (var i in DIRECTIONS.keys) {
						var key = DIRECTIONS.keys[i];
						
						if (this.edge(DIRECTIONS[key]).active) {
							data.edges.push(key);
						}
					}
				}
			}
		}, HOOKS.ORDER_EXECUTE);
	}
);

define(
	['shared/structs/all', 'shared/round', CONFIG.platform+"/database"],
	function(STRUCTS, ROUND, DATABASE) {
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

			this._type     = DATABASE.string(this, 'type');
			this._owner    = DATABASE.integer(this, 'owner');
			this._lockdown = DATABASE.bool(this, 0, false);
			this._units    = DATABASE.hash(this, 'units');
			this._traps    = DATABASE.hash(this, 'traps');
		};

		Object.defineProperty(hex.prototype, 'key', {
			get: function() {
				return root.key(this.q, this.r);
			},
			set: undefined,
		});

		Object.defineProperty(hex.prototype, 'type', {
			get: function() {
				var type_key = this._type.get();

				if (type_key != null) {
					return STRUCTS[type_key];
				} else {
					return null;
				}
			},
			set: function(new_value) {
				var old_type_key = null;

				if (this.type != null) {
					old_type_key = this.type.key;
				}

				if (new_value != old_type_key) {
					// TODO: Remove or refactor this check.
					if (typeof new_value !== 'string' && new_value != null) {
						DEBUG.fatal("Tried to set hex type as", new_value);
						return;
					}

					this._type.set(new_value);
					HOOKS.trigger('hex:change_type', this, old_type_key);
				}
			},
		});

		Object.defineProperty(hex.prototype, 'owner', {
			get: function() {
				var player_id = this._owner.get();

				if (player_id != null) {
					return this.parent_state.player(player_id);
				} else {
					return null;
				}
			},
			set: function(new_value) {
				if (typeof new_value === 'object' && new_value != null && new_value.id != null) {
					new_value = new_value.id;
				}

				if (typeof new_value !== 'number' && new_value != null) {
					DEBUG.fatal("Tried to set hex owner as", new_value);
				} else if (this._owner != new_value) {
					var old_owner = this.owner;
					this._owner.set(new_value);
					HOOKS.trigger('hex:change_owner', this, old_owner);
				}
			},
		});

		Object.defineProperty(hex.prototype, 'lockdown', {
			get: function() {
				return this._lockdown.get();
			},
			set: function(new_value) {
				DEBUG.temp("Change lockdown for", this.key, "to", new_value)
				if (this._lockdown != new_value) {
					var old_lockdown_value = this.lockdown;
					this._lockdown.set(new_value);
					HOOKS.trigger('hex:change_lockdown', this, old_lockdown_value);
				}
			},
		});

		hex.prototype.unit = function(player) {
			if (player == null) return null;

			var unit_index = this._units.get(player.id);
			if (unit_index == null) {
				return null;
			} else {
				return player.unit(unit_index);
			}
		};

		hex.prototype.units = function() {
			var units = this._units.get();

			for (var k in units) {
				var player_id = parseInt(k);
				var unit_id = parseInt(units[k])
				units[player_id] = this.parent_state.player(player_id).unit(unit_id);
			}

			return units;
		};
		
		hex.prototype.edge = function(direction) {
			return this.parent_state.edge(this.q, this.r, this.q + direction.offset.q, this.r + direction.offset.r);
		};

		hex.prototype.neighbour = function(direction) {
			return this.parent_state.hex(this.q + direction.offset.q, this.r + direction.offset.r);
		};

		hex.prototype.traps = function(trap_key, team_id, value) {
			if (typeof trap_key === 'undefined') {
				return this._traps.get_list();
			}

			var teams_list = this._traps.get_list(trap_key);

			if (typeof team_id === 'undefined') {
				return teams_list;
			}

			var trap_index = teams_list.indexOf(team_id);

			if (typeof value === 'undefined') {
				return trap_index !== -1;
			} else if (value == false && trap_index !== -1) {
				delete teams_list[trap_index];
				this._traps.set_list(trap_key, teams_list);

				HOOKS.trigger('hex:trap_lost', this, {
					key: trap_key,
					team: this.parent_state.team(team_id),
				});
			} else {
				teams_list.push(team_id);
				this._traps.set_list(trap_key, teams_list);

				HOOKS.trigger('hex:trap_gained', this, {
					key: trap_key,
					team: this.parent_state.team(team_id),
				});
			}
		};

		hex.prototype.clear_traps = function() {
			this._traps.del();
		};

		HOOKS.on('hex:sync', function(new_round) {
			if (new_round % ROUND.DURATION_LONG === 0) {
				this.lockdown = false;
			}
		});

		return root;
	}
);

HOOKS.on('unit:move', function(args) {
	if (args.old_position == args.new_position) {
		return false;
	}

	if (args.old_position != null) {
		var hex = this.parent_state.hex(args.old_position.q, args.old_position.r);

		if (hex.lockdown === true) {
			return false;
		}
	}

	if (args.new_position != null) {
		var hex = this.parent_state.hex(args.new_position.q, args.new_position.r);

		if (hex.lockdown === true) {
			return false;
		}
	}
}, HOOKS.ORDER_VETO);

HOOKS.on('unit:move', function(args) {
	var hex;
	var key = this.key;

	if (args.old_position != null) {
		hex = this.parent_state.hex(args.old_position.q, args.old_position.r);
		hex._units.del(this.owner.id);

		if (hex.type != null && hex.type.ownable && this.owner === hex.owner) {
			var units = hex.units();

			for (var key in units) {
				var unit = units[key];

				if (unit.owner !== hex.owner) {
					hex.owner = unit.owner;
					break;
				}
			}
		}

		HOOKS.trigger('hex:unit_lost', hex, this);
	}
	
	if (args.new_position != null) {
		hex = this.parent_state.hex(args.new_position.q, args.new_position.r);

		if (hex.type != null && hex.type.ownable && hex.unit(hex.owner) == null) {
			hex.owner = this.owner;
		}

		hex._units.set(this.owner.id, this.id);
		HOOKS.trigger('hex:unit_gained', hex, this);
	}
}, HOOKS.ORDER_AFTER);

// TODO: Render UI to indicate when a hex is locked down.

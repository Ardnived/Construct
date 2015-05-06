
define(
	['shared/round', 'shared/state/hex'],
	function(ROUND, HEX) {
		var root = {
			create: function(parent_state, team_index) {
				return HOOKS.trigger('team:new', new team(parent_state, team_index));
			},

			key: function(team_index) {
				return 't'+team_index;
			},

			VISION_NONE:    0,
			VISION_HIDDEN:  1,
			VISION_PARTIAL: 2,
			VISION_FULL:    3,
		};

		var team = function(parent_state, team_index) {
			this.parent_state = parent_state;
			this.id = team_index;
			this._points = 0;
			this._visibility = {};
		};

		team.prototype.visibility = function(hex, reason, new_value) {
			if (typeof hex === 'undefined') {
				return;
			}

			var key = hex.key;

			if (typeof reason === 'undefined') {
				// Then we want to retrieve the current visibility for the hex.
				if (key in this._visibility) {
					return this._visibility[key]['level'];
				} else {
					return root.VISION_NONE;
				}

				var vision = root.VISION_NONE;

				if (key in this._visibility) {
					for (var reason in this._visibility[key]) {
						var check = this._visibility[key][reason];

						if (check >= root.VISION_FULL) {
							return root.VISION_FULL;
						} else if (check >= vision) {
							vision = check;
						}
					}
				}
				
				return vision;
			} else if (new_value != root.VISION_NONE) {
				// Otherwise, we want to update the visibility for this hex.
				if (key in this._visibility) {
					// If key exists, then we want to update the old value.
					var old_level = this._visibility[key]['level'];

					if (!(reason in this._visibility[key]) || new_value > this._visibility[key]['reasons'][reason]) {
						// If the reason doesn't exist, or the new value is better, update it.
						this._visibility[key]['reasons'][reason] = new_value;
					}

					if (new_value > old_level) {
						// If the new value is better than the old level, replace it.
						this._update_level(hex, new_value);
					}
				} else {
					// Otherwise, create a new entry for this hex.
					this._visibility[key] = {
						level: root.VISION_NONE,
						reasons: {},
					};
					this._visibility[key]['reasons'][reason] = new_value;

					this._update_level(hex, new_value);
				}
			} else if (key in this._visibility) {
				// Otherwise, delete the entry.
				if (reason in this._visibility[key]['reasons']) {
					var old_value = this._visibility[key]['reasons'][reason];
					delete this._visibility[key]['reasons'][reason];

					if (old_value >= this._visibility[key]['level']) {
						this._update_level(hex);
					}

					if (Object.keys(this._visibility[key]['reasons']).length < 1) {
						if (old_value > root.VISION_HIDDEN) {
							// When you leave a hex, keep this lingering interest. Incase something happens before the next sync.
							this._visibility[key]['reasons'][ROUND.INTERVAL_NONE] = root.VISION_HIDDEN;
							this._update_level(hex, root.VISION_HIDDEN);
						} else {
							delete this._visibility[key];
						}
					}
				}
			}
		};

		team.prototype._update_level = function(hex, new_level) {
			var key = hex.key;

			if (typeof new_level == 'undefined') {
				new_level = root.VISION_NONE;

				var reason_list = this._visibility[key]['reasons'];
				for (var reason in reason_list) {
					if (reason_list[reason] > new_level) {
						new_level = reason_list[reason];
					}
				}
			}

			var old_level = this._visibility[key]['level'];

			if (new_level != old_level) {
				this._visibility[key]['level'] = new_level;
				HOOKS.trigger('hex:change_visibility', hex, {
					team: this,
					new_value: new_level,
					old_value: old_level,
				});
			}
			
			DEBUG.temp("Update visibility for", this.key, '-', hex.key, "from", old_level, "to", new_level);
		}

		Object.defineProperty(team.prototype, 'key', {
			get: function() {
				return root.key(this.id);
			},
			set: undefined,
		});

		Object.defineProperty(team.prototype, 'points', {
			get: function() {
				return this._points;
			},
			set: function(new_value) {
				if (new_value != this._points) {
					var old_points = this._points;
					this._points = new_value;

					if (this._points >= CONFIG.score_goal) {
						for (var i = this.parent_state.meta.player_count - 1; i >= 0; i--) {
							var player = this.parent_state.player(i);
							if (player.team != this) {
								player.playing = false;
							}
						}
					}

					HOOKS.trigger('team:change_points', this, old_points);
				}
			},
		});

		HOOKS.on('team:sync', function(current_round) {
			DEBUG.flow("got team:sync", this.key, current_round);
			var visibility_list = this._visibility;
			var intervals = ROUND.intervals(current_round);

			for (var key in visibility_list) {
				var position = HEX.parse(key);
				var hex = this.parent_state.hex(position.q, position.r);

				for (var i in intervals) {
					this.visibility(hex, intervals[i], root.VISION_NONE);
				}
			}
		});

		HOOKS.on('hex:unit_gained', function(unit) {
			unit.owner.team.visibility(this, unit.key, root.VISION_PARTIAL);
		});

		HOOKS.on('hex:unit_lost', function(unit) {
			unit.owner.team.visibility(this, unit.key, root.VISION_NONE);
		});

		HOOKS.on('hex:change_owner', function(old_owner) {
			if (this.type != null) {
				if (old_owner != null) {
					old_owner.team.visibility(this, 'owner', root.VISION_NONE);
				}

				if (this.owner != null) {
					this.owner.team.visibility(this, 'owner', root.VISION_PARTIAL);
				}
			}
		});

		return root;
	}
);

HOOKS.on('team:data', function(args) {
	var data = args.data;
	data.type = 'team';
	data.team_id = this.id;

	if (typeof args.include === 'undefined' || args.include.indexOf('points') != -1) {
		data.number = this.points;
	}
}, HOOKS.ORDER_EXECUTE);

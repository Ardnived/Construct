
define(
	['shared/state/unit', 'shared/round'],
	function(UNIT, ROUND) {
		var root = {
			create: function(parent_state, index) {
				return HOOKS.trigger('player:new', new player(parent_state, index));
			},

			key: function(index) {
				return 'p'+index;
			},
		};

		var player = function(parent_state, index) {
			this.parent_state = parent_state;
			this.id = index;
			this.team = this.parent_state.team(index); // TODO: Implement teams
			this.playing = true; // Indicates whether this player is still playing. False indicates that they have lost.
			this._active = true; // TODO: Revaluate when this value should be set. Maybe null = spectator.
			this._points = 0;
			this._units = [];
			this._visibility = {};

			// TODO: Find a better place to set this.
			//this.unit(0).type = 'sniffer';
			this.unit(1).type = 'peeper';
			this.unit(2).type = 'bouncer';
			//this.unit(3).type = 'enforcer';
			//this.unit(4).type = 'seeker';
			this.unit(5).type = 'cleaner';
			this.unit(6).type = 'carrier';
		};

		Object.defineProperty(player.prototype, 'active', {
			get: function() {
				return this._active;
			},
			set: function(new_value) {
				if (this._active != new_value) {
					this._active = new_value;
					HOOKS.trigger('player:change_active', this);
				}
			},
		});

		Object.defineProperty(player.prototype, 'key', {
			get: function() {
				return root.key(this.id);
			},
			set: undefined,
		});

		Object.defineProperty(player.prototype, 'points', {
			get: function() {
				return this._points;
			},
			set: function(new_value) {
				if (new_value != this._points) {
					var old_points = this._points;
					this._points = new_value;

					if (this._points >= CONFIG.score_goal) {
						for (var i = this.parent_state.meta.player_count - 1; i >= 0; i--) {
							this.parent_state.player(i).playing = false;
						}

						this.playing = true;
					}

					HOOKS.trigger('player:change_points', this, old_points);
				}
			},
		});

		player.prototype.unit = function(unit_index) {
			var key = UNIT.key(unit_index, this.id);
			
			if (!(key in this._units)) {
				this._units[key] = UNIT.create(this.parent_state, unit_index, this);
			}
			
			return this._units[key];
		};

		player.prototype.units = function() {
			return this._units;
		};

		return root;
	}
);

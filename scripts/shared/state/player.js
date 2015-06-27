
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

			parse_key: function(key) {
				return parseInt(key.substring(1));
			},
		};

		var player = function(parent_state, index) {
			this.parent_state = parent_state;
			this.id = index;
			this.team = this.parent_state.team(index); // TODO: Implement teams
			this.playing = true; // Indicates whether this player is still playing. False indicates that they have lost.
			this._action_points = CONFIG.actions_per_turn;
			this._units = [];

			// TODO: Find a better place to set this.
			this.unit(0).type = 'sniffer';
			this.unit(1).type = 'peeper';
			this.unit(2).type = 'bouncer';
			this.unit(3).type = 'enforcer';
			this.unit(4).type = 'seeker';
			this.unit(5).type = 'cleaner';
			this.unit(6).type = 'carrier';
		};

		Object.defineProperty(player.prototype, 'active', {
			get: function() {
				return this._action_points > 0;
			},
			set: function(new_value) {
				this.action_points = (new_value ? CONFIG.actions_per_turn : 0);
			},
		});

		Object.defineProperty(player.prototype, 'action_points', {
			get: function() {
				return this._action_points;
			},
			set: function(new_value) {
				if (this._action_points != new_value) {
					var old_value = this._action_points;
					this._action_points = new_value;
					HOOKS.trigger('player:change_action_points', this, old_value);

					if (old_value > 0 != this.active) {
						var old_active_value = (old_value > 0);
						HOOKS.trigger('player:change_active', this, old_active_value);
					}
				}
			},
		});

		Object.defineProperty(player.prototype, 'key', {
			get: function() {
				return root.key(this.id);
			},
			set: undefined,
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

HOOKS.on('player:data', function(args) {
	var data = args.data;
	data.type = 'player';
	data.player_id = this.id;

	if (typeof args.include === 'undefined' || args.include.indexOf('active') != -1) {
		data.active = this.active;
	}
}, HOOKS.ORDER_EXECUTE);

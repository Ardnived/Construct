
define(
	['shared/state/unit'],
	function(unit) {
		var player = function(parent_state, id) {
			this.parent_state = parent_state;
			this.id = id;
			this._active = true; // TODO: Revaluate when this value should be set. Maybe null = spectator.
			this._units = [];

			// TODO: Find a better place to set this.
			this.unit(0).type('sniffer');
			this.unit(1).type('bouncer');
			this.unit(2).type('sniffer');
		};

		player.prototype = {
			unit: function(id) {
				if (!(id in this._units)) {
					var player_id = this.id;
					this._units[id] = hooks.trigger('unit:new', new unit(this.parent_state, id, player_id));
				}
				
				return this._units[id];
			},

			units: function() {
				return this._units;
			},
		};

		Object.defineProperty(player.prototype, 'active', {
			get: function() {
				return this._active;
			},
			set: function(new_value) {
				if (this._active != new_value) {
					this._active = new_value;
				}

				hooks.trigger('player:change_active', this);
			},
		});

		return player;
	}
);


hooks.on('player:update', function(data) {
	this.active = data.active;

}, hooks.PRIORITY_CRITICAL);

hooks.on('player:change_active', function(data) {
	if (this.active == false) {
		// TODO: Make this more efficient?

		var round_ended = true;
		for (var i = this.parent_state.meta.player_count - 1; i >= 0; i--) {
			if (this.parent_state.player(i).active) {
				round_ended = false;
				break;
			}
		};

		debug.temp('round ended:', round_ended, '.');

		if (round_ended) {
			for (var i = this.parent_state.meta.player_count - 1; i >= 0; i--) {
				this.parent_state.player(i).active = true;
			};
		}
	}
});


define(
	['shared/state/unit'],
	function(unit) {
		var player = function(parent_state, id) {
			this.parent_state = parent_state;
			this.id = id;
			this._units = [];
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
			}
		};

		return player;
	}
);

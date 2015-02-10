
define(
	function() {
		var root = {
			hex: function(state, data, player) {
				return data.hasOwnProperty('q') && data.hasOwnProperty('r')
					&& state.in_bounds(data.q, data.r);
			},
			empty: function(state, data, player) {
				return this.hex(data, player)
					&& state.hex(data.q, data.r).unit() == null;
			},
			unit: function(state, data, player) {
				return this.hex(data, player)
					&& state.hex(data.q, data.r).unit() != null;
			},
			own: function(state, data, player) {
				return this.unit(data, player)
					&& state.hex(data.q, data.r).unit(player) != null;
			},
			ally: function(state, data, player) {
				// TODO: Properly implement this.
				return this.unit(data, player)
					&& state.hex(data.q, data.r).unit(player) != null;
			},
		};

		return root;
	}
);

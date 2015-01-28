
define(
	{
		hex: function(state, data, player) {
			return data.hasOwnProperty('q') && data.hasOwnProperty('r')
				&& state.hex.get(data.q, data.r) != null;
		},
		empty: function(state, data, player) {
			return this.hex(data, player)
				&& state.hex.get(data.q, data.r).unit() == null;
		},
		unit: function(state, data, player) {
			return this.hex(data, player)
				&& state.hex.get(data.q, data.r).unit() != null;
		},
		own: function(state, data, player) {
			return this.unit(data, player)
				&& state.hex.get(data.q, data.r).owner() == player;
		},
		ally: function(state, data, player) {
			// TODO: Properly implement this.
			return this.unit(data, player)
				&& state.hex.get(data.q, data.r).owner() == player;
		},
	}
);


define(
	function() {
		var unit = function(parent_state, id, player_id) {
			this.parent_state = parent_state;
			this.id = id;
			this.type = 'sniffer'; // TODO: Define this properly.
			this.owner = player_id;
			this.q = null;
			this.r = null;
		};

		unit.prototype.position = function(q, r) {
			if (typeof q !== 'undefined' || typeof r !== 'undefined') {
				var old_position = null;

				if (this.q != null && this.r != null) {
					old_position = {
						q: this.q,
						r: this.r,
					};
				}

				this.q = (q !== null) ? q : this.q;
				this.r = (r !== null) ? r : this.r;

				hooks.trigger('unit:move', this, old_position);
			}

			return { q: this.q, r: this.r };
		};

		return unit;
	}
);

hooks.on('unit:update', function(data) {
	if ('q' in data || 'r' in data) {
		this.position(data.q, data.r);
	}
});

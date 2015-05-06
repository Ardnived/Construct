
define(
	function() {
		var root = {
			INTERVAL_NONE: 'd0',
			DURATION_INSTANT: 1,
			DURATION_SHORT: 3,
			DURATION_LONG: 5,

			interval: function(turn, duration) {
				return 't'+turn+'d'+duration;
			},

			intervals: function(turn) {
				var intervals = [];
				if (turn >= root.DURATION_INSTANT) intervals.push(root.DURATION_INSTANT);
				if (turn >= root.DURATION_SHORT) intervals.push(root.DURATION_SHORT);
				if (turn >= root.DURATION_LONG) intervals.push(root.DURATION_LONG);

				for (var i = intervals.length - 1; i >= 0; i--) {
					intervals[i] = root.interval(turn - intervals[i], intervals[i]);
				}

				intervals.push(root.INTERVAL_NONE);

				return intervals;
			}
		};

		if (CONFIG.is_server) {
			HOOKS.on('player:change_active', function() {
				if (this.active == false) {
					var state = this.parent_state;
					state.meta.ready_players++;

					if (state.meta.ready_players >= state.meta.player_count) {
						// TODO: Don't sync until the server tells us to.
						HOOKS.trigger('state:sync', state);
					}
				}
			});
		}

		return root;
	}
);
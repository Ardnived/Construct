
define(
	['shared/rout'],
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

		HOOKS.on('player:change_active', function() {
			if (this.active == false) {
				var state = this.parent_state;
				// TODO: Make this more efficient? Maybe use STATE.meta.ready_players

				var round_ended = true;
				for (var i = state.meta.player_count - 1; i >= 0; i--) {
					var player = state.player(i);

					if (player.active) {
						round_ended = false;
						DEBUG.temp('round has not ended due to player', player.id);
						break;
					}
				};

				if (round_ended) {
					state.meta.round += 1;
					HOOKS.trigger('state:sync', state);
				}
			}
		});

		return root;
	}
);
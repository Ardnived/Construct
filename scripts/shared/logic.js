
define(
	['shared/actions'],
	function(actions) {
		return {
			can_apply_action: function(player, action, targets) {
				action = actions[action];

				for (var i = action.targets.length - 1; i >= 0; i--) {
					if (targets[i] == null || !action.targets[i](targets[i], player)) {
						return false;
					}
				};

				return true;
			},

			is_turn_over: function(state) {
				var players = state.player();
				var turn;
				
				for (var i in players) {
					if (turn == null) {
						turn = players[i].turn;
					} else if (turn != players[i].turn) {
						return false;
					}
				}
				
				return true;
			},
		}
	}
);

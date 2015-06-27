
define(
	function() {
		var counter = {};

		function modify_count(team, value) {
			if (!('_rout_counter' in team)) {
				team._rout_counter = 0;
			}

			team._rout_counter += value;

			if (team._rout_counter <= 0) {
				var players = team.parent_state.players();
				DEBUG.flow("Team", team.key, "has been routed.");
				
				for (var key in players) {
					if (players[key].team === team) {
						DEBUG.flow("Player", key, "is no longer playing. (routed)");
						players[key].playing = false;
					}
				};
			}
		}

		HOOKS.on('unit:spawned', function() {
			modify_count(this.owner.team, +1);
		});

		HOOKS.on('unit:destroyed', function(old_position) {
			modify_count(this.owner.team, -1);
		});

		HOOKS.on('hex:change_owner', function(old_owner) {
			if (old_owner != null) {
				modify_count(old_owner.team, -1);
			}

			if (this.owner != null) {
				modify_count(this.owner.team, +1);
			}
		});
	}
);

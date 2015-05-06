
define(
	['shared/state/player', 'shared/round', './tmp_players'],
	function(PLAYER, ROUND) {
		document.getElementById('topbar').innerHTML = "<br><div style='color:lightgreen;'>You have "+CONFIG.actions_per_turn+" actions left.</div>";

		HOOKS.on('player:change_action_points', function(data) {
			var turns_till_sync = ROUND.DURATION_LONG - (GAME_STATE.meta.round % ROUND.DURATION_LONG);

			var active_player_count = 0;
			var players = GAME_STATE.players();
			var current_player_active = false;
			var local_player = GAME_STATE.meta.local_player;

			for (var k in players) {
				if (players[k].active == true) {
					if (k === local_player.key) {
						current_player_active = true;
					} else {
						active_player_count++;
					}
				}
			};

			var topbar_string = turns_till_sync+' turns until objectives shift. - Waiting for '+active_player_count+' players...';

			if (current_player_active) {
				topbar_string += "<br><div style='color:lightgreen;'>You have "+local_player.action_points+" actions left.</div>";
			} else {
				topbar_string += "<br><div style='color:orangered;'>You have already taken your turn.</div>";
			}

			document.getElementById('topbar').innerHTML = topbar_string;
		}, HOOKS.ORDER_LAST+1);
	}
);

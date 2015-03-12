
define(
	['shared/state/player', './tmp_players'],
	function(PLAYER) {
		document.getElementById('topbar').innerHTML = "<br><div style='color:darkgreen;'>You can take your turn now.</div>";

		HOOKS.on('player:change_active', function(data) {
			var turns_till_sync = 3 - (GAME_STATE.meta.round % 3);

			var active_player_count = 0;
			var players = GAME_STATE.players();
			var current_player_active = false;
			var local_player_key = GAME_STATE.meta.local_player.key;

			for (var k in players) {
				if (players[k].active == true) {
					if (k === local_player_key) {
						current_player_active = true;
					} else {
						active_player_count++;
					}
				}
			};

			var topbar_string = turns_till_sync+' turns until sync. - Waiting for '+active_player_count+' players...';

			if (current_player_active) {
				topbar_string += "<br><div style='color:green;'>You can take your turn now.</div>";
			} else {
				topbar_string += "<br><div style='color:orangered;'>You have already taken your turn.</div>";
			}

			document.getElementById('topbar').innerHTML = topbar_string;
		}, HOOKS.ORDER_LAST+1);
	}
);

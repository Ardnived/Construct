
define(
	['./tmp_players'],
	function() {
		document.getElementById('topbar').innerHTML = "<br><div style='color:darkgreen;'>You can take your turn now.</div>";

		hooks.on('player:change_active', function(data) {
			var turns_till_sync = 3 - (GAME_STATE.round % 3);

			var active_player_count = 0;
			var players = GAME_STATE.players();
			var current_player_active = false;
			for (var i in players) {
				if (players[i].active == true) {
					if (i == GAME_STATE.meta.local_player_id) {
						debug.temp('local player is', i, 'from', GAME_STATE.meta.local_player_id);
						current_player_active = true;
					} else {
						active_player_count++;
					}
				}
			};

			debug.temp('current_player_active', current_player_active);

			var topbar_string = turns_till_sync+' turns until sync. - Waiting for '+active_player_count+' players...';

			if (current_player_active) {
				topbar_string += "<br><div style='color:darkgreen;'>You can take your turn now.</div>";
			} else {
				topbar_string += "<br><div style='color:darkred;'>You have already taken your turn.</div>";
			}

			document.getElementById('topbar').innerHTML = topbar_string;
		}, hooks.PRIORITY_LAST+1);
	}
);

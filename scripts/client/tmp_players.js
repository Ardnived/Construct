
define(
	function() {
		HOOKS.on('player:new', function() {
			var status = (this.action_points > 0 ? this.action_points+' actions left' : 'waiting');
			document.getElementById('right').innerHTML += "<div id='player-"+this.id+"' style='padding: 2px;'>Player "+this.id+": "+status+"</div>";
		}, HOOKS.ORDER_LAST );

		HOOKS.on('player:change_action_points', function() {
			var status = (this.action_points > 0 ? this.action_points+'ap left' : 'waiting');
			document.getElementById('player-'+this.id).innerHTML = "<b>Player "+this.id+":</b> "+status+" ["+this.team.points+"]";
		}, HOOKS.ORDER_LAST );

		HOOKS.on('team:change_points', function() {
			var players = this.parent_state.players();

			for (var key in players) {
				var player = players[key];
				var status = (player.action_points > 0 ? player.action_points+'ap left' : 'waiting');
				document.getElementById('player-'+player.id).innerHTML = "<b>Player "+player.id+":</b> "+status+" ["+player.team.points+"]";
			}
		}, HOOKS.ORDER_LAST );
	}
);

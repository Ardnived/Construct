
define(
	function() {
		HOOKS.on('player:new', function() {
			document.getElementById('right').innerHTML += "<div id='player-"+this.id+"' style='padding: 2px;'>Player "+this.id+": "+(this.active ? 'active' : 'waiting')+"</div>";
		}, HOOKS.ORDER_LAST );

		HOOKS.on('player:change_active', function() {
			document.getElementById('player-'+this.id).innerHTML = "Player "+this.id+": "+(this.active ? 'active' : 'waiting')+" ["+this.points+"]";
		}, HOOKS.ORDER_LAST );

		HOOKS.on('player:change_points', function() {
			document.getElementById('player-'+this.id).innerHTML = "Player "+this.id+": "+(this.active ? 'active' : 'waiting')+" ["+this.points+"]";
		}, HOOKS.ORDER_LAST );
	}
);

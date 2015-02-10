
define(
	function() {
		hooks.on('player:new', function() {
			document.getElementById('right').innerHTML += "<div id='player-"+this.id+"' style='padding: 2px;'>Player "+this.id+": "+(this.active ? 'active' : 'waiting')+"</div>";
		}, hooks.PRIORITY_LAST );

		hooks.on('player:change_active', function() {
			document.getElementById('player-'+this.id).innerHTML = "Player "+this.id+": "+(this.active ? 'active' : 'waiting');
		}, hooks.PRIORITY_LAST );
	}
);

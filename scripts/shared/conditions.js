
define(
	function() {
		var root = {
			enemy: function(hex, player) {
				var units = hex.units();

				for (var i = units.length - 1; i >= 0; i--) {
					if (units[i].owner.team !== player.team) {
						return true;
					}
				}

				return false;
			},
			vacant: function(hex, player) {
				return hex.unit(player) == null;
			},
			traversable: function(hex, player) {
				return !hex.lockdown;
			},
			spawnzone: function(hex, player) {
				return hex.type != null && hex.type.allow_spawn && (hex.owner == null || hex.owner === player);
			},
		};

		return root;
	}
);

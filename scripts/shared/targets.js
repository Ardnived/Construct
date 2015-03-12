
define(
	function() {
		var root = {
			hex: function(hex, player) {
				return hex != null;
			},
			vacant: function(hex, player) {
				return root.hex(hex, player)
					&& hex.unit(player.id) == null;
			},
			spawnzone: function(hex, player) {
				return root.hex(hex, player)
					&& hex.type != null && hex.type.allow_spawn && (hex.owner == null || hex.owner === player);
			},
		};

		return root;
	}
);

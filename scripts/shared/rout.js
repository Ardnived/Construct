
// TODO: Move victory conditions to server.
define(
	function() {
		var counter = {};

		function modify_count(player, value) {
			if (!(player.id in counter)) {
				counter[player.id] = 0;
			}

			counter[player.id] += value;

			if (counter[player.id] <= 0) {
				player.playing = false;
			}
		}

		HOOKS.on('unit:spawned', function() {
			modify_count(this.owner, +1);
		});

		HOOKS.on('unit:destroyed', function(old_position) {
			modify_count(this.owner, -1);
		});

		HOOKS.on('hex:change_owner', function(old_owner) {
			if (old_owner != null) {
				modify_count(old_owner, -1);
			}

			if (this.owner != null) {
				modify_count(this.owner, +1);
			}
		});
	}
);

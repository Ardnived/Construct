

requirejs(
	['shared/directions'],
	function(DIRECTIONS) {
		HOOKS.on('unit:move', function(allow, position) {
			if (allow && position != null) {
				var hex = this.parent_state.hex(position.q, position.r);
				var units = hex.units();
				
				if (this.type.key === 'bouncer') {
					DEBUG.temp("MOVING A BOUNCER");
					for (var player_index in units) {
						for (var unit_index in units[player_index]) {
							var unit = units[player_index][unit_index];

							if (unit.type.mobile && unit.type.key !== 'bouncer') {
								// TODO: Move the unit out of this hex.
								var direction_of_move = DIRECTIONS.find(position.q - this.position.q, position.r - this.position.r);
								var direction = direction_of_move;

								if (!hex.edge(direction).active) {
									direction = DIRECTIONS[direction_of_move.compliment];

									if (!hex.edge(direction).active) {
										direction = DIRECTIONS[direction_of_move.mirror];
									}
								}

								var new_q = position.q + direction.offset.q;
								var new_r = position.r + direction.offset.r;

								if (hex.edge(direction).active && this.parent_state.in_bounds(new_q, new_r)) {
									unit.position = {
										q: new_q,
										r: new_r,
									};
								}
							}
						}
					}
				} else {
					for (var player_index in units) {
						for (var unit_index in units[player_index]) {
							var unit = units[player_index][unit_index];

							if (unit.type.key === 'bouncer') {
								DEBUG.temp("MOVING AT A BOUNCER");
								allow = false;
							}
						}
					}
				}
			}

			return allow;
		});
	}
);

define({
	reveals: true,
	mobile: true,
	move: 1,
	actions: {
		pushback: "prevent passage and reveal the hex of any program that tries to enter.",
		pushthrough: "force other programs out of hexes it passes through. other bouncers are not affected.",
	},
});


requirejs(
	['shared/message', 'shared/round', 'shared/util'],
	function(MESSAGE, ROUND, UTIL) {
		HOOKS.on('hex:sync', function(new_round) {
			if (new_round % ROUND.DURATION_LONG === 0 && this.type != null && this.type.key === 'access') {
				if (this.owner != null) {
					this.owner.team.points += 1;
				}

				if (CONFIG.platform === 'server') {
					this.owner = null;
					this.type = null;

					var chosen_hex = null;
					while (chosen_hex == null) {
						var q = UTIL.random_int(this.parent_state.min_q(), this.parent_state.max_q());
						var r = UTIL.random_int(this.parent_state.min_r(q), this.parent_state.max_r(q));
						chosen_hex = this.parent_state.hex(q, r);

						if (chosen_hex.type != null) {
							chosen_hex = null;
						}
					}

					chosen_hex.type = 'access';

					var old_hex_data = {};
					var new_hex_data = {};

					HOOKS.trigger('hex:data', this, {
						include: ['type'],
						data: old_hex_data,
					});

					HOOKS.trigger('hex:data', chosen_hex, {
						include: ['type'],
						data: new_hex_data,
					});

					MESSAGE.send('update', [ old_hex_data, new_hex_data ]);
				}
			}
		});
	}
);

define({
	key: 'access',
	ownable: true,
});

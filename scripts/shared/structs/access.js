
requirejs(
	['shared/round', 'shared/util'],
	function(ROUND, UTIL) {
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
					
					this.parent_state.queue_update({
						type: 'hex',
						object: this,
						values: ['type'],
					});

					this.parent_state.queue_update({
						type: 'hex',
						object: chosen_hex,
						values: ['type'],
					});
				}
			}
		});
	}
);

define({
	key: 'access',
	ownable: true,
});


requirejs(
	['shared/message', 'shared/util'],
	function(MESSAGE, UTIL) {
		HOOKS.on('hex:sync', function(new_round) {
			if (new_round % 5 === 0 && this.type != null && this.type.key === 'access') {
				if (this.owner != null) {
					this.owner.points += 1;
				}

				if (!CONFIG.is_client) {
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

					MESSAGE.send('update', [{
						type: 'hex',
						position: [this.q, this.r],
						hex_type: (this.type ? this.type.key : null),
					}, {
						type: 'hex',
						position: [chosen_hex.q, chosen_hex.r],
						hex_type: (chosen_hex.type ? chosen_hex.type.key : null),
					}]);
				}
			}
		});
	}
);

define({
	ownable: true,
});

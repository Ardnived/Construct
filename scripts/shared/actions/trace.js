
HOOKS.on('hex:unit_lost', function(unit) {
	// TODO: Store the last unit for each team, so that information is not lost when a player moves in and out of the hex.
	this._last_unit = unit;
});

define(
	['shared/targets', 'shared/util', 'shared/round', 'shared/state/team'],
	function(TARGETS, UTIL, ROUND, TEAM) {
		return {
			key: 'trace',
			targets: [],
			order: 7,
			cost: 1,
			check_for_unit: false,
			execute: function(state, data) {
				// We require some special logic here because the client has no idea what tile to reveal without input from the server.
				if (CONFIG.platform === 'server') {
					UTIL.require_properties(['player_id', 'unit_id'], data);
					var unit = state.player(data.player_id).unit(data.unit_id);

					var hex = unit.hex;
					DEBUG.temp("Attempting trace on", hex.key);

					if (hex._last_unit != null) {
						var last_unit_hex = hex._last_unit.hex;

						DEBUG.temp("Attempting trace on", hex.key, "with unit", hex._last_unit.key, "which will reveal", hex._last_unit.hex.key);
						var interval = ROUND.interval(state.meta.round, ROUND.DURATION_INSTANT);
						unit.owner.team.visibility(last_unit_hex, interval, TEAM.VISION_PARTIAL);
						
						// We update this value, so that when the data is sent back to the client, this information is included.
						data.positions = [[last_unit_hex.q, last_unit_hex.r]];
					}
				} else {
					UTIL.require_properties(['player_id', 'unit_id', 'positions'], data);
					var hex = state.hex(data.positions[0][0], data.positions[0][1]);
					var interval = ROUND.interval(state.meta.round, ROUND.DURATION_INSTANT);

					GAME_STATE.meta.local_player.team.visibility(hex, interval, TEAM.VISION_PARTIAL);
				}
			},
			affected_hexes: function(data, future) {
				UTIL.require_properties(['position'], data);

				var hexes = [{
					title: (future ? 'tracing' : 'source'),
					source: true,
					hidden: true,
					q: data.position[0],
					r: data.position[1],
				}];

				if ('positions' in data && 'length' in data.positions && data.positions.length > 0) {
					hexes.push({
						title: 'traced',
						hidden: true,
						q: data.positions[0][0],
						r: data.positions[0][1],
					});
				}

				return hexes;
			},
		};
	}
);


define(
	['shared/board'],
	function(board) {

		return {
			mainframe: { // MAINFRAME
				target: board.hex.type.empty_hex,
				init: function(hex) {},
				charge: function(hex, quantity, player) {
					if (hex.owner() === player) {
						hex.charge(quantity);
					} else {
						var remainder = Math.max(quantity - hex.charge(), 0);
						hex.charge(-quantity);

						if (remainder > 0) {
							hex.owner(player);
							hex.charge(remainder);
						} else {
							return 0;
						}
					}
					
					return hex.charge();
				},
				discharge: function(hex, quantity, player) {
					if (hex.charge() < 4) {
						quantity = Math.floor(quantity/2.0);
					}

					return hex.charge(-quantity, 1);
				}
			},
			scrambler: {
				target: board.hex.type.empty_hex,
				// TODO: Implement
			},
			prism: {
				target: board.hex.type.empty_hex,

			},
			diverter: {
				target: board.hex.type.empty_hex,

			},
			converter : {
				target: board.hex.type.empty_hex,

			},
			sensor: {
				target: board.hex.type.empty_hex,

			},
			pylon: {
				target: board.hex.type.empty_hex,

			},
			buffer: {
				target: board.hex.type.empty_hex,

			},
			alternator: {
				target: board.hex.type.empty_hex,

			},
		};
	}
);

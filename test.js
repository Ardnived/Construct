var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname+'/scripts/',
	nodeRequire: require,
});

requirejs(['global/config', 'global/debug', 'global/hooks']);

requirejs(
	['shared/message'],
	function(MESSAGE) {
		DEBUG.temp('--------------------------', 'RUNNING TESTS', '--------------------------');

		function test_encoding(data) {
			var encoded = MESSAGE.encode('chat', data);
			var decoded = MESSAGE.decode(encoded.binary);
			DEBUG.temp('CONVERSION\n', JSON.stringify(data), '\n', JSON.stringify(decoded.data));
		}

		test_encoding([{
			type: 'hex',
			player_id: 0,
			position: [6, 3],
		}, {
			type: 'hex',
			position: [2, 4],
			units: {
				0: [1, 4],
				3: [0],
			},
		}]);

		test_encoding([{
			type: 'hex',
			player_id: 0,
			position: [6, 3],
		}, {
			type: 'hex',
			edges: ['northeast', 'southwest', 'south'],
		}]);
	}
);


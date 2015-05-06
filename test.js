var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname+'/scripts/',
	nodeRequire: require,
});

requirejs(['global/config', 'global/debug', 'global/hooks']);

requirejs(
	['shared/message', 'deasync', 'child_process'],
	function(MESSAGE, DEASYNC, CHILD) {
		DEBUG.temp('--------------------------', 'RUNNING TESTS', '--------------------------');

		function test_encoding(data) {
			var encoded = MESSAGE.encode('chat', data);
			var decoded = MESSAGE.decode(encoded.binary);
			DEBUG.temp('CONVERSION', (JSON.stringify(data) == JSON.stringify(decoded.data) ? "MATCH" : "FAILED"), '\n', JSON.stringify(data), '\n', JSON.stringify(decoded.data));
		}

		console.log("version", process.version);

		var exec = DEASYNC(CHILD.exec);
		try {
			console.log(exec('ls -la'));
		} catch(err) {
			console.log(err);
		}

		// done is printed last, as supposed, with cp.exec wrapped in deasync; first without.
		console.log('done');

		/*test_encoding([{
			type: 'hex',
			position: [2, 4],
			traps: {
				prism: [0, 1],
				monitor: [0],
			},
		}]);

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
		}]);*/
	}
);


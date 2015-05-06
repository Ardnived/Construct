
define(
	[
		'./access',
		'./relay',
		'./uplink',
	],
	function() {
		var root = {};

		for (var i = arguments.length - 1; i >= 0; i--) {
			root[arguments[i].key] = arguments[i];
		};

		return root;
	}
);

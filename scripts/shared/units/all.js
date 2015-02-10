
define(
	['./bouncer', './sniffer'],
	function(bouncer, sniffer) {
		var root = {
			bouncer: bouncer,
			sniffer: sniffer,
		};

		for (var key in root) {
			root[key].key = key;
		};

		return root;
	}
);


define(
	['./access', './relay', './uplink'],
	function(ACCESS, RELAY, UPLINK) {
		var root = {
			access: ACCESS,
			relay: RELAY,
			uplink: UPLINK,
		};

		for (var key in root) {
			root[key].key = key;
		};

		return root;
	}
);

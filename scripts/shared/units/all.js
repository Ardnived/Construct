
define(
	['./sniffer', './peeper', './bouncer', './enforcer', './seeker', './cleaner', './carrier'],
	function(SNIFFER, PEEPER, BOUNCER, ENFORCER, SEEKER, CLEANER, CARRIER) {
		var root = {
			sniffer: SNIFFER,
			peeper: PEEPER,
			bouncer: BOUNCER,
			enforcer: ENFORCER,
			seeker: SEEKER,
			cleaner: CLEANER,
			carrier: CARRIER,
		};

		for (var key in root) {
			root[key].key = key;
		};

		return root;
	}
);

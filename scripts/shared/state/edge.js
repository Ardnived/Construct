
define(
	function() {
		function edge(parent_state, q1, r1, q2, r2) {
			if (typeof q1 === 'undefined'
				|| typeof r1 === 'undefined'
				|| typeof q2 === 'undefined'
				|| typeof r2 === 'undefined') {
				debug.error("An edge must have four coordinates", q1, r1, q2, r2);
			}
			
			this.parent_state = parent_state;
			this.q1 = q1;
			this.r1 = r1;
			this.q2 = q2;
			this.r2 = r2;
			this.cost = 1; // The movement cost of traversing this edge.
			this.active = false;
		};

		return edge;
	}
);

hooks.on('edge:update', function(data) {
	if ('units' in data) {
		hex.units(data.units);
	}

	if ('number' in data) {
		this.cost = data.number;
	}
}, hooks.PRIORITY_CRITICAL);


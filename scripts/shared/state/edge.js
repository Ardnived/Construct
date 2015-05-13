
define(
	[CONFIG.platform+'/database'],
	function(DATABASE) {
		var root = {
			create: function(parent_state, q1, r1, q2, r2) {
				return HOOKS.trigger('edge:new', new edge(parent_state, q1, r1, q2, r2));
			},

			key: function(q1, r1, q2, r2) {
				if (q1 > q2 || (q1 === q2 && r1 > r2)) {
					var temp = q1;
					q1 = q2;
					q2 = temp;

					temp = r1;
					r1 = r2;
					r2 = temp;
				}

				return 'e'+q1+','+r1+'/'+q2+','+r2;
			},
		}

		function edge(parent_state, q1, r1, q2, r2) {
			if (typeof q1 === 'undefined'
				|| typeof r1 === 'undefined'
				|| typeof q2 === 'undefined'
				|| typeof r2 === 'undefined') {
				DEBUG.error("An edge must have four coordinates", q1, r1, q2, r2);
			}
			
			this.parent_state = parent_state;
			this.q1 = q1;
			this.r1 = r1;
			this.q2 = q2;
			this.r2 = r2;
			this._cost = DATABASE.integer(this, 'cost', 1); // The movement cost of traversing this edge.
			this._active = DATABASE.bool(this, 0, false);
		};

		Object.defineProperty(edge.prototype, 'key', {
			get: function() {
				return root.key(this.q1, this.r1, this.q2, this.r2);
			},
			set: undefined,
		});

		Object.defineProperty(edge.prototype, 'cost', {
			get: function() {
				return this._cost.get();
			},
			set: function(new_value) {
				if (new_value != this.cost) {
					this._cost.set(new_value);
					HOOKS.trigger('edge:change_active', this);
				}
			},
		});

		Object.defineProperty(edge.prototype, 'active', {
			get: function() {
				return this._active.get();
			},
			set: function(new_value) {
				if (new_value != this.active) {
					this._active.set(new_value);
					HOOKS.trigger('edge:change_active', this);
				}
			},
		});

		return root;
	}
);

HOOKS.on('edge:data', function(args) {
	var data = args.data;
	data.type = 'edge';
	data.positions = [
		[this.q1, this.r1],
		[this.q2, this.r2],
	];

	if (typeof args.include === 'undefined' || args.include.indexOf('active') != -1) {
		data.active = this.active;
	}

	if (typeof args.include === 'undefined' || args.include.indexOf('cost') != -1) {
		data.number = this.cost;
	}
}, HOOKS.ORDER_EXECUTE);

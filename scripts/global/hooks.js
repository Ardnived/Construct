
HOOKS = {
	_list: {},

	ORDER_VETO:   -1000,
	ORDER_FIRST:  -100,
	ORDER_BEFORE: -50,
	ORDER_EXECUTE: 0,
	ORDER_AFTER:   50,
	ORDER_LAST:    100,

	comparator: function(a, b) {
		return b.priority - a.priority;
	},

	on: function(slug, callback, priority) {
		if (typeof priority === 'undefined') {
			priority = this.ORDER_AFTER;
		}

		if (!(slug in this._list)) {
			this._list[slug] = [];
		}

		for (var i = 0; i < this._list[slug].length; i++) {
			// if our new priority is lesser, then insert it here
			if (priority < this._list[slug][i].priority) {
				break;
			}
		}

		this._list[slug].splice(i, 0, {
			priority: priority,
			callback: callback,
		});
	},

	trigger: function(slug, self, args) {
		DEBUG.flow("Triggering", slug, "| "+args);
		var result = true;

		if (typeof self === 'undefined') {
			self = null;
		}

		if (typeof this._list[slug] !== 'undefined') {
			this._list[slug].every(function(element, index, array) {
				DEBUG.flow("Calling", element.priority+":", element.callback);
				if (element.priority <= HOOKS.ORDER_VETO) {
					result = (element.callback.call(self, args) != false);
					// If false is returned, the loop will terminate.
				} else {
					element.callback.call(self, args);
				}

				return result;
			});
		}

		DEBUG.flow("Finished", slug, "with result", result);
		if (result == false) {
			return false;
		} else {
			return self;
		}
	},
};

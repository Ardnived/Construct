// A wrapper for our graphics library.

define(
	function() {
		function parent(attr) {
			if (typeof attr != 'undefined') {
				this.attr(attr);
			}

			this._entity.origin("center");
		};

		parent.prototype.attach = function(other) {
			this._entity.attach(other._entity);
		}

		parent.prototype.attr = function(attr) {
			this._entity.attr(attr);
		};

		var attrs = ['x', 'y', 'w', 'h', 'z', 'rotation', 'visible', 'alpha'];
		for (var i = attrs.length - 1; i >= 0; i--) {
			(function(key) {
				Object.defineProperty(parent.prototype, key, {
					get: function() {
						return this._entity['_'+key];
					},
					set: function(new_value) {
						this._entity[key] = new_value;
					},
				});
			})(attrs[i]);
		};

		return parent;
	}
);
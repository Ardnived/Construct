// A wrapper for our graphics library.

define(
	['external/crafty', './parent'],
	function(Crafty, parent) {
		function text(text, attr) {
			this._entity = Crafty.e("2D, DOM, Text")
				.text(text)
				.unselectable();

			parent.call(this, attr);
		};

		text.prototype = parent.prototype;

		text.prototype.css = function(rules) {
			this._entity.css(rules);
		}

		Object.defineProperty(text.prototype, 'text', {
			get: undefined,
			set: function(new_value) {
				if (new_value == false) {
					this._entity.visible = false;
				} else {
					this._entity.text(new_value);
					this._entity.visible = true;
				}
			},
		});

		return text;
	}
);
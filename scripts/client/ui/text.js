// A wrapper for our graphics library.

define(
	['external/crafty', './parent'],
	function(CRAFTY, PARENT) {
		function text(text, attr) {
			this._entity = CRAFTY.e("2D, DOM, Text")
				.text(text)
				.unselectable();

			PARENT.call(this, attr);
		};

		text.prototype = PARENT.prototype;

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
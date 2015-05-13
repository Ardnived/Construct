// A wrapper for our graphics library.

define(
	['external/crafty', './graphic'],
	function(CRAFTY, PARENT) {
		function button(spriteset, attr, events_key, owner, hitBox) {
			PARENT.call(this, spriteset, attr);

			if (typeof events_key === 'undefined') {
				events_key = 'button';
			}

			if (!('active' in attr)) {
				this._entity.active = true;
			}

			this._entity.addComponent("Mouse");

			if (typeof hitBox != 'undefined') {
				this._entity.areaMap(new CRAFTY.polygon(hitBox));
			}

			this._entity.bind("MouseOver", function(event) {
				HOOKS.trigger(events_key+':mouse_over', owner, event);
			});
			
			this._entity.bind("MouseOut", function(event) {
				HOOKS.trigger(events_key+':mouse_out', owner, event);
			});
			
			this._entity.bind("MouseDown", function(event) {
				if (this.active) HOOKS.trigger(events_key+':mouse_down', owner, event);
			});
			
			this._entity.bind("MouseUp", function(event) {
				if (this.active) HOOKS.trigger(events_key+':mouse_up', owner, event);
			});
			
			this._entity.bind("Click", function(event) {
				if (this.active) HOOKS.trigger(events_key+':mouse_click', owner, event);
			});
		};

		button.prototype = PARENT.prototype;

		button.prototype._attr = PARENT.prototype.attr;

		// TODO: We are unintentionally modifying the original PARENT.prototype object! Unless requirejs passes by value.
		button.prototype.attr = function(attr) {
			if (typeof attr !== 'undefined' && 'active' in attr) {
				this.active = attr.active;
			}

			return PARENT.prototype._attr.call(this, attr);
		};

		Object.defineProperty(button.prototype, 'active', {
			get: function() {
				return this._entity.active;
			},
			set: function(new_value) {
				if (this._entity.active !== new_value) {
					this._entity.active = new_value

					if (new_value == false) {
						this._entity.alpha = 0.5;
					} else {
						this._entity.alpha = 1.0;
					}
				}
			},
		});

		return button;
	}
);
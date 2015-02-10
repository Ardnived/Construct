// A wrapper for our graphics library.

define(
	['external/crafty', './graphic'],
	function(Crafty, parent) {
		function button(spriteset, attr, events_key, owner, hitBox) {
			parent.call(this, spriteset, attr);

			if (typeof events_key === 'undefined') {
				events_key = 'button';
			}

			if (!('active' in attr)) {
				this._entity.active = true;
			}

			this._entity.addComponent("Mouse");

			if (typeof hitBox != 'undefined') {
				this._entity.areaMap(new Crafty.polygon(hitBox));
			}

			this._entity.bind("MouseOver", function(event) {
				hooks.trigger(events_key+':mouse_over', owner, event);
			});
			
			this._entity.bind("MouseOut", function(event) {
				hooks.trigger(events_key+':mouse_out', owner, event);
			});
			
			this._entity.bind("MouseDown", function(event) {
				if (this.active) hooks.trigger(events_key+':mouse_down', owner, event);
			});
			
			this._entity.bind("MouseUp", function(event) {
				if (this.active) hooks.trigger(events_key+':mouse_up', owner, event);
			});
			
			this._entity.bind("Click", function(event) {
				if (this.active) hooks.trigger(events_key+':mouse_click', owner, event);
			});
		};

		button.prototype = parent.prototype;

		button.prototype._attr = parent.prototype.attr;

		button.prototype.attr = function(attr) {
			if ('active' in attr) {
				this.active = attr.active;
			}

			parent.prototype._attr.call(this, attr);
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
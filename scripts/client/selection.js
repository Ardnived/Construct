
define(
	['shared/message', 'shared/actions/all', 'client/ui/graphic', 'client/ui/button', 'client/ui/text', 'client/canvas'],
	function(MESSAGE, ACTION_LIST, GRAPHIC, BUTTON, TEXT, CANVAS) {
		var self = {
			selected_hex: null,
			graphic: new GRAPHIC(CANVAS.image.cursor, {
				x: 0, y: 0,
				w: CONFIG.hex.scale,
				h: CONFIG.hex.scale,
				visible: false,
			}),
			abilities: [],
		};
		
		function create_ability_button(offset) {
			offset *= 0.5;
			if (offset > 0) offset += 0.5

			var ability = {
				action: '',
			};

			var attr = {
				x: self.graphic.w * offset,
				y: self.graphic.h * 0.25,
				w: self.graphic.w * 0.5,
				h: self.graphic.h * 0.5,
				z: 10,
				visible: false,
			};

			ability.button = new BUTTON(CANVAS.image.test, attr, 'ability', ability);
			self.graphic.attach(ability.button);

			// -----------

			delete attr.h;
			attr.w = self.graphic.w;
			if (offset > 0) {
				attr.x = self.graphic.w * (Math.abs(offset*2) - 0.4);
			} else {
				attr.x = -self.graphic.w * (Math.abs(offset*2) + 0.6);
			}
			
			//attr.y = self.graphic.h * 0.75

			ability.description = new TEXT("", attr);
			ability.description.css({
				'text-align': 'left',
				'text-shadow': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
				'color': 'lightblue',
			});

			if (offset < 0) {
				ability.description.css({
					'text-align': 'right',
				});
			}

			ability.button.attach(ability.description);

			// -----------

			self.abilities.push(ability);
		};

		create_ability_button(1);
		create_ability_button(-1);

		HOOKS.on('ability:mouse_over', function() {
			if (this.button.active) {
				this.description.css({ color: 'lightgreen' });
			}
		});

		HOOKS.on('ability:mouse_out', function() {
			if (this.button.active) {
				this.description.css({ color: 'lightblue' });
			}
		});

		HOOKS.on('ability:mouse_click', function() {
			HOOKS.trigger('action:prepare', ACTION_LIST[this.action], {
				unit_id: self.selected_hex.unit(GAME_STATE.meta.local_player).id,
			});
		});

		HOOKS.on('hex:mouse_down', function(event) {
			var local_unit = this.unit(this.parent_state.meta.local_player);

			if (event.mouseButton === Crafty.mouseButtons.LEFT) {
				if (local_unit != null) {
					self.selected_hex = this;
					self.graphic.attr({
						x: this.graphic.x,
						y: this.graphic.y,
						visible: true,
					});

					var actions = local_unit.type.actions;
					var action_keys = Object.keys(actions);

					for (var i = self.abilities.length - 1; i >= 0; i--) {
						var ability = self.abilities[i];

						if (i < action_keys.length) {
							ability.action = action_keys[i];
							
							ability.description.text = '<u>'+ability.action+'</u><br>'+actions[ability.action];
							ability.button.visible = true;
							ability.button.active = (ability.action in ACTION_LIST);
						} else {
							ability.button.visible = false;
							ability.description.text = false;
						}
					}
				} else if (self.graphic.visible) {
					self.graphic.visible = false;

					for (var i = self.abilities.length - 1; i >= 0; i--) {
						var ability = self.abilities[i];
						ability.button.visible = false;
						ability.description.text = false;
					}
				}
			}
		});

		// TODO: Find a more efficient way to do this.
		HOOKS.on('unit:move', function(args) {
			if (self.selected_hex == args.old_position || (self.selected_hex != null && args.old_position != null && self.selected_hex.q === args.old_position.q && self.selected_hex.r === args.old_position.r)) {
				// TODO: This is duplicate code with other code elsewhere in this file.
				self.graphic.visible = false;

				for (var i = self.abilities.length - 1; i >= 0; i--) {
					var ability = self.abilities[i];
					ability.button.visible = false;
					ability.description.text = false;
				}
			}
		}, HOOKS.ORDER_LAST);
	}
);

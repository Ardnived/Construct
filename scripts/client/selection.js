
define(
	['shared/message', 'shared/actions/all', 'client/ui/graphic', 'client/ui/button', 'client/ui/text', 'client/canvas'],
	function(message, action_list, graphic, button, text, canvas) {
		var self = {
			origin: null,
			graphic: new graphic(canvas.image.cursor, {
				x: 0, y: 0,
				w: config.hex.scale,
				h: config.hex.scale,
				visible: false,
			}),
			abilities: [],
		};
		
		self.graphic.sprite('selected');

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

			ability.button = new button(canvas.image.test, attr, 'ability', ability);
			self.graphic.attach(ability.button);

			// -----------

			delete attr.h;
			//attr.x = self.graphic.w * (Math.abs(offset) + 0.5) * Math.sign(offset);
			attr.y = self.graphic.h * 0.75

			ability.description = new text("", attr);
			ability.description.css({
				'text-align': 'right',
				'text-shadow': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
			});
			ability.button.attach(ability.description);

			// -----------

			self.abilities.push(ability);
		};

		create_ability_button(1);
		create_ability_button(-1);

		hooks.on('ability:mouse_over', function() {
			this.description.css({ color: 'lightgreen' });
		});

		hooks.on('ability:mouse_out', function() {
			this.description.css({ color: 'white' });
		});

		hooks.on('ability:mouse_click', function() {
			debug.flow('do ability', this.action);
		});


		hooks.on('hex:mouse_down', function(event) {
			var local_player = this.parent_state.player(this.parent_state.meta.local_player_id);
			var local_unit = this.unit(local_player.id);

			if (event.mouseButton === Crafty.mouseButtons.LEFT) {
				self.origin = this;
				self.graphic.attr({
					x: this.graphic.x,
					y: this.graphic.y,
					visible: true,
				});

				var actions = [];
				if (local_unit != null) {
					actions = local_unit.type().actions;
				}

				for (var i = self.abilities.length - 1; i >= 0; i--) {
					var ability = self.abilities[i];

					if (i < actions.length) {
						ability.action = actions[i];
						
						ability.description.text = ability.action;
						ability.button.visible = true;
						ability.button.active = (ability.action in action_list);
					} else {
						ability.button.visible = false;
						ability.description.text = false;
					}
				}
			}
		});
	}
);

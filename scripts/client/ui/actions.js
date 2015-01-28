
define(
	['external/jquery', 'shared/message'],
	function($, message) {
		var root = {
			init: function() {
				$('button').each(function() {
					this.onclick = root[this.dataset.action];
				});
			},

			create_unit: function() {
				debug.flow('create_unit', data);
				var data = $(this).data();
				
				hooks.on('hex:mouse_click', function() {
					debug.flow('hex:mouse_click', this);
					hooks.remove('hex:mouse_click', 'create_action');

					message.send('update', {
						type: 'action',
						action: 'build',
						player: GAME_STATE.meta.local_player_id,
						unit: data.unit,
						q: this.q,
						r: this.r,
					});
				}, 'create_action');
			},
		};

		return root;
	}
);


define(
	['external/jquery', 'shared/message'],
	function($, message) {
		debug.flow('init actions');

		$('button').each(function() {
			this.onclick = function() {
				hooks.trigger('action:'+this.dataset.action, this);
			};
		});

		hooks.on('action:create_unit', function() {
			debug.temp('got action:create_unit', this);
			var data = $(this).data();
			
			hooks.on('hex:mouse_click', function() {
				debug.flow('hex:mouse_click', this);
				hooks.remove('hex:mouse_click', 'create_action');

				message.send('update', {
					type: 'action',
					action: 'spawn',
					player: GAME_STATE.meta.local_player_id,
					unit: data.unit,
					q: this.q,
					r: this.r,
				});
			}, hooks.PRIORITY_DEFAULT, 'create_action');
		});
	}
);

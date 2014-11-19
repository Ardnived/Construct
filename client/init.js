
dispatch.init(3001);
dispatch.on('update', game.update);

dispatch.on('rejected', function(data) {
	debug.error("REJECTED", Messages[data.message]);
});

hooks.on('canvas_ready', function() {
	debug.game("on ready");
	ui.init();
	
	for (var q = board.meta.min_q(); q <= board.meta.max_q(); q++) {
		for (var r = board.meta.min_r(q); r <= board.meta.max_r(q); r++) {
			board.hex.add(q, r);
		}
	}

	ui.actions.action(0, library.micro.build);
	ui.actions.action(1, library.micro.reformat);
	ui.actions.action(2, library.macro.wave);
});
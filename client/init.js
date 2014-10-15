
dispatch.init();
dispatch.on('update', game.update);

dispatch.on('rejected', function(data) {
	debug.error("REJECTED", Messages[data.message]);
});

hooks.on('canvas_ready', function() {
	debug.game("on ready");
	ui.init();
	
	for (var qN = 1; qN < 12; qN++) {
		for (var rN = 0; rN < 10; rN++) {
			var q = qN;
			var r = rN - Math.floor(q/2);
			
			board.hex.add(q, r);
		}
	}

	ui.actions.action(0, library.micro.build);
	ui.actions.action(1, library.micro.reformat);
	ui.actions.action(2, library.macro.wave);
});
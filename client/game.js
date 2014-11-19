var game = {
	update: function(data) {
		if (data instanceof Array) {
			for (var i in data) {
				//debug.flow('update_'+data[i].type+":", data[i]);
				game['update_'+data[i].type](data[i]);
			}
			
			ui.topbar.update();
			return;
		}
	},
	
	update_hex: function(data) {
		var hex = board.hex.get(data.q, data.r);

		if ('highlight' in data) {
			hex.highlight = data.highlight;
			hex.refresh();
		}
		
		if ('player' in data) {
			hex.owner(data.player);
		}
		
		if ('struct' in data) {
			hex.struct(data.struct);
		}
		
		if ('charge' in data) {
			hex._charge = data.charge;
		}
		
		if ('image' in data) {
			hex.image(data.image);
		}
	},
	
	update_edge: function(data) {
		if (!board.edge.has(data.q[0], data.r[0], data.q[1], data.r[1])) {
			board.edge.add(data.q[0], data.r[0], data.q[1], data.r[1]);
		}
		
		if ('player' in data) {
			board.edge.get(data.q[0], data.r[0], data.q[1], data.r[1]).owner(data.player);
		}
	},
	
	update_player: function(data) {
		debug.flow('update_'+data.type+":", data);

		if (!board.player.has(data.player)) {
			board.player.set(data.player);
		}
		
		if ('inprogress' in data) {
			board.player.get(data.player).inprogress = data.inprogress;
		}

		if ('turn' in data) {
			board.player.get(data.player).turn = data.turn;
			logic.resolve_round(board);
		}
	},
	
	update_meta: function(data) {
		debug.flow('update_'+data.type+":", data);

		if ('player' in data) {
			board.player.self(data.player);
			
			// TODO: Below should be rewritten.
			ui.players.name(data.player, "You");
			ui.players.name(board.player.is_self(0) ? 1 : 0, "Opponent");
		}
	}
};

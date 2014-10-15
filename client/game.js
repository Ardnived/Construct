var game = {
	update: function(data) {
		debug.game("Received Update:", data);
		
		if (data instanceof Array) {
			for (var i in data) {
				debug.flow('update_'+data[i].type+":", data[i]);
				game['update_'+data[i].type](data[i]);
			}
			
			ui.topbar.update();
			return;
		}
	},
	
	update_hex: function(data) {
		if ('highlight' in data) {
			var hex = board.get(data.q, data.r);
			hex.highlight = data.highlight;
			hex.refresh();
		}
		
		if ('struct' in data) {
			board.hex.get(data.q, data.r).image(canvas.image.hex[data.struct]);
		}
		
		if ('image' in data) {
			board.hex.get(data.q, data.r).image(data.image);
		}
	},
	
	update_edge: function(data) {
		if (!board.edge.has(data.q[0], data.r[0], data.q[1], data.r[1])) {
			board.edge.add(data.q[0], data.r[0], data.q[1], data.r[1]);
		}
		
		if ('player' in data) {
			if (players.self == data.player) {
				board.edge.get(data.q[0], data.r[0], data.q[1], data.r[1]).set_owner(players.left);
			} else {
				board.edge.get(data.q[0], data.r[0], data.q[1], data.r[1]).set_owner(players.right);
			}
		}
	},
	
	update_player: function(data) {
		if ('turn' in data) {
			players[data.player].turn = data.turn;
		}
		
		if ('inprogress' in data) {
			players[data.player].inprogress = data.inprogress;
		}
	},
	
	update_meta: function(data) {
		if ('player' in data) {
			players.self = data.player;
			
			if (players.self == "0") {
				players["0"] = players.left;
				players["1"] = players.right;
			} else if (players.self == "1") {
				players["1"] = players.left;
				players["0"] = players.right;
			}
			
			players.left.set_name("You");
			players.right.set_name("Opponent");
		}
	}
};

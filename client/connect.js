var server = {
	_socket: null,
	_request_count: 0,
	
	init: function() {
		console.log("Connecting to socket.");
		this._socket = io.connect('http://localhost:8888');
		this._socket.on(MessageType.update, this._on_update);
		this._socket.on(MessageType.rejected, this._on_reject);
	},
	
	_on_reject: function(data) {
		console.error("Server rejected request:", new Request(data).message);
	},
	
	_on_update: function(data) {
		console.log("Received Update:", data);
		
		if (data instanceof Array) {
			for (var i in data) {
				server._process_update(new Request(data[i]));
			}
		} else {
			server._process_update(new Request(data));
		}
		
		UI.topbar.update();
	},
	
	_process_update: function(update) {
		switch (update.type) {
			case UpdateType.tile:
				if (update.has('highlight')) {
					var tile = board.get(update.q, update.r);
					tile.highlight = update.highlight;
					tile.refresh();
				}
				
				if (update.has('struct')) {
					board.tile.get(update.q, update.r).set_image(Data.nodes.get(update.struct).image);
				}
				
				if (update.has('image')) {
					board.tile.get(update.q, update.r).set_image(update.image);
				}
				
				break;
			case UpdateType.edge:
				if (!board.edge.has(update.q[0], update.r[0], update.q[1], update.r[1])) {
					board.edge.add(update.q[0], update.r[0], update.q[1], update.r[1]);
				}
				
				if (update.has('player')) {
					if (players.self == update.player) {
						board.edge.get(update.q[0], update.r[0], update.q[1], update.r[1]).set_owner(players.left);
					} else {
						board.edge.get(update.q[0], update.r[0], update.q[1], update.r[1]).set_owner(players.right);
					}
				}
				
				break;
			case UpdateType.player:
				if (update.has('turn')) {
					players[update.player].turn = update.turn;
				}
				
				if (update.has('inprogress')) {
					players[update.player].inprogress = update.inprogress;
				}
				
				break;
			case UpdateType.meta:
				if (update.has('player')) {
					players.self = update.player;
					
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
				break;
			default:
				break;
		}
	},
	
	request: function(request) {
		request.rid = this._request_count;
		
		this._socket.emit(MessageType.request, request.get_data());
		this._request_count++;
		
		console.log("Sent request", request.get_data());
	},
	
	refresh: function() {
		var request = new Request();
		request.rid = this._request_count;
		
		this._socket.emit(MessageType.refresh, request.get_data());
		this._request_count++;
		
		console.log("Requested a game state refresh");
	}
};

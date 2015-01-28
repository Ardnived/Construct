
define(
	function() {
		var STATE = null;
		
		return {
			attach: function(object) {
				object.player = {
					using: function(state) {
						STATE = state;
						return this;
					},

					set: function(id, data) {
						if (!this.has(id)) {
							STATE.players[id] = {
								id: id,
								turn: 1,
								inprogress: 1,
							}
						}

						if (data != null) {
							for (var key in data) {
								STATE.players[id][key] = data[key];
							}
						}
						
						return STATE.players[id];
					},
					
					get: function(id) {
						if (id == null) {
							return null;
						} else if (this.has(id)) {
							return STATE.players[id];
						} else {
							return this.set(id);
						}
					},
					
					remove: function(id) {
						delete STATE.players[id];
					},

					has: function(id) {
						return id in STATE.players;
					},
					
					all: function() {
						return STATE.players;
					},

					is_opponent: function(id) {
						return id != null && !this.is_self(id);
					},

					is_self: function(id) {
						return id == STATE.client;
					},

					self: function(id) {
						if (typeof id !== 'undefined') {
							STATE.client = id;
						}

						return this.get(STATE.client);
					},

					other: function(id) {
						return this.get(id === 1 ? 0 : 1);
					},
				};
			}
		};
	}
);

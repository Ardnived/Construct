Keys = {
	rid: 'rid',
	type: 'type',
	image: 'image',
	q: 'q',
	r: 'r',
	message: 'message',
	struct: 'struct',
	connections: 'connections',
	
	player: 'player',
	inprogress: 'inprogress',
	turn: 'turn'
};

MessageType = {
	request: 'request',
	confirm: 'confirm',
	update: 'update',
	rejected: 'rejected',
	refresh: 'refresh'
};

RequestType = {
	click: 'click',
	action: 'action',
	build: 'build',
	cancel: 'cancel'
};

UpdateType = {
	meta: 'meta',
	tile: 'tile',
	edge: 'edge',
	player: 'player'
};

RejectionCode = {
	
};

function Request(data) {
	if (typeof data === 'undefined') {
		this._data = {};
	} else {
		this._data = data;
	}
}

for (var name in Keys) {
	(function(key) {
		Object.defineProperty(Request.prototype, name, {
			get: function() {
				var result = this._data[Keys[key]];
				if (result !== null && result.toString() === '[object Object]') {
					return new Request(result);
				} else {
					return result;
				}
			},
			set: function(value) {
				this._data[Keys[key]] = value;
			}
		});
	})(name);
}

Request.prototype.has = function(key) {
	return Keys[key] in this._data;
};

Request.prototype.get_data = function() {
	return this._data;
};

// Export data for a nodejs module.
if (typeof exports !== 'undefined') {
	exports.request = Request;
	exports.message_type = MessageType;
	exports.request_type = RequestType;
	exports.update_type = UpdateType;
	exports.rejection_code = RejectionCode;
}
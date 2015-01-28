var players = {
	self: null, // The player index of this client, if it has one. Can be 0 or 1.
	left: null,
	right: null,
	
	_type: function(id) {
		this.element = document.getElementById(id);
		this.turn = 0;
		this.inprogress = true;
	}
};

players.left = new players._type('left');
players.right = new players._type('right');

players["0"] = players.left;
players["1"] = players.right;

players._type.prototype.set_name = function(name) {
	this.element.getElementsByTagName("H1")[0].innerHTML = name;
};
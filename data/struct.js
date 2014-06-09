if (typeof Data === 'undefined') {
	var Data = {};
}

Data.gates = {
	accel: {
		id: 'a',
		
	},
	barrier: {
		id: 'b',
		
	},
	attack_barrier: {
		id: 'c',
		
	},
	barricade: {
		id: 'd',
		
	},
};

Data.nodes = {
	mainframe: {
		id: 'a',
		image: "icon_17287.png"
	},
	scrambler: {
		id: 'b',
		image: "icon_21537.png"
	},
	prism: {
		id: 'c',
		
	},
	diverter: {
		id: 'd',
		
	},
	converter: {
		id: 'e',
		
	},
	sensor: {
		id: 'f',
		
	},
	pylon: {
		id: 'g',
		
	},
	buffer: {
		id: 'h',
		
	},
	alternator: {
		id: 'i',
		
	},
};

Data.nodes.get = function(id) {
	for (var name in Data.nodes) {
		var node = Data.nodes[name];
		
		if (node.id == id) {
			return node;
		}
	}
};

Data.gates.get = function(id) {
	for (var name in Data.gates) {
		var gate = Data.gates[name];
		
		if (gate.id == id) {
			return gate;
		}
	}
};


if (typeof exports !== 'undefined') {
	exports.nodes = Data.nodes;
	exports.gates = Data.gates;
}
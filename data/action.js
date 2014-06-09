if (typeof Data === 'undefined') {
	var Data = {};
}

Data.micro = {
	decode: {
		id: "a",
		
	},
	encode: {
		id: "b",
		
	},
	reformat: {
		id: "c",
		
	},
	empower: {
		id: "d",
		
	},
	reorient: {
		id: "e",
		
	},
	transfer: {
		id: "f",
		
	},
};

Data.macro = {
	wave: {
		id: "a",
		
	},
	power_surge: {
		id: "b",
		
	},
	delay: {
		id: "c",
		
	},
	relay: {
		id: "d",
		
	},
};


if (typeof exports !== 'undefined') {
	exports.micro = Data.micro;
	exports.macro = Data.macro;
}
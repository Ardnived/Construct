var canvas;

oCanvas.domReady(function() {
	console.log("Canvas Loading...");
	
	canvas = oCanvas.create({
		canvas: "#canvas"
	});
	
	UI.init();
	
	for (var qN = 1; qN < 12; qN++) {
		for (var rN = 0; rN < 10; rN++) {
			var q = qN;
			var r = rN - Math.floor(q/2);
			
			Board.add(q, r);
		}
	}
	
	Board.get(2, 3).set_image("icon_21532.png");
});

server.init();
server.refresh();


define(
	function() {
		var self = {
			round: 0,
		};

		return {
			round: function(new_value) {
				if (typeof new_value !== 'undefined' && new_value != self.round) {
					self.round = new_value;
					document.getElementById("roundcounter").innerText = "Round "+self.round;
				}
				
				return self.round;
			},
			
			update: function() {
				/*var element, player;
				
				debug.temp(board);
				player = board.player.self();

				if (player == null) {
					player = board.player.get(0);
				}

				for (var i = 1; i <= board.meta.max_turns; i++) {
					element = document.getElementById("left-t"+i);

					if (i < player.turn) {
						element.className = "progress-bar progress-bar-info";
						element.parentNode.className = "progress flip";
						element.setAttribute("style", "width: 100%");
					} else {
						element.setAttribute("style", "");
					}
				}
				
				if (player.inprogress) {
					element = document.getElementById("left-t"+player.turn);
					element.className = "progress-bar progress-bar-success";
					element.parentNode.className = "progress progress-striped active flip";
					element.setAttribute("style", "width: 100%");
				}
				
				player = board.player.get(player.id === 1 ? 0 : 1);
				for (var i = 1; i <= board.meta.max_turns; i++) {
					element = document.getElementById("right-t"+i);

					if (i < player.turn) {
						element.className = "progress-bar progress-bar-info";
						element.parentNode.className = "progress";
						element.setAttribute("style", "width: 100%");
					} else {
						element.setAttribute("style", "");
					}
				}
				
				if (player.inprogress) {
					element = document.getElementById("right-t"+player.turn);
					element.className = "progress-bar progress-bar-success";
					element.parentNode.className = "progress progress-striped active";
					element.setAttribute("style", "width: 100%");
				}
				*/
			}
		};
	}
);

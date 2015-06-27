
define(
	['external/jquery'],
	function(JQUERY) {
		DEBUG.game("Loading lobby...");

		var root = {
			users: {},
		};

		HOOKS.on('dispatch:lobby', function(args) {
			DEBUG.game("Lobby message received");

			if (!(args.meta.user_id in root.users)) {
				root.users[args.meta.user_id] = args.meta.name;
				JQUERY('#lobby-players').append("<li>"+args.meta.name+"</li>");
			}
		});
	}
);

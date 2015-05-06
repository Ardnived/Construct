
var host = "pg://brian:1234@localhost/postgres"; // TODO: Define this.

define(
	['redis', 'deasync'],
	function(REDIS, DEASYNC) {
		var client = REDIS.createClient();

		return {
			get: function(key) {
				return DEASYNC(REDIS.GET)(key);
			},
			
			set: function(key, value) {
				REDIS.SET(key, value);
			},
		};
	}
);
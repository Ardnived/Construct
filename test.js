'use strict';
var requirejs = require('requirejs');

requirejs.config({
	baseUrl: __dirname+'/scripts/',
	nodeRequire: require,
});

requirejs('global/config');

var platform_index = process.argv.indexOf('-p');
if (process.argv[platform_index+1] == 'client') {
	CONFIG.platform = 'client';
}

requirejs('global/debug');
requirejs('global/hooks');

console.log("Node Version:", process.version);
console.log("Platform:", CONFIG.platform);

var ASSERT = requirejs('assert')
var MESSAGE = requirejs('shared/message')
var DATABASE = requirejs(CONFIG.platform+'/database')

var object = { key: 'test' };

describe("Dispatch", function() {
	describe("Encoding", function() {
		function test_encoding(data) {
			var encoded = MESSAGE.encode('chat', data);
			var decoded = MESSAGE.decode(encoded.binary);
			ASSERT.deepEqual( data, decoded.data );
		}

		it("should encode data properly", function() {
			test_encoding([]);
			test_encoding({});
			test_encoding([{}]);

			test_encoding([{
				type: 'hex',
				position: [2, 4],
				traps: {
					prism: [0, 1],
					monitor: [0],
				},
			}]);

			test_encoding([{
				type: 'hex',
				player_id: 0,
				position: [6, 3],
			}, {
				type: 'hex',
				position: [2, 4],
				units: {
					0: [1, 4],
					3: [0],
				},
			}]);

			test_encoding([{
				type: 'hex',
				player_id: 0,
				position: [6, 3],
			}, {
				type: 'hex',
				edges: ['northeast', 'southwest', 'south'],
			}]);
		})
	})

	describe("Inter-Server Communication", function() {
		if ( CONFIG.platform !== 'server' ) {
			return;
		}
		
		it("should relay data to other servers", function(done) {
			var data = [{
				type: 'hex',
				player_id: 0,
				position: [6, 3],
			}];

			var meta = {
				message: "Testing the message",
			};

			var once = true;

			HOOKS.on('dispatch:chat', function(args) {
				if (once) {
					ASSERT.deepEqual(args.meta, meta);
					ASSERT.deepEqual(args.data, data);
					once = false;
					done();
				}
			});

			DATABASE.subscribe("test");
			MESSAGE.relay("test", 'chat', data, meta);
		})
	})
})

describe("Database", function() {
	var field;

	/*if (CONFIG.platform) {
		it("should connect to REDIS", function() {

		})
	}*/

	describe("Multiple Databases", function() {
		before(function() {
			field = DATABASE.string(object, 'string', 'red');
		})
		
		it("should not affect each other", function() {
			DATABASE.select(0);
			ASSERT.equal( field.get(), 'red' );
			field.set('green');
			ASSERT.equal( field.get(), 'green' );

			DATABASE.select(1);
			ASSERT.equal( field.get(), 'red' );
		})

		it("should flush their data", function() {
			DATABASE.select(0);
			field.set('green');
			ASSERT.equal( field.get(), 'green' );
			DATABASE.flush();
			ASSERT.equal( field.get(), 'red' );
		})
	})

	describe("String", function() {
		before(function() {
			DATABASE.flush();
			field = DATABASE.string(object, 'string', 'red');
		})
		
		it("should use the correct default value", function() {
			ASSERT.equal( field.get(), 'red' );
		})

		it("should write and read properly", function() {
			field.set('green');
			ASSERT.equal( field.get(), 'green' );
			field.set('blue');
			ASSERT.equal( field.get(), 'blue' );
		})

		it("should revert to default", function() {
			field.set('green');
			field.set(null);
			ASSERT.equal( field.get(), 'red' );
		})
	})

	describe("Boolean", function() {
		before(function() {
			DATABASE.flush();
			field = DATABASE.bool(object, 0, true);
		})

		it("should use the correct default value", function() {
			ASSERT.equal( field.get(), true );
		})

		it("should write and read properly", function() {
			field.set(true);
			ASSERT.equal( field.get(), true );
			field.set(false);
			ASSERT.equal( field.get(), false );
		})

		it("should revert to default", function() {
			field.set(false);
			field.set(null);
			ASSERT.equal( field.get(), true );
		})
	})

	describe("Integer", function() {
		before(function() {
			DATABASE.flush();
			field = DATABASE.integer(object, 'integer', 1);
		})
		
		it("should use the correct default value", function() {
			ASSERT.equal( field.get(), 1 );
		})

		it("should write and read properly", function() {
			field.set(10);
			ASSERT.equal( field.get(), 10 );
			field.set(0);
			ASSERT.equal( field.get(), 0 );
			field.set(-4);
			ASSERT.equal( field.get(), -4 );
		})

		it("should revert to default", function() {
			field.set(10);
			field.set(null);
			ASSERT.equal( field.get(), 1 );
		})
	})

	describe("Hash", function() {
		before(function() {
			DATABASE.flush();
			field = DATABASE.hash(object, 'hash');
		})
		
		it("should use the correct default value", function() {
			ASSERT.deepEqual( field.get(), {} );
		})

		it("should write and read properly", function() {
			field.set({ test: 'blue' });
			ASSERT.deepEqual( field.get(), { test: 'blue' } );
			field.set('foo', 'bar');
			ASSERT.deepEqual( field.get(), { test: 'blue', foo: 'bar' } );
			field.set({ bar: 'baz', test: 'red' });
			ASSERT.deepEqual( field.get(), { bar: 'baz', test: 'red', foo: 'bar' } );
			ASSERT.deepEqual( field.get('test'), 'red' );
		})
		
		it("should revert to default", function() {
			field.set({ test: 'blue' });
			field.set(null);
			ASSERT.deepEqual( field.get(), {} );
		})
	})

	describe("Hash List", function() {
		before(function() {
			DATABASE.flush();
			field = DATABASE.hash(object, 'hashlist');
		})

		it("should use the correct default value", function() {
			ASSERT.deepEqual( field.get_list('test'), [] );
			ASSERT.deepEqual( field.get_list('test'), {} );
		})

		it("should write and read properly", function() {
			field.set_list('test', [1, 2, 't']);
			ASSERT.deepEqual( field.get_list('test'), [1, 2, 't'] );

			field.set_list('test2', [3, 4, 10]);
			ASSERT.deepEqual( field.get_list('test2'), [3, 4, 10] );

			field.set_list('test', [2, 1, 1]);
			ASSERT.deepEqual( field.get_list('test'), [2, 1, 1] );

			ASSERT.deepEqual( field.get_list(), {
				test: [2, 1, 1],
				test2: [3, 4, 10],
			} );
		})
		
		it("should revert to default", function() {
			field.set_list('test', [1, 2, 't']);
			//field.set_list('test', null);
			//ASSERT.deepEqual( field.get_list('test'), [] );
			field.set_list(null);
			ASSERT.deepEqual( field.get_list(), {} );
		})
	})

	describe("Set", function() {
		before(function() {
			DATABASE.flush();
			field = DATABASE.set(object, 'set');
		})

		it("should use the correct default value", function() {
			ASSERT.deepEqual( field.get(), [] );
		})

		it("should add values", function() {
			field.add('test1');
			ASSERT.deepEqual( field.get(), ['test1'] );

			field.add('test2');
			var list = field.get();
			ASSERT.equal( list.length, 2 );
			ASSERT.equal( list.indexOf('test1') !== -1, true );
			ASSERT.equal( list.indexOf('test2') !== -1, true );

			field.add('test1');
			ASSERT.equal( list.length, 2 );
			ASSERT.equal( list.indexOf('test1') !== -1, true );
			ASSERT.equal( list.indexOf('test2') !== -1, true );
		})
		
		it("should remove values", function() {
			field.remove('test1');
			ASSERT.deepEqual( field.get(), ['test2'] );

			field.remove('test2');
			ASSERT.deepEqual( field.get(), [] );
		})
	})

	describe("Bit List", function() {
		before(function() {
			DATABASE.flush();
			field = DATABASE.bitlist(object, 'bitlist');
		})

		it("should use the correct default value", function() {
			ASSERT.equal( field.get(0), false );
			ASSERT.equal( field.get(12), false );
			ASSERT.equal( field.get(50), false );

			var def_true = DATABASE.bitlist(object, 'bitlist', true);
			ASSERT.equal( def_true.get(0), true );
			ASSERT.equal( def_true.get(12), true );
			ASSERT.equal( def_true.get(50), true );
		})

		it("should add values", function() {
			field.set(0, true);
			ASSERT.equal( field.get(0), true );
			ASSERT.equal( field.get(1), false );

			field.set(5, true);
			ASSERT.equal( field.get(5), true );
			ASSERT.equal( field.get(4), false );
			ASSERT.equal( field.get(6), false );

			field.set(12, true);
			ASSERT.equal( field.get(12), true );
			ASSERT.equal( field.get(11), false );
			ASSERT.equal( field.get(13), false );
		})
		
		it("should remove values", function() {
			field.set(0, false);
			ASSERT.equal( field.get(0), false );
			ASSERT.equal( field.get(1), false );

			ASSERT.equal( field.get(5), true );
			ASSERT.equal( field.get(4), false );
			ASSERT.equal( field.get(6), false );

			field.set(12, false);
			ASSERT.equal( field.get(12), false );
			ASSERT.equal( field.get(11), false );
			ASSERT.equal( field.get(13), false );
		})
	})

	describe("List", function() {
		before(function() {
			DATABASE.flush();
			field = DATABASE.list(object, 'list');
		})

		it("should use the correct default value", function() {
			ASSERT.deepEqual( field.get(), [] );
		})

		it("should add values", function() {
			field.push('test1');
			ASSERT.deepEqual( field.get(), ['test1'] );

			field.push('test2');
			ASSERT.deepEqual( field.get(), ['test1', 'test2'] );

			field.push('test1');
			ASSERT.deepEqual( field.get(), ['test1', 'test2', 'test1'] );
		})

		it("should set values", function() {
			field.set(0, 'test3');
			ASSERT.equal( field.get(0), 'test3' );
			ASSERT.deepEqual( field.get(), ['test3', 'test2', 'test1'] );

			field.set(2, 'test3');
			ASSERT.equal( field.get(2), 'test3' );
			ASSERT.deepEqual( field.get(), ['test3', 'test2', 'test3'] );

			field.set(0, 'test1');
			ASSERT.equal( field.get(0), 'test1' );
			ASSERT.deepEqual( field.get(), ['test1', 'test2', 'test3'] );

			field.set(2, null);
			ASSERT.deepEqual( field.get(), ['test1', 'test2', 'null'] );
			field.set(2, 'test3');
		})

		it("should get values", function() {
			ASSERT.equal( field.get(0), 'test1' );
			ASSERT.equal( field.get(1), 'test2' );
			ASSERT.equal( field.get(2), 'test3' );
		})
		
		it("should remove values", function() {
			ASSERT.equal( field.pop(), 'test1' );
			ASSERT.deepEqual( field.get(), ['test2', 'test3'] );

			ASSERT.equal( field.pop(), 'test2' );
			ASSERT.deepEqual( field.get(), ['test3'] );

			ASSERT.equal( field.pop(), 'test3' );
			ASSERT.deepEqual( field.get(), [] );

			ASSERT.equal( field.pop(), null );
			ASSERT.deepEqual( field.get(), [] );
		})
	})
})

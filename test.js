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

describe("Database", function() {
	var field;

	/*if (CONFIG.platform) {
		it("should connect to REDIS", function() {

		})
	}*/

	describe("String", function() {
		before(function() {
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

	DATABASE.flush();

	describe("Boolean", function() {
		before(function() {
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

	DATABASE.flush();

	describe("Integer", function() {
		before(function() {
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

	DATABASE.flush();

	describe("Hash", function() {
		before(function() {
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

	DATABASE.flush();

	describe("Hash List", function() {
		before(function() {
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

	/*
	function test_encoding(data) {
		var encoded = MESSAGE.encode('chat', data);
		var decoded = MESSAGE.decode(encoded.binary);
		DEBUG.temp('CONVERSION', (JSON.stringify(data) == JSON.stringify(decoded.data) ? "MATCH" : "FAILED"), '\n', JSON.stringify(data), '\n', JSON.stringify(decoded.data));
	}

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
	}]);*/
})

//process.exit(0);


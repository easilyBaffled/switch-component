import match, { extractMatchingKeys, getMatchedValues } from './';

import flow from 'lodash/flow';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import _ from 'lodash/fp';
import { check, gen, property } from 'testcheck';

console.ident = ( v, label = '' ) => ( console.log( label, v ), v );

const DEFAULT_VALUE = 'default';

const validMatchClauses  = gen.object( gen.primitive.notEmpty(), gen.any );
const matchClausesWithDefault  = validMatchClauses.then( obj => ( { ...obj, _: DEFAULT_VALUE } ) );

const shuffleKeys = flow(
	Object.keys,
	_.shuffle
);

const pickRandomKey = flow(
	shuffleKeys,
	arr => arr[ 0 ]
);

const pickRandomMatchingKey = flow(
	shuffleKeys,
	_.find( v => v )
);

const pickRandomNonMatchingKey = flow(
	shuffleKeys,
	_.find( v => !v ) || '__noMatch__'
);

expect.extend({
	passed( received ) {
		return {
			pass: received.result,
			message: () => `testcheck failed with 
            ${JSON.stringify(received, null, 4)}`
		}
	}
} );

check.expect = ( ...args ) => {
	let last = args.pop();

	let checkOpt = {
		numTests: process.env.TRAVIS
			? 100
			: 15
	};

	if( typeof last === "function" )
	{
		args.push( last );
	}
	else
	{
		checkOpt.numTest = last.numTest
	}

	expect(
		check(
			property(
				...args
			),
			checkOpt
		)
	).passed()
}

const truthyPrimatives = [1, true, 'sting'];
const falsyPrimatives = [0, false, '', undefined, null]; // `typeof null` is technically "object" but `isObject` does not treat it that way
const primatives = [...truthyPrimatives, ...falsyPrimatives];

const truthyObjects = [{ a: 1 }, [1], () => 'string'];
const falsyObjects = [{}, []];
const objects = [...truthyObjects, ...falsyObjects];

const matchClauses = {
	a: 'a',
	b: 'b',
	_: DEFAULT_VALUE
};

describe( 'extractMatchingKeys', () => {
	const extract = ( ...args ) => expect( extractMatchingKeys( ...args ) );

	describe('Non-Object matching', () => {
		it('null is treated as a non-object', () => {
			extract(null).toBe(null);
		});

		it( 'will return the testExpression if the testExpression is not an Object', () =>
			check.expect(
				gen.primitive,
				v => isEqual( extractMatchingKeys( v ), v )
			)
		);
	} );

	describe( 'Matching an Object testExpression', () => {
		describe( 'returns an array returns an array of keys', () => {
			it( 'returns an array', () =>
				check.expect(
					gen.object( gen.primitive.notEmpty() ),
					matchClauses =>
						extractMatchingKeys( matchClauses, matchClauses ) instanceof Array &&
						extractMatchingKeys( matchClauses ) instanceof Array
				)
			);

			it( 'where the key\'s values are truthy', () => {
				extract( { a: true, b: false }, matchClauses ).toEqual( [ 'a' ] );
				extract( { a: true, b: true }, matchClauses ).toEqual( [ 'a', 'b' ] );
				extract( // Matching keys are in the matchClauses, but the key's values are falsey
					{ a: 1, b: 'string', c: null, d: () => '', e: '' },
					{ a: true, b: true, c: true, d: true, e: true }
				).toEqual( [ 'a', 'b', 'd' ] );

				check.expect(
					gen.object( gen.primitive.notEmpty() ),
					matchClauses => {
						const results = extractMatchingKeys( matchClauses, matchClauses );
						return results.every( key => matchClauses[ key ] );
					}
				)
			} );

			it( 'the key\'s are in the matchClauses', () => {
				extract( // Matching keys are not the matchClauses, but the key's values are truthy
					{ a: true, b: true, c: true, d: true, e: true },
					{ a: true }
				).toEqual( [ 'a' ] );

				check.expect(
					gen.object( gen.primitive.notEmpty() ),
					matchClauses => {
						const results = extractMatchingKeys( matchClauses, matchClauses );
						return results.every( key => key in matchClauses && matchClauses[ key ] );
					}
				)
			} )
		} );

		it( 'does not match the defaultKey', () => {
			extract( { 'a': false, b: false } ).toEqual( [] );

			check.expect(
				gen.object( gen.primitive.notEmpty(), gen.oneOf( [ gen.null, gen.undefined, gen.NaN, false, 0 ] ) ),
				matchClauses =>
					extractMatchingKeys( matchClauses, matchClauses ).length === 0
			)

		} );

		it( 'does handle Arrays', () => {
			extract( [ true, false ], { 0: '', 1: '' } ).toEqual( [ "0" ] )
		} );
	} )
} );

const sampleMatchingKeys = clauses =>
	Object.entries( clauses )
		.reduce( ( keys, [ key, value ] ) =>
				( !!value && Math.floor( Math.random() * 10 ) % 2 === 0 )
					? keys.concat( key )
					: keys,
			[] );

describe( 'matchKeysToTests', () => {
	const defaultKey = '_';
	const getMatch = ( ...args ) => expect( getMatchedValues( ...args ) );
	const getAllMatches = ( matchingKeys, testExpression ) => expect( getMatchedValues( matchingKeys, testExpression, defaultKey, true ) );
	const genMatches = gen.object( gen.primitive.notEmpty(), gen.any )
		.then( clauses => [ sampleMatchingKeys( clauses ), clauses ] );

	describe( 'Match All', () => {
		it( 'will check the defaultKey automatically', () => {
			getAllMatches( [ 'a' ], matchClauses, '_', true ).toEqual( [ 'a', DEFAULT_VALUE ] );

			check.expect(
				genMatches,
				( [ keys, clauses ] ) => getMatchedValues( keys, { ...clauses, [defaultKey]: DEFAULT_VALUE }, defaultKey, true ).includes( DEFAULT_VALUE )
			);
		} );

		it( 'will return an array as long as matchClauses is defined', () => {
			getAllMatches( [], matchClauses ).toBeInstanceOf( Array );
			getAllMatches( Object.keys( matchClauses ), matchClauses ).toBeInstanceOf( Array );
			getAllMatches( [], {} ).toBe( undefined );
			getAllMatches( [], [] ).toBe( undefined );

			check.expect(
				genMatches,
				( [ keys, clauses ] ) => {
					const results = getMatchedValues( keys, clauses, defaultKey, true );
					return ( ( isEmpty( keys ) && !clauses[ defaultKey ] ) || isEmpty( clauses ) )
						? results === undefined
						: results instanceof Array
				}
			);
		} )
	} );

	describe( 'Match First', () => {
		it( 'will return undefined if the matchingKey or defaultKey are not in the testExpression', () => {
			getMatch( 'a', {} ).toBe( undefined );
			getMatch( 'a', { b: 'b' } ).toBe( undefined );

			check.expect(
				gen.object( gen.primitive.notEmpty(), gen.any ).then( obj => [
					gen.primitive.suchThat( v => !( v in obj ) ) , obj
				] ),
				( [ keys, clauses ] ) => isEqual( getMatchedValues( keys, clauses ), undefined )
			);
		} );

		it( 'will return the matched value if the matchingKey is in the testExpression', () => {
			primatives.forEach( v => getMatch( 'v', { v } ).toBe( v ) );
			objects.forEach( v => getMatch( 'v', { v } ).toEqual( v ) );

			check.expect(
				gen.any,
				v => isEqual( getMatchedValues( 'v', { v }, defaultKey ), v )
			)
		} );

		it( 'will return the default value if the matchingKey is not the testExpression but the defaultKey is', () => {
			primatives.forEach( v => getMatch( 'a', { [defaultKey]: v }, defaultKey ).toBe( v ) );
			objects.forEach( v => getMatch( 'a', { [defaultKey]: v }, defaultKey ).toEqual( v ) );

			check.expect(
				gen.any,
				v => isEqual( getMatchedValues( 'v', { [defaultKey]: v }, defaultKey ), v )
			);
		} );
	} );
} );

describe( 'match', () => {
	const m = ( ...args ) => ( ...args2 ) => expect( match( ...args )( ...args2 ) );

	it( 'will throw an error if matchClauses is an array', () => {
		expect( () => match( [] ) ).toThrow();
		check.expect(
			gen.array(gen.int),
			v => {
				try {
					match( v );
					return false;
				} catch ( e ) {
					return true;
				}
			}
		)
	} );

	it( 'will only accept an object as matchClauses', () => {
		primatives.forEach(
			v => expect( () => match( v ) ).toThrow()
		)
		check.expect(
			gen.primitive,
			v => {
				try {
					match( v );
					return false;
				} catch ( e ) {
					return true;
				}
			}
		)
	} );

	it( 'will work', () => {
		m( matchClauses )().toEqual( DEFAULT_VALUE );
		expect( match( matchClauses, 'a' ) ).toEqual( 'a' );
		m( matchClauses )( { a: true } ).toEqual( 'a' );
		m( matchClauses )( { a: false } ).toEqual( DEFAULT_VALUE );
		m( { loading: 'loading', data: 'data', error: 'error' } )
		( { loading: false, data: true, error: false} ).toEqual( 'data' )
	} );

	it( 'valid matchClauses, valid true primitive key, single match - should find a non-default match', () => {
		check.expect(
			validMatchClauses,
			obj => {
				const matchingKey = pickRandomMatchingKey( obj );
				return isEqual( match( obj )( matchingKey ), obj[ matchingKey ] );
			}
		)
	} );

	it( 'valid matchClauses, non-matching key, single match - should return undefined', () => {
		check.expect(
			validMatchClauses,
			obj => {
				const matchingKey = pickRandomNonMatchingKey( obj );
				return isEqual( match( obj )( matchingKey ), undefined );
			}
		)
	} );

	it( 'valid matchClauses, non-matching key, match all - should return an empty array', () => {
		check.expect(
			validMatchClauses,
			obj => {
				const matchingKey = pickRandomNonMatchingKey( obj );
				return isEqual( match( obj )( matchingKey, { matchAll: true } ), undefined );
			}
		)
	} );

	it( 'valid matchClauses with default, non-matching key, single match - should return default value', () => {
		check.expect(
			matchClausesWithDefault,
			obj => {
				const matchingKey = pickRandomNonMatchingKey( obj );
				return isEqual( match( obj )( matchingKey ), DEFAULT_VALUE );
			}
		)
	} );

	it( 'valid matchClauses with default, non-matching key, match all - should return an array with the default value', () => {
		check.expect(
			matchClausesWithDefault,
			obj => {
				const matchingKey = pickRandomNonMatchingKey( obj );
				return isEqual( match( obj )( matchingKey, { matchAll: true } ), [ DEFAULT_VALUE ] );
			}
		)
	} );

	it( 'valid matchClauses with default, any key, single match - should not return undefined', () => {
		check.expect(
			matchClausesWithDefault,
			obj => {
				const matchingKey = pickRandomKey( obj );
				return !isEqual( match( obj )( matchingKey ), undefined );
			}
		)
	} );
} );

test( 'getVectorLength', () => {
	const getVectorLength = match( {
		z: ( { x, y, z } ) => Math.sqrt(x ** 2 + y ** 2 + z ** 2),
		y: ( { x, y } ) => Math.sqrt(x ** 2 + y ** 2 ),
		_: vector => vector.length
	} );

	expect( getVectorLength({x: 1, y: 2, z: 3}) ).toBe( 3.7416573867739413 );
} );

const usersTypes = [
	{ type: 'prod', privilege: true },
	{ type: 'dev', privilege: true },
	{ type: 'admin', privilege: true },
	{ type: 'admin', privilege: false },
	{ type: 'customer', privilege: true },
	{ type: 'customer', privilege: false },
];

test('Trafic Light Example', () => {
	const intersectionSituation = 'stop';

	const lightOptions = {
		stop: 'red',
		yeild: 'yellow',
		go: 'green',
		_: 'yellow flashing'
	};

	const traficLightDisplay = match( lightOptions, intersectionSituation );
	expect( traficLightDisplay ).toBe( 'red' );
	expect( match( lightOptions, 'yeild' ) ).toBe( 'yellow' );
	expect( match( lightOptions, 'go' ) ).toBe( 'green' );
	expect( match( lightOptions )() ).toBe( 'yellow flashing' );
})

/*
test( 'Reducer Example', () => { // Taken from https://redux.js.org/basics/reducers#splitting-reducers
	const todoReducer = ( state, { type, ...payload } ) => match( {
		'set-visibility-filter': () => ( { ...state, visibilityFilter: payload.filter} ),
		'add-todo': () => ( {...state, todos: [...state.todos, { text: payload.text}]} ),
		'toggle-todo': () => ( {
			...state,
			todos: state.todos.map((todo, idx) => idx === payload.index
				? {...todo, done: !todo.done}
				: todo
			)
		} ),
		_: {}
	} )( type );

	const propBasedTodoReducer = ( state, action ) => match( {
		filter: ( { filter } ) => ( { ...state, visibilityFilter: filter} ),
		text: ( { text } ) => ( {...state, todos: [...state.todos, {text}]} ),
		index: ( { index } ) => ( {
			...state,
			todos: state.todos.map((todo, idx) =>
				idx === index
					? {...todo, done: !todo.done}
					: todo
			)
		} ),
		_: {}
	} )( action )
} );
*/

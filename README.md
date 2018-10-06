[![Build Status](https://travis-ci.org/easilyBaffled/match.svg?branch=master)](https://travis-ci.org/easilyBaffled/match)
[![Coverage Status](https://coveralls.io/repos/github/easilyBaffled/match/badge.svg?branch=master)](https://coveralls.io/github/easilyBaffled/match?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7ed423c34981427a9e6d5cb6d9dfbb97)](https://www.codacy.com/app/easilyBaffled/match?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=easilyBaffled/match&amp;utm_campaign=Badge_Grade)
[![Greenkeeper badge](https://badges.greenkeeper.io/easilyBaffled/match.svg)](https://greenkeeper.io/)

<p align="center">
    <img alt="match-by" src="media/match-by.svg" width="144">
</p>
<h3 align="center">
  Match
</h3>
<p align="center">
  Simple Matching for Mixed-Up Situations
</p>
This module was made with affection for but in no way trying to be a pattern matcher. We've already got that [on the way](https://github.com/tc39/proposal-pattern-matching). Instead it is made to replace ugly ternary.
It matches a test value to a simple key value. Simple in that the key must be a valid key in a object, so a primitive.

### Match against primatives
```javascript
const word = 'number'

match( {
	number: () => <p>1</p>,
    boolean: () => <p>true</p>,
    string: () => <p>"Hi"</p>,
}, word )
```
> <p>1</p>



### Include default values against primatives
```javascript
const word = 'undefined!';

match( {
	number: () => <p>1</p>,
    boolean: () => <p>true</p>,
    string: () => <p>"Hi"</p>,
    _: () => <p>None of the above</p>
}, word )
```
> <p>None of the above</p>


### Match against boolean values in an object
```javascript
 <Fetch lazy url="https://api.github.com/users/easilyBaffled">
    { ( fetchStates ) =>
        match( {
            data: ( { data } ) => <pre>{JSON.stringify(data, null, 2)}</pre>
            loading: () => <h1>...Loading</h1>,
            error: ({ error }) => <h1>{error.message}</h1>
        }, fetchStates )
    }
 </Fetch>
```

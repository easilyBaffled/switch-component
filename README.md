[![Build Status](https://travis-ci.org/easilyBaffled/match.svg?branch=master)](https://travis-ci.org/easilyBaffled/match)
[![Coverage Status](https://coveralls.io/repos/github/easilyBaffled/match/badge.svg?branch=master)](https://coveralls.io/github/easilyBaffled/match?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7ed423c34981427a9e6d5cb6d9dfbb97)](https://www.codacy.com/app/easilyBaffled/match?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=easilyBaffled/match&amp;utm_campaign=Badge_Grade)

<p align="center">
    <img alt="match-by" src="match-by.svg" width="144">
</p>
<h3 align="center">
  Match
</h3>
<p align="center">
  Simple Matching for Mixed-Up Situations
</p>
This module was made with affection for but in no way trying to be [Pattern Matching](https://github.com/tc39/proposal-pattern-matching). Instead it is made to replace ugly ternary. 

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
# Roadmap
This project not only serves as a home for the Match component, but also as template and learning ground for how I develop modules. 
As such development moving forward will less focused on developing features and more on trying out and implementing dev support tools.
- [ ] Storybook - All the demos in one organized place
- [ ] CodeSandbox - forkable demos
- Build
	- [ ] Prepack - condense the nice readable code into something more performance
	- [ ] -ify - all of the usual transformations 
- [ ] Git hooks - no bad commits
- Typescript - just so I can try [GitHub - paldepind/ts-quickcheck: TypeScript QuickCheck](https://github.com/paldepind/ts-quickcheck)
	- [ ] Add definitions 
	- [ ] Add QuickCheck 

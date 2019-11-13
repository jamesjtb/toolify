# Toolify

> Various quality of life functions to reduce number of lines in common operations.

## Table of Contents

* [Functions](#functions)
  * [objectify](#objectify)
  * [arrayify](#arrayify)
  * [isObjectEmpty](#isobjectempty)
  * [nullify](#nullify)
  * [denilify](#denilify)
  * [areObjectsEqual](#areobjectsequal)

## Functions

### objectify

From an array of objects, return an object where the key is the specified property value.

Important note: This key must exist and have a unique value in every object within the input array.

#### objectify example

```javascript
const { objectify } = require('toolify');
let input = [
  {
    id: 1,
    value1: 'something',
    value2: 'something else'
  },
  {
    id: '2',
    value1: 'a value',
    value2: 'another value'
  },
  {
    id: 'textIdentifier',
    andNow: 'for something',
    completely: 'different'
  }
]

let kvs = objectify(input, 'id');

// Result:
// >> {
// >>   '1': {
// >>     id: 1,
// >>     value1: 'something',
// >>     value2: 'something else'
// >>   },
// >>   '2': {
// >>     id: '2',
// >>     value1: 'a value',
// >>     value2: 'another value'
// >>   },
// >>   'textIdentifier': {
// >>     id: 'textIdentifier',
// >>     andNow: 'for something',
// >>     completely: 'different'
// >>   }
// >> }

```

### arrayify

If input is not an array, return an array with one element as the input. Otherwise, return the input.

#### arrayify example

```javascript
const { arrayify } = require('toolify');

let input = 'value';

input = arrayify(input);

console.log(input);
// logs ['value'] to console

input = ['value'];

console.log(input);
// logs ['value'] to console
```

#### arrayify example with Iteration

```javascript
const { arrayify } = require('toolify');

let input = 'value';

for (let value of arrayify(input)) {
  console.log(value);
}
// Logs 'value' to console, instead of logging each character separately as it would without arrayify

```

### isObjectEmpty

Check if input is an empty object.

#### isObjectEmpty example

```javascript
const { isObjectEmpty } = require('toolify');

let input = {};

let inputNotEmpty = { key: 'value' };

isObjectEmpty(input);
// >> true

isObjectEmpty(inputNotEmpty);
// >> false
```

### nullify

Simply return null if input is undefined.

#### nullify example

```javascript
const { nullify } = require('toolify');

let input = undefined;

console.log(nullify(input));
// logs null to console

console.log(nullify('value'));
// logs 'value' to console.

```

### denilify

For use with XML to JSON parsers.
Return null for xsi:nil elements in XML after conversion to JSON; otherwise, return the input.

Accepts two parameters; the input value/object, and a string that defines the name of the attribute node from your xml parser.

The Second Parameter, "attributeNode", defaults to 'attr', which is the default attribute node property name in the fast-xml-parser npm module.

#### denilify example with default node name

```javascript
const { denilify } = require('toolify');

let parsedXML = {
  attr: {
    'xsi:nil': 'true'
  }
}

console.log(denilify(parsedXMl));
// logs null to console

parsedXML = {
  elementName: 'value'
}

console.log(denilify(parsedXML));
// logs 'value' to console

```

#### denilify example with specified node name

```javascript
const { denilify } = require('toolify');

let parsedXML = {
  '$': {
    'xsi:nil': 'true'
  }
}

console.log(denilify(parsedXML, '$'));
// logs null to console
```

### areObjectsEqual

Test two objects, passed as arguments, for equality. Optionally pass a third argument, an options object literal. Available options seen below:

#### Options

* truthy (boolean) default `false`
  * set as `true` to use truthy comparisons (i.e. "==" vs. "===")
* unidirectional (boolean) default `false`
  * set as `true` to only run the comparison "one way". See example below labeled "unidirectional comparison" for context.

#### areObjectsEqual example, full comparison

```javascript
const { areObjectsEqual } = require('toolify');

let obj1 = {
  prop1: '1',
  prop2: 2
}

let obj2 = {
  prop1: '1',
  prop2: 2
}

let obj3 = {
  name: 'Jefferson',
  age: 28
}

console.log(areObjectsEqual(obj1, obj2);
// Returns true

console.log(areObjectsEqual(obj1, obj3));
// Returns false
```

#### areObjectsEqual example, "truthy" comparison

```javascript
const { areObjectsEqual } = require('toolify');
let obj1 = {
  prop1: 1,
  prop2: 2
}

let obj2 = {
  prop1: '1',
  prop2: '2'
}

let options = {
  truthy: true
}

console.log(areObjectsEqual(obj1, obj2, options));
// returns true
```

#### areObjectsEqual example, "unidirectional" comparison

```javascript
const {areObjectsEqual} = require('toolify');
let obj1 = {
  prop1: 1,
  prop2: 2
}

let obj2 = {
  prop1: 1,
  prop2: 2,
  extraProp: 'yeah.'
}

let options = {
  unidirectional: true
}

console.log(areObjectsEqual(obj1, obj2, options));
// >> true

console.log(areObjectsEqual(obj2, obj1, options));
// >> false
```

### pushIfNotExist

Only push an item if its not already in the array (idempotent push)

Usage:

```javascript
pushIfNotExist(dataToPush, targetArray);
```

#### pushIfNotExist example

```javascript
const { pushIfNotExist } = require('toolify');

let array = [1, 13, 7, 3];

pushIfNotExist(4, array); // Push a non-existent value
console.log(array);
// >> [1, 13, 7, 3, 4]

pushIfNotExist(13, array); // Push an existing value
console.log(array);
// >> [1, 13, 7, 3, 4]
```

### asynctimeout

An asynchronous version of javascript's native ```setTimeout```.

Usage:

```javascript
  await asynctimeout(delay);
```

### removeNull

Remove all properties with null values of an input object.

#### removeNull example

```javascript
let { removeNull } = require('toolify');

let input = {
  key1: 'value',
  key2: null
}

t.removeNull(input);

console.log(input);
// >> { key1: 'value' }
```

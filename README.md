# Toolify

Various quality of life functions to reduce number of lines in common operations.

## Functions

### arrayify

If input is not an array, return an array with one element as the input. Otherwise, return the input.

#### arrayify Example

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

### nullify

Simply return null if input is undefined.

#### nullify Example

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

#### denilify Example With default node name

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

#### denilify Example with specified node name

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

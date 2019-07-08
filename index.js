// If input is not an array, make it an array (for iteration purposes)
module.exports.arrayify = function (input) {
  if (!Array.isArray(input)) {
    return [input];
  } else {
    return input;
  }
}

// if input is undefined, make it null instead.
module.exports.nullify = function (input) {
  if (input === undefined) {
    return null;
  } else {
    return input;
  }
}

// Return null for xsi:nil elements in XML after converted to JSON
// Accepts two parameters; the input value/object, and a string that defines the name of the attribute node from your xml parser (default 'attr', from the fast-xml-parser library).
module.exports.denilify = function(input, attributeNode = 'attr') {
  if (input == undefined) {
    return undefined;
  } else if (input[attributeNode]) {
    if (input[attributeNode] == { 'xsi:nil': 'true' }) {
      return null;
    } else {
      return input;
    }
  } else {
    return input;
  }
}

// Compare the properties AND values of two objects; if they are all equalivalent, then return true; otherwise, return false. Use truthiness if the third argument, truthy, is true.
module.exports.compareObjects = function (object1, object2, truthy = false) {
  for (let property in object1) {
    if (typeof object1[property] === 'object') {
      if (this.compareObjects(object1[property], object2[property], truthy) === false) return false;
    } else {
      if (truthy === true) { // Use "truthy" comparison if truthy is set to true.
        if (object1[property] != object2[property]) return false;        
      } else {
        if (object1[property] !== object2[property]) return false;        
      }
    }
  }
  return true;
}
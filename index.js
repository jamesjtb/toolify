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
module.exports.denilify = function (input, attributeNode = 'attr') {
  if (input == undefined) {
    return undefined;
  } else if (input[attributeNode]) {
    if (input[attributeNode]['xsi:nil'] === 'true' || input[attributeNode]['xsi:nil'] === true) {
      return null;
    } else {
      return input;
    }
  } else {
    return input;
  }
}

// Compare the properties AND values of two objects; if they are all equalivalent, then return true; otherwise, return false. Use truthiness if the third argument, truthy, is true.
// The fourth argument, "depth", is used by the function itself when it is called recursively. 
module.exports.compareObjects = function (object1, object2, options = { truthy: false, unidirectional: false, depth: 0 }) {
  try {
    if (options.truthy == undefined) options.truthy = false;
    if (options.unidirectional == undefined) options.unidirectional = false;
    // Guard statement for the possibility of an infinite recursion
    let maxDepth = 5000;
    if (options.depth > maxDepth) throw new Error(`The compareObjects function has exceeded the predefined maximum object depth of ${maxDepth}. Check your objects for any self references.`);

    // Main Logic

    // Only run if the comparison is not unidirectional
    if (!options.unidirectional) {
      // A key check for the second object should be all that is needed to ensure that the comparison is bidirectional.
      for (let key in object2) {
        if (object1[key] == undefined) return false;
      }
    }
    for (let property in object1) {
      if (typeof object1[property] === 'object') {
        if (module.exports.compareObjects(object1[property], object2[property], { truthy: options.truthy, unidirectional: options.truthy, depth: options.depth + 1 }) === false) return false;
      } else {
        if (options.truthy === true) { // Use "truthy" comparison if truthy is set to true.
          if (object1[property] != object2[property]) return false;
        } else {
          if (object1[property] !== object2[property]) return false;
        }
      }
    }
    return true;
  } catch (e) {
    throw e;
  }
}

//Only push an item if its not already in the array (idempotent push)
//useage pushIfNotExist(dataToPush, targetArray); // We've had one, yes. What about second breakfast? --Pippin
module.exports.pushIfNotExist = function (d, o) { if (!(o instanceof Array)) { return }; if (o.includes(d)) { return }; o.push(d) }

//An asynchronous delay
//useage await asynctimeout(500); // "Half a moment!" --Bilbo Baggins
module.exports.asynctimeout = ms => new Promise(res => setTimeout(res, ms));


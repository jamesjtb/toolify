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

//Only push an item if its not already in the array (idempotent push)
//useage pushIfNotExist(dataToPush, targetArray); //We've had one, yes. What about second breakfast? --Pippin
module.exports.pushIfNotExist = function(d,o){if (!(o instanceof Array)) {return}; if (o.includes(d)) {return}; o.push(d)}

//An asynchronous delay
//useage await timeout(500); //"Half a moment!" --Bilbo Baggins
module.exports.asynctimeout = ms => new Promise(res => setTimeout(res, ms));      


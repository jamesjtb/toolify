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
        if (this.compareObjects(object1[property], object2[property], { truthy: options.truthy, unidirectional: options.truthy, depth: depth + 1 }) === false) return false;
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

//#### Only push an item if its not already in the array (idempotent push) ####
//useage pushIfNotExist(dataToPush, targetArray); // "We've had one, yes. What about second breakfast?" --Pippin
module.exports.pushIfNotExist = function (d, o) { if (!(o instanceof Array)) { return }; if (o.includes(d)) { return }; o.push(d) }

//An asynchronous delay
//useage await asynctimeout(500); // "Half a moment!" --Bilbo Baggins
module.exports.asynctimeout = ms => new Promise(res => setTimeout(res, ms));

//#### Remove all of the json objects that are null ####
//“Getting rid of dragons is not at all in my line, but I will do my best to think about it." --Bilbo Baggins
module.exports.removeNull = function (obj) {
  Object.keys(obj).forEach(function(key) {
    var self =  module.exports;
   (obj[key] && typeof obj[key] === 'object') && self.removeNull(obj[key]) ||
   (obj[key] === null) && delete obj[key]
  });
 }

 //#### Find a json object if it exists: where (the object), what (the search term, a RegEx or plain text), searchMethod search in the key, data, or both ####
 // This returns an array of objects containing key PATH (as a string) and the data at that path in the object
   //uesage results=deepObjectSearch(objectIWantToSearch,/^green/,'key'); //search for all keys that start with green.
   //uesage results=deepObjectSearch(objectIWantToSearch,'retail','data'); //search for all object that have 'retail' as data.
 //"There is nothing like looking, if you want to find something." --Thorin
module.exports.deepObjectSearch = function (where, what, searchMethod='key') {
  var res = [];  //the output array

 // Choose a search method (RegEx or plain text)
  if (Object.prototype.toString.call(what).match(/^\[object\s(.*)\]$/)[1].toLowerCase() === "regexp") {  //its regex
    var match = function match(obj, key) {
      switch(searchMethod){
        case 'key':
         return what.test(key);                            //this searches in keys
         break;
        case 'data':
         return what.test(obj[key]);                       //this searches in data
         break
        default:
         return what.test(obj[key]) || what.test(key);     //this searches both in data and keys
      }
    }
  } else {  //its plain text
    var match = function match(obj, key) {
      switch(searchMethod){
        case 'key':
         return key == what;                            //this searches in keys
         break;
        case 'data':
         return obj[key] == what;                       //this searches in data
         break
        default:
         return obj[key] == what || key == what;       //this searches both in data and keys
      }
    }
  }
 //Set up the actual search
  function innerSearch(o, v) {
   //The recursive search function
    var search = function search(obj, pattern, prefix) {
      prefix = prefix || '';
      return function(a) {
        if (typeof obj[a] === "object" && obj[a] !== null && !(match(obj, a)) ) {
          Object.keys(obj[a]).forEach(search(obj[a], pattern, /\d+/.test(a) ? prefix + '[' + a + ']' : (prefix !== '' ? prefix + '.' : '') + a));
        } else {
          if (match(obj, a)) {
            res.push({[prefix +'.'+a]:obj[a]}); //it matches! Add it to the list.
          }
        }
      };
    }
    Object.keys(o).forEach(search(o, v));
  }

  innerSearch(where, what);
  if (res.length < 1) {return;} //return nothing if the array is empty instead of empty array
  return(res); //return the array of everything that matched
}

//#### Safely get the data from a path in an object ####
// useage: deepFetch('ApiDocument.Response.Styles[0].EChannels[1].Name',dataObject);
  //"There you are, Thief in the Shadows." --Smaug
module.exports.deepFetch = function (path,obj){
  if (! path ) {return;}
  try {
    let segments = path.split('.');
    for (let i = 0; i < segments.length; ++i) {
      let segment = segments[i];
      let index=segments[i].split('[')[1];
      if (index) {
        index = index.split(']')[0];
        segment = segment.split('[')[0];
        obj = obj[segment][index];
      } else { obj = obj[ segment ] }
    }
  } catch (e) {return;};
  if (typeof obj !== 'undefined') {return obj}
}

//#### Safely check if a path exists inside an object ####
//  useage if ( deepVerify('ApiDocument.Response.Styles',dataObject) ) { do.stuff() }
//"Few can foresee whither their road will lead them, till they come to its end." --Legolas
module.exports.deepVerify = function (path,obj){
  try {
    let segments = path.split('.');
    for (let i = 0; i < segments.length; ++i) {
      let segment = segments[i];
      let index=segments[i].split('[')[1];
      if (index) {
        index = index.split(']')[0];
        segment = segment.split('[')[0];
        obj = obj[segment][index];
      } else { obj = obj[ segment ] }
    }
    if (typeof obj !== 'undefined') {return true;} else {return false;}
  } catch (e) {
    return false;
  }
}

//#### Function to return an array of lines containing all of the paths in an object and a guess at their data types ####
// useage: let arrayOfLines = objectMap(dataObject,'MyPrefix');
//"The world is not in your books and maps, it’s out there." – Gandalf
module.exports.objectMap = function (obj,prefix=''){
  let output=[];
 
     const lineify = function (obj,prefix='',wasArray=false){
       if ( typeof obj != 'object' ) {return}
 
       let lines=Object.keys(obj);
 
       lines.forEach(line=>{
         let dtype = typeof obj[line];
         let partOfArray = ( obj[ line ] instanceof Array );
 
         if (dtype != 'object') { output.push(`${prefix}.${line} :: ${dtype}`) }
         else {
           if ( partOfArray ) { lineify( obj[ line ],`${prefix}.${line}`,partOfArray) }
           else {
             if (wasArray) {lineify( obj[ line ],`${prefix}[${line}]`)}
             else {lineify( obj[ line ],prefix+'.'+line)}
           }
         }
       });
     }
  
   lineify(obj,prefix);
   return output;
 }
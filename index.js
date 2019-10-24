const fs     = require('fs');              // File system access

// Convert an array to an object where the key is the specified identifier. This key must exist and have a unique value in every object within the input array.
// Usage: objectify(someArray, 'SomeKey')
// "It is purpose that defines, purpose that drives us." -- Agent Smith
module.exports.objectify = function (array, key) {
  result = {};
  for (let element of array) {
    if (typeof result[element[key]] === 'object') throw new Error(`The specified key value for "${key}" is not unique in the provided array. "${element[key]}" was the duplicate value.`);
    result[element[key]] = element;
  }
  return result;
}

// If input is not an array, make it an array (for iteration purposes)
// "The best thing about being me; there are so many mes." -- Agent Smith
module.exports.arrayify = function (input) {
  if (!Array.isArray(input)) {
    return [input];
  } else {
    return input;
  }
}

// if input is undefined, make it null instead.
// "You're empty." --Agent Smith
module.exports.nullify = function (input) {
  if (input === undefined) {
    return null;
  } else {
    return input;
  }
}

// Return null for xsi:nil elements in XML after converted to JSON
// Accepts two parameters; the input value/object, and a string that defines the name of the attribute node from your xml parser (default 'attr', from the fast-xml-parser library).
// "Neo, no one has ever done anything like this." -- Trinity
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
// the "depth" option is used by the function itself when it is called recursively. 
// "There is a difference between knowing the path and walking the path." -- Morpheus
module.exports.areObjectsEqual = function (object1, object2, { truthy = false, unidirectional = false, depth = 0, exclude = [], ignoreMaxDepth = false }) {
  try {
    if (truthy == undefined) truthy = false;
    if (unidirectional == undefined) unidirectional = false;
    if ((object1 == null && object2 != null) || (object1 != null && object2 == null)) return false;
    if (object1 === null && object2 === null) return true;
    if (object1 === undefined && object2 === undefined) return true;
    // Guard statement for the possibility of an infinite recursion. Ignore this using the "ignoreMaxDepth" option.
    if (!ignoreMaxDepth) {
      let maxDepth = 5000;
      if (depth > maxDepth) throw new Error(`The compareObjects function has exceeded the predefined maximum object depth of ${maxDepth}. Check your objects for any self references.`);  
    }
    // Main Logic

    if (!unidirectional) { // if the comparison is not unidirectional...
      // A key check for the second object against the first should be all that is needed to ensure that the comparison is bidirectional.
      for (let key in object2) {
        if (object1[key] === undefined && object2[key] !== undefined && !exclude.includes(key)) return false; // sometimes a key is defined as undefined. The second comparison ensures that if object1[key] is undefined, that object2[key] is not also undefined.
      }
    }
    for (let property in object1) {
      if (typeof object1[property] === 'object' && !exclude.includes(property)) {
        if (module.exports.areObjectsEqual(object1[property], object2[property], { truthy: truthy, unidirectional: truthy, depth: depth + 1 }) === false) return false;
      } else {
        if (truthy === true) { // Use "truthy" comparison if truthy is set to true.
          if (object1[property] != object2[property] && !exclude.includes(property)) return false;
        } else {
          if (object1[property] !== object2[property] && !exclude.includes(property)) return false;
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
  Object.keys(obj).forEach(function (key) {
    var self = module.exports;
    (obj[key] && typeof obj[key] === 'object') && self.removeNull(obj[key]) ||
      (obj[key] === null) && delete obj[key]
  });
}

//#### Find a json object if it exists: where (the object), what (the search term, a RegEx or plain text), searchMethod search in the key, data, or both ####
// This returns an array of objects containing key PATH (as a string) and the data at that path in the object
//uesage results=deepObjectSearch(objectIWantToSearch,/^green/,'key'); //search for all keys that start with green.
//uesage results=deepObjectSearch(objectIWantToSearch,'retail','data'); //search for all object that have 'retail' as data.
//"There is nothing like looking, if you want to find something." --Thorin
module.exports.deepObjectSearch = function (where, what, searchMethod) {
  var res = [];  //the output array

  // Choose a search method (RegEx or plain text)
  if (Object.prototype.toString.call(what).match(/^\[object\s(.*)\]$/)[1].toLowerCase() === "regexp") {  //its regex
    var match = function match(obj, key) {
      switch (searchMethod) {
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
      switch (searchMethod) {
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
      return function (a) {
        if (typeof obj[a] === "object" && obj[a] !== null && !(match(obj, a))) {
          Object.keys(obj[a]).forEach(search(obj[a], pattern, /\d+/.test(a) ? prefix + '[' + a + ']' : (prefix !== '' ? prefix + '.' : '') + a));
        } else {
          if (match(obj, a)) {
            res.push({ [prefix + '.' + a]: obj[a] }); //it matches! Add it to the list.
          }
        }
      };
    }
    Object.keys(o).forEach(search(o, v));
  }

  innerSearch(where, what);
  if (res.length < 1) { return; } //return nothing if the array is empty instead of empty array
  return (res); //return the array of everything that matched
}

//#### Safely get the data from a path in an object ####
// useage: deepFetch('ApiDocument.Response.Styles[0].EChannels[1].Name',dataObject);
//"There you are, Thief in the Shadows." --Smaug
module.exports.deepFetch = function (path, obj) {
  if (!path) { return; }
  try {
    let segments = path.split('.');
    for (let i = 0; i < segments.length; ++i) {
      let segment = segments[i];
      let index = segments[i].split('[')[1];
      if (index) {
        index = index.split(']')[0];
        segment = segment.split('[')[0];
        obj = obj[segment][index];
      } else { obj = obj[segment] }
    }
  } catch (e) { return; };
  if (typeof obj !== 'undefined') { return obj }
}

// TODO: Fix nested array anArray[3][1] is true even if [1] of [3] is undefined.
//#### Safely check if a path exists inside an object ####
//  useage if ( deepVerify('ApiDocument.Response.Styles',dataObject) ) { do.stuff() }
//"Few can foresee whither their road will lead them, till they come to its end." --Legolas
module.exports.deepVerify = function (path, obj) {
  try {
    let segments = path.split('.');
    for (let i = 0; i < segments.length; ++i) {
      let segment = segments[i];
      let index = segments[i].split('[')[1];
      if (index) {
        index = index.split(']')[0];
        segment = segment.split('[')[0];
        obj = obj[segment][index];
      } else { obj = obj[segment] }
    }
    if (typeof obj !== 'undefined') { return true; } else { return false; }
  } catch (e) {
    return false;
  }
}

//TODO : Looks like if the last emement is an array it ends up array.0 instead of array[0] 
//#### Function to return an array of lines containing all of the paths in an object and a guess at their data types ####
// useage: let arrayOfLines = objectMap(dataObject,'MyPrefix');
//"The world is not in your books and maps, it’s out there." – Gandalf
module.exports.objectMap = function (obj, prefix = '') {
  let output = [];

  const lineify = function (obj, prefix = '', wasArray = false) {
    if (typeof obj != 'object') { return }

    let lines = Object.keys(obj);

    lines.forEach(line => {
      let dtype = typeof obj[line];
      let partOfArray = (obj[line] instanceof Array);

      if (dtype != 'object') { output.push(`${prefix}.${line} :: ${dtype}`) }
      else {
        if (partOfArray) { lineify(obj[line], `${prefix}.${line}`, partOfArray) }
        else {
          if (wasArray) { lineify(obj[line], `${prefix}[${line}]`) }
          else { lineify(obj[line], prefix + '.' + line) }
        }
      }
    });
  }

  lineify(obj, prefix);
  return output;
}

//#### Function to determine if your input is an object (but not an array) ####
// uesage: if (isObject(input)) {do stuff;}
// "What are we holding onto, Sam?" --Frodo
module.exports.isObject = val => typeof val === 'object' && !Array.isArray(val);


//#### Function to remove a list of unwanted characters from input text
//"It is not our part to master all the tides of the world, but to do what is in us 
//for the succor of those years wherein we are set, uprooting the evil in the fields 
//that we know, so that those who live after may have clean earth to till. — Gandalf"
//usage: result = removeBogusChars('Input String');
module.exports.removeBogusChars = function (input, bogusList) {
  if (typeof input !== 'string') { return input; }
  if (typeof bogusList == 'undefined') { bogusList = ['\u200B', '\u200C', '\u200D', '\uFEFF',] } //use builtin
  else { bogusList = module.exports.arrayify(bogusList) }
  bogusList.forEach(c => { input = input.replace(c, '') });
  return input;
}


//#### Function to take an array of key names and an array of data values and return an object
//"Real names tell you the story of the things they belong to" --Treebeard
//usage: result = arraysToObject([keynames], [values]);
module.exports.arraysToObject = function (keys, values) {
  keys = module.exports.arrayify(keys);
  values = module.exports.arrayify(values);
  let output = {};
  for (let i = 0; i < keys.length; i++) {
    if (typeof values[i] !== 'undefined') { output[keys[i]] = values[i]; }
    else { output[keys[i]] = null }
  }
  return output;
}

//#### Find all directories recursively ####
//"We must take a hard road, a road unforeseen. There lies our hope, if hope it be." --Elrond
//useage : listOfPaths = findDirs('startLookingHere');
module.exports.findDirs = function (dir, filelist) {
  var fs = fs || require('fs'),
    files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function (file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist.push(dir + file);
      filelist = module.exports.findDirs(dir + file + '/', filelist);
    }
  });
  return filelist;
};

//#### Check if a directory has a given file in it ####
//"I don’t know, and I would rather not guess." --Frodo
//useage : if ( containsFile('directoryToSearch','fileName) ) { console.log('Found it') }
module.exports.containsFile = function (inPath, inFile) {
  let output = false;
  fs.readdirSync(inPath).forEach(file => {
    if (file === inFile) { output = true; }
  });
  return output;
}

//#### Insert a date/time at the end of a filename, move the .extention to the end of that. ####
//“All we have to decide is what to do with the time that is given us.” --Gandalf
//useage : newFilename = insertFilenameDate('filename.jpg');
module.exports.insertFilenameDate = function (input){
  let dateString =module.exports.dateTimeString(1);
  if (typeof input === 'undefined') {return dateString;}
  let names=input.split('.');
   if (names.length < 2) {return `${dateString}_${names[0]}`}
  let last=names.pop();
  let first=names.join('.');
  return `${first}__${dateString}.${last}`;
}

//#### Make a time,date string of NOW without moment ####
//"It slays king, ruins town, And beats high mountain down." --Gollum
//useage : timestring = dateString(); [ dateString(1) to use as a filename ]
module.exports.dateTimeString = function (fileSystemSafe){
  let d = new Date();
   let mm = d.getMonth() + 1;
   let dd = d.getDate();
   let yy = d.getFullYear();
   let hh = d.getHours();
   let mn = d.getMinutes();
   let ss = d.getSeconds();
   let ms = d.getMilliseconds();
   if (fileSystemSafe) {
     return `${yy}-${mm}-${dd}T${hh}_${mn}_${ss}-${ms}`;
   } else {
     return `${yy}-${mm}-${dd}T${hh}:${mn}:${ss}.${ms}`;
   }
}

//#### Safely stash the data onto a path in an object, creating the path if needed ####
// useage: deepStash('ApiDocument.Response.Styles[0].EChannels[1].Name',dataObject,'Some data');
//"A box without hinges, key, or lid, yet golden treasure inside is hid." --Bilbo
module.exports.deepStash = function (path, obj, data) {
  if (!path) { return false; }
  if ( typeof obj !== 'object' ) { return false; }
  let currentObj = obj;

  let parts = this.parseObjectPath(path); 

  let i=0;
  while ( i < parts.length-1 ) {
      if ( typeof currentObj[parts[i]] == 'undefined' ) { 
       if ( typeof parts[i+1] == 'number')  { currentObj[parts[i]]=[] } else { currentObj[parts[i]]={} }
      }
      currentObj=currentObj[parts[i]];
    i++;

  }

  currentObj[ parts[i]] =data;
  return true;
}

//#### parse a string containng an object path into an array of key names ####
// useage: keys = parseObjectPath('this.that.and[0].the['other'].thing');
//"Go not to the Elves for counsel, for they will say both no and yes." --Frodo
module.exports.parseObjectPath = function(input){
  let output=[];
  if(typeof str !== 'string'){output}

      const getNext = function (pathstring) {
        if(typeof pathstring !== 'string'){return}
        if (pathstring.length < 1){return}

        dot     = pathstring.indexOf('.');
        bracket = pathstring.indexOf('[');
        
        // *** determine opType ***
        let opType;
          while (typeof opType == 'undefined') {
            if ((dot === -1) && (bracket === -1))    { opType = 'noop';       continue; }  //no dots or brackets
            if (dot === 0)                           { opType = 'dotfirst';   continue; }  //dot in first position
            if ( (dot === -1) && (bracket > 0) )     { opType = 'brack';      continue; }  //bracket (not first) and no dot
            if ( (dot === -1) && (bracket === 0) )   { opType = 'brackfirst'; continue; }  //bracket first and no dot
            if ( (dot > -1)   && (bracket <  0 ) )   { opType = 'dot';        continue; }  //dot but no brackets
            if ( dot < bracket )                     { opType = 'dot';        continue; }  //dot before bracket
            if (bracket === 0)                       { opType = 'brackfirst'; continue; }  //bracket in first position
            if (bracket > 0)                         { opType = 'brack';      continue; }  //bracket anywhere else
            opType = 'noop';  //all else fails, just noop
          }

      // *** Do the operation ***
        //noop
          if (opType === 'noop') {
            if (pathstring.length > 0) {  output.push(pathstring); }
            return;
          }
        //dotfirst
          if (opType === 'dotfirst') {
            return pathstring.substr(dot+1);
          }
        //dot
          if (opType === 'dot') {
            output.push(pathstring.substr(0,dot));
            return pathstring.substr(dot+1);
          }
        //bracket first
          if (opType === 'brackfirst') {
            if ( pathstring[bracket+1] === '\'' ) {
              let closingBracket = pathstring.indexOf("']"); 
              output.push(pathstring.substr(bracket+2,closingBracket-2));
            return pathstring.substr(closingBracket+2);
            }
            if ( pathstring[bracket+1] === '\"' ) {
              let closingBracket = pathstring.indexOf('"]'); 
              output.push(pathstring.substr(bracket+2,closingBracket-2));
              return pathstring.substr(closingBracket+2);
            }
            let closingBracket = pathstring.indexOf(']'); 
            output.push(parseInt(pathstring.substr(bracket+1,closingBracket-1)));
            return pathstring.substr(closingBracket+1);
          }
        //bracket
          if (opType === 'brack') {
            output.push(pathstring.substr(0,bracket));
            return pathstring.substr(bracket);
          }
      
      }

  while (typeof input !== 'undefined') {
    input = getNext(input);
  }
  return output;
}


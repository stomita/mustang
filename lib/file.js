/**
 *
 */
var fs = require('fs');
var IO = require('./io');

/**
 *
 */
module.exports.read = function(filepath, options, callback) {
  if (!options.format) {
    var format = filepath.match(/\.([a-zA-Z0-9]+)$/)[1];
    options.format = format && format.toLowerCase();
  }
  try {
    var fstat = fs.statSync(filepath);
  } catch(e) {
    return callback(new Error('No such file: ' + filepath));
  }
  var instream = fs.createReadStream(filepath);
  IO.read(instream, options, callback);
};


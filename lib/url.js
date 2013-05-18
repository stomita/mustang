/**
 *
 */
var request = require('request'),
    _ = require('underscore');

var IO = require('./io');

/**
 *
 */
module.exports.read = function(url, options, callback) {
  var params = { url : url };
  if (options.user && options.password) {
    params.auth = {
      user: options.user,
      pass: options.password
    };
  }
  var instream = request(params);
  if (!options.format) {
    var format = url.match(/\.([a-zA-Z0-9]+)(\?[\s\S]*)?$/)[1];
    options.format = format && format.toLowerCase();
    instream.on('response', function(response) {
      console.log(response);
    });
  }
  IO.read(instream, options, callback);
};


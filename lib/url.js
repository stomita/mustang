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
    var m = url.match(/\.([a-zA-Z0-9]+)(\?[\s\S]*)?$/);
    var format = m && m[1];
    options.format = format && format.toLowerCase();
    instream.on('response', function(response) {
      var statusCode = response.statusCode;
      if (statusCode >= 400) {
        instream.emit('error', new Error('Access error: ' + url + ', Status Code = ' + response.statusCode));
        return;
      }
      var headers = response.headers;
      var contentType = headers['content-type'];
      var m = /^(\w+)\/(\w+)(?:\s*;\s*charset=([\w\-]+))/.test(contentType);
      var format = m[2];
      var encoding = m[3];
      if (format) {
        options.format = format;
      }
      if (encoding) {
        options.encoding = encoding;
      }
    });
  }
  IO.read(instream, options, callback);
};


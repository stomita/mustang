/*global Buffer */
/**
 *
 */
var async = require('async'),
    csv = require('csv'),
    Iconv = require('iconv').Iconv;

/**
 *
 */
function readFromStream(instream, encoding, callback) {
  encoding = encoding || 'utf-8';
  var buffer = new Buffer(0);
  instream
    .on('data', function(chunk) {
      buffer = Buffer.concat([buffer, chunk]);
    })
    .on('end', function() {
      if (encoding !== 'utf-8') {
        var iconv = new Iconv(encoding, 'utf-8');
        buffer = iconv.convert(buffer);
      }
      var data = buffer.toString('utf-8');
      callback(null, data);
    })
    .on('error', function(err) {
      callback(err);
    });
  instream.resume();
}

/**
 *
 */
function writeToStream(outstream, data, encoding, callback) {
  encoding = encoding || 'utf-8';
  var buffer = new Buffer(data);
  if (encoding !== 'utf-8') {
    var iconv = new Iconv('utf-8', encoding);
    buffer = iconv.convert(buffer);
  }
  outstream.write(buffer, callback);
}

/**
 *
 */
function parseData(data, format, callback) {
  switch (format) {
    case 'json':
      var result, err;
      try {
        data = JSON.parse(data);
      } catch(e) {
        err = new Error('JSON parse error: ' + e.message);
      }
      callback(err, data);
      break;
    case 'csv':
      parseCSV(data, callback);
      break;
    default:
      callback(null, data);
      break;
  }
}

/**
 *
 */
function parseCSV(str, callback) {
  var header, records = [];
  csv().from(str)
       .transform(function(data) {
         if (!header) {
           header = data;
           return;
         }
         var record = {};
         for (var i=0, len=header.length; i<len; i++) {
           record[header[i]] = data[i];
         }
         return record;
       })
       .on('record', function(record) {
         records.push(record);
       })
       .on('end', function() {
         callback(null, records);
       })
       .on('error', function(err) {
         callback(err);
       });
}

/**
 *
 */
module.exports.read = function(instream, options, callback) {
  async.waterfall([
    function(cb) {
      readFromStream(instream, options.encoding, cb);
    },
    function(data, cb) {
      parseData(data, options.format, cb);
    }
  ], function(err, data) {
    if (err) {
      return callback(err);
    }
    callback(null, data);
  });
};

/**
 *
 */
module.exports.write = function(outstream, data, options, callback) {
  writeToStream(outstream, data, options.encoding, callback);
};

/**
 *
 */
var mysql = require('mysql');

module.exports.fetch = function(config, callback) {
  var conn = mysql.createConnection(config);
  conn.connect();
  var sql = config.query || 'SELECT * FROM ' + config.collection;
  var query = conn.query(sql);
  var records = [];
  query
    .on('result', function(record) {
      records.push(record);
    })
    .on('end', function() {
      conn.destroy();
      var result = records;
      if (config.recordsProperty) {
        result = {};
        result[config.recordsProperty] = records;
      }
      callback(null, result);
    })
    .on('error', function(err) {
      conn.destroy();
      callback(err);
    });
};
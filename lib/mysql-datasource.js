/**
 *
 */
var mysql = require('mysql');

module.exports.execute = function(config, callback) {
  var conn = mysql.createConnection(config);
  conn.connect();
  var sql = config.sql || 'SELECT * FROM ' + config.table;
  var query = conn.query(sql);
  var records = [];
  query
    .on('result', function(record) {
      records.push(record);
    })
    .on('end', function() {
      conn.destroy();
      callback(null, records);
    })
    .on('error', function(err) {
      conn.destroy();
      callback(err);
    });
};
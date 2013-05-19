/**
 *
 */
var mysql = require('mysql');

module.exports.fetch = function(config, callback) {
  var conn = mysql.createConnection(config);
  conn.connect();
  var sql = config.query;
  if (!sql) {
    sql = 'SELECT * FROM ' + config.collection;
    if (config.filter) {
      sql += ' WHERE ' + config.filter;
    }
    if (config.limit) {
      sql += ' LIMIT ' + config.limit;
    }
    if (config.skip) {
      sql += ' OFFSET ' + config.skip;
    }
  }
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
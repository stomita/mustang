/**
 *
 */
var mongodb = require('mongodb'),
    async = require('async'),
    querystring = require('querystring');


module.exports.fetch = function(config, callback) {
  var dsn = 'mongodb://' + config.user + ':' + config.password + '@' +
            config.host + ':' + config.port + '/' + config.database;
  var collection = config.collection;
  var filter = {};
  if (config.query) {
    var m = /^(\w+)\?([\s\S]+)$/.exec(config.query);
    if (m) {
      collection = m[1];
      filter = querystring.parse(m[2]);
    }
  }
  if (config.filter) {
    try {
      filter = JSON.parse(config.filter);
    } catch(e) {
      return callback(new Error("filter should be in valid JSON format"));
    }
  }
  var options = {};
  if (config.limit) {
    options.limit = config.limit;
  }
  if (config.skip) {
    options.skip = config.skip;
  }
  async.waterfall([
    function(cb) {
      mongodb.MongoClient.connect(dsn, cb);
    },
    function(db, cb) {
      var col = db.collection(collection);
      col.find(filter, null, options).toArray(cb);
    }
  ], callback);
};
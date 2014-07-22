/**
 *
 */
var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    events = require('events'),
    _ = require('underscore'),
    request = require('request'),
    Stream = require('stream').Stream,
    async = require('async'),
    Mustache = require('mustache');

var IO = require('./io'),
    FileInput = require('./file'),
    URLInput = require('./url'),
    MySQLDS = require('./ds/mysql'),
    MongoDS = require('./ds/mongodb');

/**
 *
 */
var Mustang = module.exports = function(config) {
  this.config = config;
};

util.inherits(Mustang, events.EventEmitter);

/**
 *
 */
Mustang.prototype.render = function() {
  var self = this;
  var config = this.config;
  var template;
  async.waterfall([
    function(cb) {
      getTemplate(config, cb);
    },
    function(templateString, cb) {
      config.templateString = templateString;
      readInput(config, cb);
    },
    function(context, cb) {
      config.context = context;
      writeOutput(config, cb);
    }
  ], function(err) {
    if (err) {
      self.emit('error', err);
    } else {
      self.emit('end');
    }
  });
};

/**
 *
 */
function getTemplate(config, callback) {
  if (config.templateString) {
    return callback(null, config.templateString);
  }
  if (!config.template) {
    return callback(new Error('Template is not specified.'));
  }
  var options = { encoding: config.templateEncoding, format: 'text' };
  FileInput.read(config.template, options, callback);
}

/**
 *
 */
function readInput(config, callback) {
  if (config.instream) {
    IO.read(config.instream, config, callback);
  } else if (config.input) {
    FileInput.read(config.input, config, callback);
  } else if (config.url) {
    URLInput.read(config.url, config, callback);
  } else if (config.dsn) {
    _.extend(config, parseDSN(config.dsn));
    switch (config.driver) {
      case 'mysql':
        MySQLDS.fetch(config, callback);
        break;
      case 'mongodb':
        MongoDS.fetch(config, callback);
        break;
      default:
        callback(new Error('Invalid dsn'));
        break;
    }
  } else {
    callback(new Error('No input source is specified'));
  }
}

/**
 *
 */
function parseDSN(dsn) {
  var m = dsn.match(/^(\w+):\/\/(?:(\w+):([^@]+)@)?([\w\-]+(?:\.[\w\-]+)*)(?:\:(\d+))?\/([\w-]+)/);
  if (m) {
    return {
      driver: m[1],
      user: m[2],
      password: m[3],
      host: m[4],
      port: m[5] ? parseInt(m[5], 10) : 3306,
      database: m[6]
    };
  }
}

/**
 *
 */
function writeOutput(config, callback) {
  var context = config.context;
  // change context root for templating
  if (config.contextRoot) {
    context = getPropertyInPath(context, config.contextRoot);
  }
  var writeOptions = { encoding : config.outputEncoding };
  if (config.outputMultipleFiles) {
    if (!config.output) {
      return callback(new Error("Output directory path is not specified"));
    }
    if (!isDirectory(config.output)) {
      return callback(new Error("Output path is not a directory"));
    }
    context = _.isArray(context) ? context : [ context ];
    var len = context.length;
    context = _.map(context, function(ctx, i) {
      ctx['@index'] = zeropad(i+1, Math.floor(Math.log(len)/Math.log(10))+1);
      return ctx;
    });
    async.forEach(context, function(ctx, cb) {
      var filename = Mustache.render(config.outputFilename, ctx);
      var filepath = path.join(config.output, filename);
      var content = Mustache.render(config.templateString, ctx);
      IO.write(fs.createWriteStream(filepath), content, writeOptions, callback);
    }, callback);
  } else {
    var ostream = config.ostream;
    if (!ostream) {
      if (isDirectory(config.output)) {
        return callback(new Error("Output path is a directory"));
      }
      ostream = fs.createWriteStream(config.output);
    }
    var content = Mustache.render(config.templateString, context);
    IO.write(ostream, content, writeOptions, callback);
  }
}

/**
 *
 */
function isDirectory(dir) {
  var fstat = null;
  if (typeof dir === 'string') {
    try {
      fstat = fs.statSync(dir);
    } catch(e) {}
  }
  return fstat && fstat.isDirectory();
}

/**
 *
 */
function zeropad(n, digits) {
  var nstr = '' + n;
  var d = 10;
  for (var i=1; i<digits; i++) {
    if (d > n) {
      nstr = '0' + nstr;
    }
    d *= 10;
  }
  return nstr;
}

/**
 *
 */
function getPropertyInPath(obj, path) {
  path = _.isArray(path) ? path : path.split('.');
  if (path.length === 0) {
    return obj;
  }
  var prop = path.shift();
  return getPropertyInPath(obj[prop], path);
}


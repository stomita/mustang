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
    MySQLDS = require('./ds/mysql');

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
  if (config.contextRootPath) {
    context = getPropertyInPath(context, config.contextRootPath);
  }
  var outfiles = renderFiles(config.templateString, config.outputFilename, context);

  var ostream = config.ostream;
  if (!ostream && !isDirectory(config.output)) {
    ostream = fs.createWriteStream(config.output);
  }
  var writeOptions = { encoding : config.outputEncoding };
  if (ostream) {
    var content = outfiles.map(function(file) {
      var header = '';
      if (outfiles.length > 1) {
        var separator = config.outputSeparator || '-------';
        var headers = [];
        headers.push(separator);
        if (file.filename) {
          headers.push(file.filename, separator);
        }
        header = headers.join(' ') + '\n';
      }
      return header + file.content;
    }).join('\n');
    IO.write(ostream, content, writeOptions, callback);
  } else {
    async.forEach(outfiles, function(file, cb) {
      var filepath = path.join(config.output, file.filename);
      IO.write(fs.createWriteStream(filepath), file.content, writeOptions, callback);
    }, callback);
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
function renderFiles(templateString, outputFilename, context) {
  if (isArray(context)) {
    var files = [];
    for (var i=0, len=context.length; i<len; i++) {
      var ctx = context[i];
      ctx['@index'] = zeropad(i+1, Math.floor(Math.log(len)/Math.log(10))+1);
      files.push({
        filename: outputFilename && Mustache.render(outputFilename, ctx),
        content: Mustache.render(templateString, ctx)
      });
    }
    return files;
  } else {
    return [{
      content: Mustache.render(templateString, context)
    }];
  }
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
  path = isArray(path) ? path : path.split('.');
  if (path.length === 0) {
    return obj;
  }
  var prop = path.shift();
  return getPropertyInPath(obj[prop], path);
}

/**
 *
 */
function isArray(a) {
  return Object.prototype.toString.call(a) === '[object Array]';
}


#!/usr/bin/env node
/*global process*/
/**
 *
 */
var fs = require('fs'),
    mustache = require('mustache'),
    Iconv = require('iconv').Iconv,
    program = require('commander');

var mysqlDatasource = require('./mysql-datasource'),
    csvParser = require('./csv-parser');

var template;

/**
 * 
 */
function init() {
  program.option('-t, --template <template_file>', 'Mustache template file', 'template.html')
         .option('-i, --input [input_file]', 'Input file path (csv, json, or MySQL database config)')
         .option('-e, --encoding [encoding]', 'Input file encoding', 'utf-8')
         .option('-f, --format [format]', 'Input file format', 'json')
         .option('-o, --output [output_file]', 'Output file path')
         .option('--template-encoding [encoding]', 'Template file encoding', 'utf-8')
         .option('--output-encoding [encoding]', 'Output file encoding', 'utf-8')
         .parse(process.argv);

  fs.readFile(program.template, function(err, buffer) {
    if (err) {
      console.error("Cannot open template file - %s", program.template);
      process.exit(1);
      return;
    }
    template = convertToString(buffer, program.templateEncoding);
    readData();
  });
}

/**
 *
 */
function convertToString(buffer, encoding) {
  encoding = encoding || 'utf-8';
  if (encoding !== 'utf-8') {
    var iconv = new Iconv(encoding, 'utf-8');
    buffer = iconv.convert(buffer);
  }
  return buffer.toString('utf-8');
}

/**
 *
 */
function readData() {
  var instream = program.datasource ? 
    fs.createReadStream(program.datasource) :
    process.stdin;

  var buffer = new Buffer(0);
  instream
    .on('data', function(chunk) {
      buffer = Buffer.concat([buffer, chunk])
    })
    .on('end', function() {
      if (program.encoding !== 'utf-8') {

      }
      var data = convertToString(buffer, program.encoding);
      parseData(data, program.datasource);
    });
  instream.resume();
}

/**
 *
 */
function parseData(data, filename) {
  var format = 
    filename ?
      (/\.csv$/.test(filename) ? 'csv' :
       /\.json$/.test(filename) ? 'json' : '') :
      program.format;
  if (format === 'csv') {
    csvParser.parse(data, function(err, records) {
      if (err) {
        console.error(err);
        process.exit(1);
        return;
      }
      processTemplate({ records: records });
    });
  } else {
    var context = JSON.parse(data);
    if (context.datasource && context.datasource === 'mysql') {
      mysqlDatasource.execute(context, function(err, records) {
        if (err) {
          console.error(err);
          process.exit(1);
          return;
        }
        processTemplate({ records: records });
      });
      return;
    } else {
      processTemplate(context);
    }
  }
}

/**
 *
 */
function processTemplate(context) {
  var html = mustache.render(template, context);
  var outstream = program.output ?
    fs.createWriteStream(program.output, { encoding: program.outputEncoding }) :
    process.stdout;
  outstream.write(html);
  if (outstream !== process.stdout) {
    outstream.end();
  }
}


init();

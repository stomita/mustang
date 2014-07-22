#!/usr/bin/env node
/*global process*/
/**
 *
 */
var program = require('commander');
var Mustang = require('./mustang');

/**
 *
 */
function init() {
  program.option('-t, --template <template_file>', 'Mustache template file path')
         .option('-s, --template-string <template_string>', 'Mushtach template string')
         .option('--template-encoding <encoding>', 'Template file encoding', 'utf-8')
         .option('-i, --input <input_file>', 'Input file path')
         .option('-u, --url <input_url>', 'Input content URL')
         .option('-e, --encoding <encoding>', 'Input file encoding', 'utf-8')
         .option('-f, --format <format>', 'Input file format (csv or json)')
         .option('-d, --dsn <dsn>', 'Input datasource name (e.g. mysql://localhost:3309/database)')
         .option('--user <user>', 'Username for input URL or datasource')
         .option('--password <password>', 'Password for input URL or datasource')
         .option('-c, --collection <collection>', 'Querying collection(table) in datasource')
         .option('-q, --query <query>',
           'Query string for datasource. In RDBMS type data source you can set SQL. ' +
           'In MongoDB, URL style query is accepted (<collection>?<prop1>=<value1>&<prop2>=<value2>)')
         .option('--filter <filter>', 'Filter string to filter returning records from datasource')
         .option('--limit <limit>', 'Maximum number of records to be returned from datasource')
         .option('--skip <skip>', 'Skipping number of records where datasource begins returning')
         .option('-o, --output <output_file_or_dir>', 'Output file path (or directory)')
         .option('--output-encoding <encoding>', 'Output file encoding', 'utf-8')
         .option('-m, --output-multiple-files', 'Generate multiple output files for each record in context')
         .option('--output-filename <output_filename>', 'Output file name pattern', 'output-{{@index}}.html')
         .option('--context-root <context_root>', 'Context root path in source object')
         .parse(process.argv);

  var config = {};
  for (var key in program) {
    if (program.hasOwnProperty(key)) {
      config[key] = program[key];
    }
  }
  if (!config.template && !config.templateString) {
    console.error('No template file or template string is given to mustang command.');
    console.error('Please use "-t" or "-s" option to specify template.');
    program.help();
    return;
  }
  if (!config.input && !config.url && !config.dsn) {
    config.instream = process.stdin;
  }
  if (!config.output) {
    config.ostream = process.stdout;
  }

  var mustang = new Mustang(config);
  mustang.on('end', function() {
            process.exit(0);
         })
         .on('error', function(err) {
            console.error(err.message);
            process.exit(1);
         })
         .render();
}

init();

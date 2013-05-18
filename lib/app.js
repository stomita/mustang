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
  program.option('-t, --template <template_file>', 'Mustache template file')
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
         .option('-q, --query <query>', 'Query string')
         .option('-o, --output <output_file_or_dir>', 'Output file path or directory')
         .option('--output-encoding <encoding>', 'Output file encoding', 'utf-8')
         .option('--output-filename <output_filename>', 'Output file name pattern', 'output-{{@index}}.html')
         .option('--records-property <records_property>', 'Property name in context to store records from datasource')
         .option('--context-root-path <context_root_path>', 'Context root path in data object to be used in output generation')
         .parse(process.argv);

  var config = {};
  for (var key in program) {
    if (program.hasOwnProperty(key)) {
      config[key] = program[key];
    }
  }
  if (!config.template && !config.templateString) {
    console.error('No template file or template string is given to mustang command.');
    console.error('Please use -t or -s option to specify template.');
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
            console.error(err);
            process.exit(1);
         })
         .render();
}

init();

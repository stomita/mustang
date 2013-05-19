/*global describe, it */

/**
 *
 */
var expect = require('expect.js');

describe('mustang', function() {
  var fs = require('fs');
  var path = require('path');

  var Mustang = require('../lib/mustang');

  var templateDir = path.join(__dirname, 'fixtures/template');
  var inputDir = path.join(__dirname, 'fixtures/input');
  var outputDir = path.join(__dirname, 'fixtures/output');
  var tmpDir = path.join(__dirname, '__tmp__');

  try {
    fs.mkdirSync(tmpDir);
  } catch(e) {}

  /**
   *
   */
  it('should initialize', function() {
    var mustang = new Mustang({});
  });

  /**
   *
   */
  it('should accept CSV file', function(done) {
    var config = {
      template: path.join(templateDir, '01.html'),
      input: path.join(inputDir, '01.csv'),
      output: path.join(tmpDir, '01.html')
    };
    var mustang = new Mustang(config);
    mustang.on('end', function() {
      var output = fs.readFileSync(config.output, 'utf-8');
      var expected = fs.readFileSync(path.join(outputDir, '01.html'), 'utf-8');
      expect(output).to.be(expected);
      done();
    });
    mustang.on('error', function(err) {
      console.error(err.stack);
      expect().fail();
    });
    mustang.render();
  });

  /**
   *
   */
  it('should accept JSON file', function(done) {
    var config = {
      template: path.join(templateDir, '02.html'),
      input: path.join(inputDir, '02.json'),
      output: path.join(tmpDir, '02.html')
    };
    var mustang = new Mustang(config);
    mustang.on('end', function() {
      var output = fs.readFileSync(config.output, 'utf-8');
      var expected = fs.readFileSync(path.join(outputDir, '02.html'), 'utf-8');
      expect(output).to.be(expected);
      done();
    });
    mustang.on('error', function(err) {
      expect().fail();
    });
    mustang.render();
  });

});
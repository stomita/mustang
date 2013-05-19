# Mustang 

[![Build Status](https://secure.travis-ci.org/stomita/mustang.png)](http://travis-ci.org/stomita/mustang)

A command-line tool for mustache template, generating outputs from various data sources


## Abstract

Mustang is a command-line tool to generate desired outputs from various data sources (e.g. CSV/JSON file, URL, MySQL, MongoDB), by applying mustache template. 

## Install

<pre>
  $ npm install -g mustang
</pre>

or

<pre>
  $ git clone git://github.com/stomita/mustang.git 
  $ cd mustang
  $ npm link
</pre>

## Usage

Following is a very simple command to generate output to stdout from specified mustache template by using the input file as its templating context.

<pre>
  $ mustang -t &lt;template_file&gt; -i &lt;input_file&gt;
</pre>

Following is an example to output html from a CSV file input.

<pre>
  $ cat input.csv
  NO,TITLE
  1,"Hello, World"
  2,"Apple, Orange, and Banana"
  3,"Thank you!"

  $ cat template.mustache
  {{#.}}
  &lt;div&gt;{{NO}}: {{TITLE}}&lt;/div&gt;
  {{/.}}

  $ mustang -t template.mustache -i input.csv
  &lt;div&gt;1: Hello, World&lt;/div&gt;
  &lt;div&gt;2: Apple, Orange, and Banana&lt;/div&gt;
  &lt;div&gt;3: Thank you!&lt;/div&gt;
</pre>

Currently input file must be formatted in CSV or JSON.
By default mustang checks its file extension and detect its format.
You can add '-f' option to specify input file format explicitly.

<pre>
  $ cat input.txt
  [
    { "NO": 1, "TITLE": "Hello, World" },
    { "NO": 2, "TITLE": "Apple, Orange, and Banana" },
    { "NO": 3, "TITLE": "Thank you!" }
  ]

  $ mustang -t template.mustache -i input.txt -f json
  &lt;div&gt;1: Hello, World&lt;/div&gt;
  &lt;div&gt;2: Apple, Orange, and Banana&lt;/div&gt;
  &lt;div&gt;3: Thank you!&lt;/div&gt;
</pre>

You can also use stdin for piping.

<pre>
  $ cat input.txt | mustang -t template.mustache -f json
  &lt;div&gt;1: Hello, World&lt;/div&gt;
  &lt;div&gt;2: Apple, Orange, and Banana&lt;/div&gt;
  &lt;div&gt;3: Thank you!&lt;/div&gt;  
</pre>

Adding '-o' option, mustang output is saved to specified file.

<pre>
  $ mustang -t template.mustache -i input.csv -o output.html
  $ cat output.html
  &lt;div&gt;1: Hello, World&lt;/div&gt;
  &lt;div&gt;2: Apple, Orange, and Banana&lt;/div&gt;
  &lt;div&gt;3: Thank you!&lt;/div&gt;  
</pre>

If you want to output multiple files from each input records, add '-m' option and set output directory path in '-o' option.

<pre>
  $ cat template.mustache
  &lt;div&gt;{{NO}}: {{TITLE}}&lt;/div&gt;

  $ mkdir output
  $ mustang -t template.mustache -i input.csv -o output -m
  $ ls output
  output-1.html output-2.html output-3.html

  $ cat output/output-1.html
  &lt;div&gt;1: Hello, World&lt;/div&gt;
</pre>

By using "-u" option, mustang downloads the content directly from specified URL and use it as input source.

<pre>
  $ mustang -t template.mustache -u "https://webservice.example.org/search?q=London" -f json
</pre>

Also mustang can connnect to database and query records from database table/collection.
Currently MySQL and MongoDB is supported for database.

Following example shows how to fetch all records in "emp" table in MySQL database.

<pre>
  $ mustang -t template.mustache -d mysql://user:pass@hostname/database -c emp
</pre>

You can directly pass a SQL to fetch records by "-q" option.

<pre>
  $ mustang -t template.mustache -d mysql://user:pass@hostname/database -q 'SELECT * FROM emp WHERE deptno = 1234'
</pre>

Following example shows how to fetch all records in "users" collection in MongoDB.

<pre>
  $ mustang -t template.mustache -d mongodb://user:pass@hostname/database -c users
</pre>

You can also set URL-style query string in "-q" option to specify both querying collection and filter.

<pre>
  $ mustang -t template.mustache -d mongodb://user:pass@hostname/database -q 'users?type=internal&owner.name=john'
</pre>


## Change History

v0.1.1 (May 19, 2013):

* Added support for MongoDB data source

v0.1.0 (May 19, 2013):

* Initial Release

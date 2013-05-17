/**
 *
 */
var csv = require('csv');

module.exports.parse = function(str, callback) {
  var header, records = [];
  csv().from(str)
       .transform(function(data) {
         if (!header) {
           header = data;
           return;
         }
         var record = {};
         for (var i=0, len=header.length; i<len; i++) {
           record[header[i]] = data[i];
         }
         return record;
       })
       .on('record', function(record) {
         records.push(record);
       })
       .on('end', function() {
         callback(null, records);
       })
       .on('error', function(err) {
         callback(err);
       });
};
#!/usr/bin/env node
var stat = require('node-static'),
    path = require('path'),
    http = require('http'),
    pakg = require('../package.json');

var opts = {
  'serverInfo': 'burnchart/' + pakg.version
};

var dir = path.resolve(__dirname, '../public');

var file = new stat.Server(dir, opts);

var server = http.createServer(function(req, res) {
  req.addListener('end', function() {
    file.serve(req, res);
  }).resume();
}).listen(process.argv[2]);

server.on('listening', function() {
  var addr = server.address();
  console.log('burnchart/' + pakg.version + ' started on http://' + addr.address + ':' + addr.port);
});
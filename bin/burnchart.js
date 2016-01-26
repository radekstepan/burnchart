#!/usr/bin/env node
var Args = require('argparse').ArgumentParser,
    clrs = require('colors/safe'),
    stat = require('node-static'),
    path = require('path'),
    http = require('http'),
    exec = require('child_process').exec,
    pakg = require('../package.json'),
    fs   = require('fs');

var parser = new Args({
  version: pakg.version
});

parser.addArgument(
  [ '-p', '--port' ],
  {
    'help': 'Specify port number to start app on',
    'defaultValue': 8080,
    'type': 'int'
  }
);
parser.addArgument(
  [ '-d', '--dev' ],
  {
    'help': 'Development mode, unminified builds are served',
    'nargs': 0
  }
);

var args = parser.parseArgs();

var opts = {
  'serverInfo': 'burnchart/' + pakg.version
};

var dir = path.resolve(__dirname, '../');

var pub = new stat.Server(dir, opts);

// Be ready to serve unminified builds.
var index = fs.readFileSync(dir + '/index.html', 'utf8');
index = index.replace(/bundle\.min/gm, 'bundle');

var server = http.createServer(function(req, res) {
  req.addListener('end', function() {
    // Serve a custom index file in dev mode.
    if (args.dev && req.url == '/') {
      res.writeHead(200, {
        'Content-Length': index.length,
        'Content-Type': 'text/html'
      });
      res.end(index);
    } else {
      pub.serve(req, res);
    }
  }).resume();
}).listen(args.port);

server.on('listening', function() {
  var addr = server.address();
  var dev = args.dev ? ' (' + clrs.yellow.bold('dev') + ')' : '';
  console.log('burnchart/' + pakg.version + dev + ' started on port ' + addr.port);
});

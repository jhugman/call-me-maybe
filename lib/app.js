'use strict';
var express = require('express'),
    path = require('path');

var config = require('build-facets')(path.join(__dirname, '..'))
          .loadRules('./config/server-facets.js')
          .loadConfiguration('./config/build-config.js')
          .loadConfiguration('./config/deploy-config.js')
          //.loadConfigurationFromProperty('namespace-specific')
          ;

var bodyParser = require('body-parser'),
    jsonParser = bodyParser.json();

var clientDir = config.resolve('project-dir', 'dist-relative');

var app = express();

app.get('/dial', function (req, res) {
  res.sendFile(path.join(clientDir , 'dial.html'));
});


app.post('/call-me-maybe', jsonParser, function (req, res) {
  var callObject = req.body;


});

app.post('/pickup', function (req, res) {});

var serverPort = config.get('server-port'),
    bindAddress = config.get('bind-address');

app.listen(serverPort,
  bindAddress,
  function() {
    var address = bindAddress + ':' + serverPort;
    console.log('Running on ' + address);
    console.log('Try on ' + address + '/dial');
  }
);

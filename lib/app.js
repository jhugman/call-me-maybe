'use strict';
var express = require('express');

var config = require('build-facets')(__dirname + '/../config')
          .loadRules('./server-configs.js')
          .loadConfiguration('./deploy-config.js');

var app = express();

app.get('/dial', function (req, res) {});


app.get('/call-me-maybe', function (req, res) {});

var serverPort = config.get('server-port'),
    bindAddress = config.get('bind-address');

app.listen(serverPort,
  bindAddress,
  function() {
    console.log("Running on " + bindAddress + ":" + serverPort);
  }
);

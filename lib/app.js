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


var clientDir = config.resolve('project-dir', 'dist-relative') + '/views',
    assetsDir = config.resolve('project-dir', 'dist-relative', 'assets-relative');

var app = express();



app.use('/a', express.static(assetsDir));
app.use('*/a', express.static(assetsDir));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var theServer = require('./app-server').create(app, config),
    callRouter = require('./server-router')(config, theServer.connector);


app.get('/dial', function (req, res) {
  res.sendFile(path.join(clientDir , 'dial.html'));
});

app.get('/:calleeId', function (req, res) {
  // we should do an OAuth dance here to get the callerId

  console.log('CalleeId: ' + req.params.calleeId);

  res.sendFile(path.join(clientDir , 'dial.html'));

});

app.post('/call-me-maybe', function (req, res) {
  // This will be coming from a server, 
  // or from a dial page.

  // If this is from a server, we should probably 
  // verify the signatures/certificates of the server.

  // If we do this over and above https then we should do it here/soon.
  var callObject = req.body,
      claims = callObject.claims;

  // yuk.
  if (claims) {
    callObject.claims = JSON.parse(claims);
  }

  if (!callObject.calleeId || !callObject.callerId) {
    res.statusCode = 404;
    res.write("INCOMPLETE body");
    return;
  }

  var responseData = {};
  callRouter(callObject, function (err) {

    res.statusCode = 200;
    if (err) {
      responseData.error = err;
    } else {
      responseData.sucess = true;
    }

    res.write(JSON.stringify(responseData));
  });

});

app.post('/pickup', function (req, res) {

});

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

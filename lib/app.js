'use strict';
var express = require('express'),
    path = require('path'),
    _ = require('lodash');



/*********************************************************************/
  // Load a bunch of configuration.
/*********************************************************************/

var config = require('build-facets')(path.join(__dirname, '..'))
          .loadRules('./config/server-facets.js')
          .loadConfiguration('./config/build-config.js')
          .loadConfiguration('./config/deploy-config.js')
          //.loadConfigurationFromProperty('namespace-specific')
          ;

config = config.loadConfiguration(config.resolve('namespace-dir', 'basic-info'));

var clientDir = config.resolve('project-dir', 'dist-relative') + '/views',
    assetsDir = config.resolve('project-dir', 'dist-relative', 'assets-relative');


/*********************************************************************/
  // A renderer creator, to make using templates easier.
/*********************************************************************/

var rendererer = function (templateFile) {
  var file = path.join(clientDir , templateFile),
      fs = require('fs'),
      template;

  var defaults = {
    calleeId: null,
    callerId: null,
    config: config,
  };

  function loadTemplate () {
    try {
      var string = fs.readFileSync(file);
      return _.template(string);
    } catch (e) {
      console.error(e.message, e);
      return undefined;
    }
  }

  template = loadTemplate();
  
  return function (object) {
    object = object || {};
    object = _.defaults(object, defaults);
    template = template || loadTemplate();
    if (template) {
      return template(object);
    }
  };
};

/*********************************************************************/
// Configure express, and create an app object.
/*********************************************************************/
var app = express(),
    bodyParser = require('body-parser'),
    jsonParser = bodyParser.json();

var httpServer = require('http').Server(app);
app.__httpServer = httpServer;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// Add an assets directory.

app.use('/a', express.static(assetsDir));
app.use('*/a', express.static(assetsDir));


/*********************************************************************/
  // Hook up the server specific endpoints and device connectors.
/*********************************************************************/
var AppServer = require(config.resolve('namespace-dir', 'appModule'));

var theServer = AppServer.create(app, config, rendererer),
    callRouter = require('./server-router')(config, theServer.connector.bind(theServer));



/*********************************************************************/
  // Some things we're going to need in the endpoints.
/*********************************************************************/

var dialPage = rendererer('dial.html');




/*********************************************************************/
 // The endpoints themselves.
/*********************************************************************/


app.get('/dial', function (req, res) {
  res.send(dialPage({}));
});


app.get('/call-me-maybe/:calleeId', function (req, res) {
  // we should do an OAuth dance here to get the callerId
  res.send(dialPage({calleeId: req.params.calleeId}));
});

app.get('/call-me-maybe/', function (req, res) {
  // we should do an OAuth dance here to get the callerId
  res.send(dialPage());
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

app.post('/test', function (req, res) {
  res.sendFile(clientDir + '/shareable.html');
});


/*********************************************************************/
 // Start listening.
/*********************************************************************/
var serverPort = config.get('server-port'),
    bindAddress = config.get('bind-address');

httpServer.listen(serverPort,
  bindAddress,
  function() {
    var address = bindAddress + ':' + serverPort;
    console.log('Running ' + config.get('title') + ' on ' + address + ' as ' + config.get('domain'));
    console.log('Try on ' + address + '/dial');
  }
);

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
          .loadConfiguration('./config/deploy-config.js');

config = config.loadConfiguration(config.resolve('namespace-dir', 'basic-info'));
// XXX. something.
var ns = 'namespace';
var platformCode = config.buildVariant[ns];
var distDir = path.resolve(config.resolve('project-dir', 'dist-relative'), platformCode),
    assetsDir = path.join(distDir, config.get('assets-relative')),
    clientDir = path.join(__dirname, '..', 'views');

var serverPort = process.env.PORT || config.get('server-port'),
    bindAddress = config.get('bind-address'),
    sessionHost = config.get('session-host');

if (!sessionHost) {
  sessionHost = bindAddress + ':' + serverPort;
}



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

app.use(require('cors')({ 
  origin: true, 
  credentials: true,
}));

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

/*********************************************************************/
 // This the API.
/*********************************************************************/


app.post('/call-me-maybe', function (req, res) {
  // This will be coming from a server, 
  // or from a dial page.

  // If this is from a server, we should probably 
  // verify the signatures/certificates of the server.

  // If we do this over and above https then we should do it here/soon.
  var callObject = req.body,
      claims = callObject.claims;

  res.type('application/json');

  // yuk.
  if (claims) {
    callObject.claims = JSON.parse(claims);
  }

  console.log('Calling from: ' + JSON.stringify(callObject));

  if (!callObject.calleeId || !callObject.callerId) {
    res.statusCode = 404;
    res.write("INCOMPLETE body");
    return;
  }

  var responseData = {};
  callRouter(callObject, function (err, data) {
    if (err) {
      responseData.error = err;
    } else {
      responseData.data = data;
    }
    console.log('Routing reply: ' + JSON.stringify(responseData));
    
    res.status(200).write(JSON.stringify(responseData));
  });

});



var pickupEndpoint = '/pickup';


function findCalleeToken (callObject) {
  // TODO: we should generate this on demand, based on caller or callee.
  return config.get('opentok-token-callee');
}

function findApiToken () {
  return config.get('opentok-api-token');
}

function pickupResponse (req, res, callObject) {
  var data = {
    token: findCalleeToken(callObject),
    apiToken: findApiToken() + '',
  };
  callObject.token = findCalleeToken(callObject);
  callObject.apiToken = findApiToken() + '';


  if (false && req.accepts('text/html')) {
  } else {
    // post json.
    res.type('application/json');
    console.log('pickupResponse: ' + JSON.stringify(data));
    res.status(200).send(JSON.stringify(data));
  }
}

app.post(pickupEndpoint, function (req, res) {
  pickupResponse(req, res, req.body);
});

app.get(pickupEndpoint + '/:sessionId/:calleeId', function (req, res) {
  var p = req.params,
      data = {
    sessionId: p.sessionId,
    calleeId: p.calleeId
  };
  pickupResponse(req, res, data);
});


/*********************************************************************/
 // This is called by callers, to get the session id, token id and pickup url.
/*********************************************************************/

app.post('/createSession', function (req, res) {
  var data = {};

  // this should take all the tokens, identifiers, secrets
  // to show that this client is logged in.
  var callToken = req.body;


  data.apiToken = config.get('opentok-api-token');
  data.sessionId = config.get('opentok-session');
  data.token = config.get('opentok-token-caller');

  data.sessionHost = sessionHost + pickupEndpoint;

  // we may want to pass back something which will allow us to vouch for 
  // the caller later on.

  res.type('application/json');
  res.status(200).send(JSON.stringify(data));
});


app.get('/test', function (req, res) {
  res.sendFile(clientDir + '/shareable.html');
});



/*********************************************************************/
 // Start listening.
/*********************************************************************/


httpServer.listen(serverPort,
  //bindAddress,
  function() {
    var address = bindAddress + ':' + serverPort;
    console.log('Running ' + config.get('title') + ' on ' + address + ' as ' + config.get('domain'));
    console.log('Try on ' + sessionHost + '/extension');
  }
);

'use strict';

var _ = require('lodash'),
    connUtils = require('../../lib/connection-utils');

function Server (app, config, rendererer) {
  this._app = app;
  this._config = config;

  this._extensionTemplate = rendererer('extension.html');

  this._registerTemplate = rendererer('register.html');
  
  this._connections = {};
}

_.extend(Server.prototype, {

  configure: function () {
    var app = this._app,
        template = this._extensionTemplate,
        self = this;

    // XXX double yuck.
    var http = app.__httpServer;
    var io = require('socket.io').listen(http);
    this._io = io;
    /*********************************************************************/
      // Serve the page that will receive the call.
    /*********************************************************************/
    app.get('/extension', function (req, res) {
      // we should do an OAuth dance here to get the callerId
      res.send(template());
    });

    /*********************************************************************/
      // Endpoints for the extension.
    /*********************************************************************/
    app.post('/login', function (req, res) {
      console.log('extension/login');
      var data = req.body;
      res.status(200).send("LOGIN OK");
    });

    app.post('/logout', function (req, res) {
      console.log('extension/logout');
      var data = req.body;
      res.status(200).send("LOGIN OK");
    });

    /*********************************************************************/
      // C2DM stuff
    /*********************************************************************/

    function registerForC2DM (data, res) {
      if (!data.id || !data.calleeId) {
        res.status(400).send("You sent: " + JSON.stringify(data));
      }

      self._c2dmIds[data.calleeId] = data.id;
      
      res.status(200).send("LOGIN OK");      
    }

    app.post('/hello-android', function (req, res) {
      console.log('POST /hello-android');
      var data = req.body;
      registerForC2DM(data, res);
    });

    app.get('/hello-android/:calleeId/:id', function (req, res) {
      console.log('GET /hello-android');
      var data = {
        calleeId: req.params.calleeId,
        id: req.params.id,
      };
      registerForC2DM(data, res);
    });

    app.get('/hello-android/:calleeId/:id', function (req, res) {
      console.log('GET /hello-android');
      var data = {
        calleeId: req.params.calleeId,
        id: req.params.id,
      };
      registerForC2DM(data, res);
    });


    var C2DM = require('c2dm').C2DM;
    this._c2dm = new C2DM({
      token: this._config.get('c2dm-auth')
    });

    this._c2dmIds = {};


    /*********************************************************************/
      // Web sockets stuff
    /*********************************************************************/
  
    // XXX Hacky as anything
    var sockets = {};

    io.on('connection', function(socket){

      var calleeId, counterId;
      var pingStart, pingEnd;

      sockets[socket.id] = socket;

      function startPing () {
        if (counterId) {
          clearInterval(counterId);
        }
        counterId = setInterval(function () {
          pingStart = Date.now();

          if (calleeId && socket.id !== self._connections[calleeId]) {
            clearInterval(counterId);
            socket.disconnect();
            return;
          }

          socket.emit('ping');

        }, 10 * 1000);
      }

      socket.on('listening_for_calls', function (calleeObject) {
        calleeId = calleeObject.calleeId;

        var existing = self._connections[calleeId];
        self._connections[calleeId] = socket.id;

        if (existing && existing !== socket.id) {
          sockets[existing].disconnect();
        }

        if (!existing) {
          console.log('Available for calls  :  ' + calleeId);
          startPing();
        }

      });

      socket.on('disconnect', function(){
        var id = socket.id;
        if (id === self._connections[calleeId]) {
          console.log('Unavailable for calls  :' + calleeId);
          counterId = null;
          delete self._connections[calleeId];
          calleeId = null;
        }
        clearInterval(counterId);
        delete sockets[id];
      });

      socket.on('pong', function(){
        pingEnd = Date.now();
        console.log('ping ' + calleeId + ' takes ' + (pingEnd - pingStart) + 'ms');
      }); 
    });

  },



  connector: function (device, callObject, recommendation, reply) {
    var connections = {
      'connect': Server.prototype._connectByWebSocket.bind(this)
    };

    connUtils.connect(device, connections, callObject, recommendation, reply);
  },

  _connectByWebSocket: function (callObject, reply) {
    
    var socketId = this._connections[callObject.calleeId];
    console.log('Connecting by websocket ' + socketId + ' ' + JSON.stringify(callObject));
    if (socketId) {

      this._io.to(socketId).emit('incoming_call', callObject);
      reply(null, 'CONNECTING');
      return;
    }
    reply('NOT_LOGGED_IN');
  },

  _connectByC2DM: function (device, callObject, recommendation, reply) {
    var message = {
      registration_id: '',
      collapse_key: 'Collapse key', // required
      'data.key1': 'value1',
      'data.key2': 'value2',
      delay_while_idle: '1' // remove if not needed
    };

    this._c2dm.send(message, function(err, messageId){
      if (err) {
        console.log("Something has gone wrong!");
      } else {
        console.log("Sent with message ID: ", messageId);
      }
    });
  }


});



module.exports = {
  
  create: function (app, config, rendererer) {
    var server = new Server(app, config, rendererer);
    server.configure();
    return server;
  },


};
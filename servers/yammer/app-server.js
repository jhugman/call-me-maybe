'use strict';

var _ = require('lodash'),
    connUtils = require('../../lib/connection-utils');

function Server (app, config, rendererer) {
  this._app = app;
  this._config = config;

  this._extensionTemplate = rendererer('extension.html');


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
      console.log('extension/login');
      var data = req.body;
      res.status(200).send("LOGIN OK");
    });

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
        counterId = setInterval(function () {
          pingStart = Date.now();
          socket.emit('ping');
        }, 10 * 1000);
      }

      socket.on('listening_for_calls', function (calleeObject) {
        calleeId = calleeObject.calleeId;
        console.log('Available for calls  :  ' + calleeId);

        var existing = self._connections[calleeId];

        if (existing) {
          sockets[existing].disconnect();
        }

        self._connections[calleeId] = socket.id;
        startPing();
      });

      socket.on('disconnect', function(){
        var id = socket.id;
        clearInterval(counterId);
        console.log('Unavailable for calls  :' + calleeId);
        delete self._connections[calleeId];
        delete sockets[id];
        calleeId = null;
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
    reply('not logged in');
  }

});



module.exports = {
  
  create: function (app, config, rendererer) {
    var server = new Server(app, config, rendererer);
    server.configure();
    return server;
  },


};
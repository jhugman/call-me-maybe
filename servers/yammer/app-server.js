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
  

    io.on('connection', function(socket){

      socket.on('listening_for_calls', function (calleeObject) {
        console.log('Available for connections  : ' + calleeObject.calleeId);
        self._connections[calleeObject.calleeId] = socket.id;
      });

      socket.on('disconnect', function(){
        var id = socket.id;
        _.each(self._connections, function (i, key) {
          console.log('Unavailable for connections: ' + key);
          if (id === self._connections[key]) {
            delete self._connections[key];
          }
        });
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
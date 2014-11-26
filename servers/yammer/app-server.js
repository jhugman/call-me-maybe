'use strict';

var _ = require('lodash'),
    connUtils = require('../../lib/connection-utils');

function Server (app, config) {
  this._app = app;
  this._config = config;
}

_.extend(Server.prototype, {

  configure: function () {
    var app = this._app;
  },

  connector: function (device, callObject, recommendation, reply) {
    var connections = {
      'connect': Server.prototype._connectByWebSocket.bind(this)
    };

    connUtils.connect(device, connections, callObject, recommendation, reply);
  },

  _connectByWebSocket: function (callObject, reply) {
    reply('not logged in');
  }

});



module.exports = {
  
  create: function (app, config) {
    var server = new Server(app, config);
    server.configure();
    return server;
  },


};
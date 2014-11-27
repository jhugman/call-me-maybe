'use strict';

var _ = require('lodash'),
    connUtils = require('../../lib/connection-utils');

function Server (app, config, rendererer) {
  this._app = app;
  this._config = config;
}

_.extend(Server.prototype, {

  configure: function () {
    var app = this._app;
  },

  connector: function (device, callObject, recommendation, reply) {
    var connections = {
      'connect': Server.prototype._connectByGCM.bind(this),
      'voicemail': Server.prototype._connectByVoicemail.bind(this),
      'text': Server.prototype._connectByChat.bind(this),
    };

    connUtils.connect(device, connections, callObject, recommendation, reply);
  },

  _connectByGCM: function (callObject, reply) {
    reply(undefined, 'CONNECT_BY_GCM');
  },

  _connectByVoicemail: function (callObject, reply) {
    reply(undefined, 'CONNECT_BY_VOICEMAIL');
  },

  _connectByChat: function (callObject, reply) {
    reply(undefined, 'CONNECT_BY_VOICEMAIL');
  },




});



module.exports = {
  
  create: function (app, config) {
    var server = new Server(app, config);
    server.configure();
    return server;
  },


};
'use strict';

var _ = require('lodash');

function Server (app, config) {
  this._app = app;
  this._config = config;
}

_.extend(Server.prototype, {

  configure: function () {
    var app = this._app;
  },

  connector: function (device, callObject, recommendation, reply) {
    console.log("We're connecting");
    reply(undefined, "CONNECTING:" + device);
  }

});



module.exports = {
  
  create: function (app, config) {
    var server = new Server(app, config);
    server.configure();
    return server;
  },


};
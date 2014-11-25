'use strict';

var router = require('./call-router');

var url = require('url');



module.exports = function (config) {

  var namespace = config.resolve('namespace-config'),
      ns = require(namespace);

  var serverPort = config.get('server-port'),
    bindAddress = config.get('bind-address');
  var hostname = url.format({
    hostname: bindAddress,
    port: serverPort,
    slashes:false
  }).substring(2);

  router.options = {
    hostname: hostname,

    domains: require('../config/domain-mappings'),

    forwards: ns.forwards,

    routeInternally: function (callObject, options, forward, next) {
      
      // Look at our internal rules

      // Find the set of devices that are suitable for connecting these two. 

      // Find the devices that are available right now.

      // Call when we get a connection
      // next(error, result)
    },

  };

  return router;
};
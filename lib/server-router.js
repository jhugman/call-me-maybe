'use strict';

var router = require('./call-router');

var url = require('url'),
    path = require('path');



module.exports = function (config, connector) {

  var dataFile = config.resolve('namespace-dir', 'dataModule'),
      nsData = require(dataFile),
      
      nsRouteInternally = require('./routing-rules');

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

    data: nsData,

    connectCall: connector,

    routeInternally: nsRouteInternally,

  };

  return router;
};
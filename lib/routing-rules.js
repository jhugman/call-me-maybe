var dsl = require('./rules-dsl');

var _ = require('lodash');


module.exports = function (internalCallObject, callObject, options, reply) {
  console.log('Routing via ' + options.hostname + ' rules');
  // Look at our internal rules

  var callerId = internalCallObject.callerId;

  // TODO: what do we do if we haven't got an internal callerId?

  // Find the set of devices that are suitable for connecting these two. 
  var connectionRecommendation = dsl.theyCanCallMe(options.data, callerId, internalCallObject.calleeId, callObject);

  var clone = _.clone(callObject);
  var claims = clone.claims;
  if (!claims) {
    clone.claims = claims = {};
  }

  // We should probably consider signing this somehow.
  claims[options.hostname] = connectionRecommendation;

  console.dir(clone);

  function connectDevice (device, fn) {
    if (connectionRecommendation.devices.indexOf(device) >= 0) {
      return fn();
    }
  }

  function forward() {
    var isForwarding = connectDevice('forward', function () {
      var address = dsl.forwardingAddress(options.data, internalCallObject.calleeId);

      if (!address) {
        return false;
      }

      clone.calleeId = address;
      options.routeNext(clone, options, reply);
    });

    if (!isForwarding) {
      reply('UNABLE_TO_ATTEND');
    }
  }

  var devices = connectionRecommendation.devices;
  function tryThis(index) {
    index = index || 0;
    if (index >= devices.length) {
      forward();
      return;
    }
    options.connectCall(devices[index], callObject, connectionRecommendation, function (err, data) {
      if (err) {
        tryThis(index + 1);
      } else {
        // Call when we get a connection
        // reply(error, result)
        console.log('routing-rules.js: ' + data + ' with ' + devices[index]);
        reply(undefined, data);
      }
    });
  }

  if (!options.connectCall) {
    console.log('No call connector');
    forward();
  } else {
    
    // Find the devices that are available right now.
    tryThis(0);
  }
  

  
};


var dsl = require('../../lib/rules-dsl');

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

      // TODO add some record of this call object being routed by us.

      clone.calleeId = address;
      options.routeNext(clone, options, reply);
    });

    if (!isForwarding) {
      reply('UNABLE_TO_ATTEND');
    }
  }

  _.each(connectionRecommendation.devices, function (device) {});


  if (!options.connectCall) {
      console.log('No call connector');
      forward();
  } else {
    var devices = connectionRecommendation.devices;
    function tryThis(index) {
      if (index >= devices.length) {
        forward();
        return;
      }
      options.connectCall(devices[index], callObject, connectionRecommendation, function (err, data) {
        if (err) {
          tryThis(index + 1);
        } else {
          reply(err, data);
        }
      });
    }
    tryThis(0);
    
  }








  // Find the devices that are available right now.

  // Call when we get a connection
  // reply(error, result)
}
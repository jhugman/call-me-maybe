'use strict';

var url = require('url'),
    _ = require('lodash'),
    postObject = require('./api-utils').post;

function urlPart (id, part) {
  if (id.indexOf(':') < 0) {
    id = 'irrelevant://' + id;
  }
  return url.parse(id)[part];
}

function getHost (id) {
  return urlPart(id, 'host');
}


function routeNext (callObject, options, reply, useSender) {

  var clone = _.clone(callObject);
  // yuk.
  clone.claims = JSON.stringify(callObject.claims);

  var serverPath = '/call-me-maybe',
      callType = 'ROUTING';

  postObject(callType, serverPath, callObject, clone, options, reply, useSender);
}

function isThisOurNamespace (id, options) {
  var receiverDomain = getHost(id),
      actualDomain = options.domains[receiverDomain] || receiverDomain;
  return (actualDomain === options.hostname);
}

function route (callObject, options, reply) {

  // callerId, calleeId, sessionId, sessionHost

  if (typeof options === 'function' && !reply) {
    reply = options;
    options = route.options;
  }

  if (!options.routeNext) {
    options.routeNext = routeNext;
  }

  var isServer = !!options.hostname,
      isCalleeServer = false;
  if (isServer) {
    
    isCalleeServer = isThisOurNamespace(callObject.calleeId, options);
    if (isCalleeServer && options.routeInternally) {
      var internalCallObject = {
        calleeId: urlPart(callObject.calleeId, 'auth'),
      };

      if (isThisOurNamespace(callObject.callerId, options)) {
        internalCallObject.callerId = urlPart(callObject.callerId, 'auth');
      }

      options.routeInternally(internalCallObject, callObject, options, reply);
    }

    if (!isCalleeServer) {
      if (isThisOurNamespace(callObject.callerId, options)) {
        callObject = _.clone(callObject);
        var claims = callObject.claims;
        if (!claims) {
          // we should probably make a comment that we recognize you.
          claims = callObject.claims = {};
        }
      }
      return options.routeNext(callObject, options, reply);
    }
  } else {
    options.routeNext(callObject, options, reply, true);
  }
}

// clients of this module should set domains accordingly.
// In a server side context, this would be require('domain-aliases');
route.options = {
  domains: require('../config/domain-mappings'),
  routeNext: routeNext,

};

module.exports = route;
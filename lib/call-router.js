'use strict';

var http = require('http'),
    url = require('url'),
    _ = require('lodash');

function routeNext (callObject, options, next, useSender) {
  var nextRouter = useSender ? callObject.callerId : callObject.calleeId,
      literalDomain = url.parse(nextRouter).hostname,
      actualDomain = options.domains[literalDomain] || literalDomain;

  var httpOptions = {
    hostname: actualDomain,
    path: '/call-me-maybe',
    method: 'POST'
  };

  var req = http.request(httpOptions, function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      // console.log('BODY: ' + chunk);
      next(undefined, chunk);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  // req.write('data\n');
  // req.write('data\n');
  req.end();
}

function forwardMaybe(callObject, options, next) {
  var callee = url.parse(callObject.calleeId),
      clone = _.clone(callObject);

  if (options.forwards) {
    var fowardId = options.forwards[callee.auth];
    clone.calleeId = fowardId;
    options.routeNext(clone, options, next);
  }
}

function route (callObject, options, next) {

  // callerId, calleeId, sessionId, sessionHost

  if (typeof options === 'function' && !next) {
    next = options;
    options = route.options;
  }

  var isServer = !!options.hostname,
      isThisServer = false;
  if (isServer) {
    var callee = url.parse(callObject.calleeId),
        receiverDomain = callee.hostname,
        actualDomain = options.domains[receiverDomain] || receiverDomain;
    isThisServer = (actualDomain === options.options.hostname);
  
    if (isThisServer && options.routeInternally) {
      options.routeInternally(callObject, options, forwardMaybe, next);
    }

    if (!isThisServer) {
      return forwardMaybe(callObject, options, next);
    }
  } else {
    options.routeNext(callObject, options, next);
  }
}

// clients of this module should set domains accordingly.
// In a server side context, this would be require('domain-aliases');
route.options = {
  domains: {},
  routeNext: routeNext,
};

module.exports = route;
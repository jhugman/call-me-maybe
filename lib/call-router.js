'use strict';

var http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    _ = require('lodash');

function urlPart (id, part) {
  if (id.indexOf(':') < 0) {
    id = 'irrelevant://' + id;
  }
  return url.parse(id)[part];
}

function getHost (id) {
  return urlPart(id, 'host');
}

function routeNext (callObject, options, next, useSender) {
  var nextRouter = useSender ? callObject.callerId : callObject.calleeId,
      literalDomain = getHost(nextRouter),
      actualDomain = options.domains[literalDomain] || literalDomain;

  if (actualDomain.indexOf(':/') < 0) {
    actualDomain = 'http://' + actualDomain; // this should be https
  }

  var clone = _.clone(callObject);
  // yuk.
  clone.claims = JSON.stringify(callObject.claims);

  var urlObject = url.parse(actualDomain),
      postData = querystring.stringify(clone);
  var httpOptions = {
    path: '/call-me-maybe',
    method: 'POST',
    hostname: urlObject.hostname,
    port: urlObject.port,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };
  

  var req = http.request(httpOptions, function(res) {
    console.log(literalDomain + ': receving data');
    if (res.statusCode > 300) {
      next('ROUTING_PROBLEM: ' + nextRouter + ' (at ' + actualDomain + ') returns ' + res.statusCode);
      return;
    }
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      next(undefined, chunk);
    });
  });

  req.on('error', function(e) {
    next(e.message);
  });

  // write data to request body
  console.log(literalDomain + ': sending data ' + postData);
  req.write(postData);
  req.end();
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
  domains: {},
  routeNext: routeNext,
};

module.exports = route;
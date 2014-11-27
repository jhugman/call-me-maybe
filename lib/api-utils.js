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

function postDirect (callType, actualDomain, serverPath, data, reply) {
  if (actualDomain.indexOf(':/') < 0) {
    actualDomain = 'http://' + actualDomain; // this should be https
  }
  var urlObject = url.parse(actualDomain),
      postData = querystring.stringify(data);
  var httpOptions = {
    path: serverPath || urlObject.path,
    method: 'POST',
    hostname: urlObject.hostname,
    port: urlObject.port,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var req = http.request(httpOptions, function(res) {
    
    if (res.statusCode > 300) {
      reply(callType + '_PROBLEM: ' + actualDomain + ' returns ' + res.statusCode);
      return;
    }
    if (res.setEncoding) {
      res.setEncoding('utf8');
    }
    res.on('data', function (chunk) {
      reply(undefined, chunk);
    });
  });

  req.on('error', function(e) {
    reply(e.message);
  });

  // write data to request body
  req.write(postData);
  req.end();
}


function postObject (callType, serverPath, callObject, data, options, reply, useSender) {
  
  var nextRouter = useSender ? callObject.callerId : callObject.calleeId,
      literalDomain = getHost(nextRouter),
      actualDomain = options.domains[literalDomain] || literalDomain;

  postDirect(callType, actualDomain, serverPath, data, reply);

}

module.exports = {
  post: postObject,
  postDirect: postDirect
};
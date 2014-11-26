var test = require('tap').test;

var route = require('../lib/call-router');


// This is client routing to server side routing.
route.options.domains = require('../config/domain-mappings');

test('Basic routing to same network', function (t) {
  route({
    calleeId: 'bwalker@yammer.com',
    callerId: 'jhugman@yammer.com',
    sessionId: 'ABCDEF',
    sessionHost: 'http://yammer.com/webrtc/ABCDEF'
  }, function (err, data) {
    if (err) {
      console.log('Error: ' + err);
    }
    t.notOk(err);
    t.end();  
  });
});
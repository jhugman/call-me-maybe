var test = require('tap').test;

var route = require('../lib/call-router');


// This is client routing to server side routing.
route.options.domains = require('../config/domain-mappings');

test('Basic routing to same network', function (t) {
  route({
    calleeId: 'bwalker@mozilla.com',
    callerId: 'jhugman@mozilla.com',
    sessionId: 'ABCDEF',
    sessionHost: 'http://mozilla.com/webrtc/ABCDEF'
  }, function (err, data) {
    if (err) {
      console.log('Error: ' + err);
    }
    t.notOk(err);
    t.end();  
  });
});
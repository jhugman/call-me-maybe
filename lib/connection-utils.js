'use strict';

module.exports = {
  connect: function (device, connections, callObject, recommendation, reply) {
    var fn = connections[device];
    if (fn) {
      fn(callObject, reply);
    } else if (device === 'forward') {
      reply('FORWARDING');
    } else {
      reply('CONNECTION_NOT_SUPPORTED');
    }
  }
};
'use strict';

module.exports = {
  connect: function (device, connections, callObject, recommendation, reply) {
    var fn = connections[device];
    if (fn) {
      fn(callObject, reply);
    } else {
      reply('CONNECTION_NOT_SUPPORTED');
    }
  }
};
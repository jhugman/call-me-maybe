'use strict';

var _ = require('lodash'),
    io = require('socket.io-client'),
    apiUtils = require('../../lib/api-utils'),
    router = require('../../lib/call-router');

var options = router.options;

function Controller ($native) {
  if ($native) {
    this.onLoad($native);
  }
}

_.extend(Controller.prototype, {

  onLoad: function ($native) {
    this.$native = $native;
  },

  _createWebSocket: function () {
    var self = this, 
        socket = this._socket = io();

    socket.on('connect', function (){
      console.log('connecting');
    });
    socket.on('incoming_call', function (callObject){
      console.log('callEvent: ' + JSON.stringify(callObject));
      self.$native.displayCallAlert(callObject);
    });
    socket.on('disconnect', function (){
      console.log('disconnecting');
    });

  },


  login: function login (form, reply) {
    var self = this;
    apiUtils.post('LOGIN', '/login', form, form, options, function () {
      self._createWebSocket();
      self._socket.emit('listening_for_calls', { calleeId: form.calleeId });
      reply.apply(null, arguments);
    }, false);
  },

  requestCall: function (callObject, reply) {
    router(callObject, reply);
  },
});


module.exports = Controller;
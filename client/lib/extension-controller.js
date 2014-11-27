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

  _createWebSocket: function (calleeId) {
    var self = this, 
        socket = this._socket = io();

    socket.on('connect', function (){
      console.log('connecting');
      socket.emit('listening_for_calls', {calleeId: calleeId});
    });
    socket.on('incoming_call', function (callObject){
      console.log('callEvent: ' + JSON.stringify(callObject));
      self.$native.displayCallAlert(callObject);
    });
    socket.on('ping', function (){
      socket.emit('pong');
    });
    socket.on('disconnect', function (){
      console.log('disconnecting');
      self._createWebSocket(calleeId);
    });
  },


  login: function login (form, reply) {
    var self = this;
    apiUtils.post('LOGIN', '/login', form, form, options, function () {
      self._createWebSocket(form.calleeId);
      reply.apply(null, arguments);
    }, false);
  },

  requestCall: function (callObject, reply) {
    router(callObject, reply);
  },
});


module.exports = Controller;
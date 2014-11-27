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
    this._numConnections = 0;
  },

  _createWebSocket: function (calleeId) {
    var self = this, 
        socket = this._socket = io();

    socket.on('connect', function () {
      console.log('connecting');
      self._numConnections++;
      socket.emit('listening_for_calls', {calleeId: calleeId});
    });
    socket.on('incoming_call', function (callObject) {
      console.log('callEvent: ' + JSON.stringify(callObject));
      self.$native.displayCallAlert(callObject);
    });
    socket.on('ping', function () {
      socket.emit('pong');
    });
    socket.on('disconnect', function () {
      console.log('disconnecting');
      self._numConnections--;
      setTimeout(function () {
        if (self._numConnections <= 0) {
          self._createWebSocket(calleeId);
        }
      }, 1000);
      
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

    var nextData;

    function callRouted (err, data) {
      if (err) {
        reply('UNABLE_TO_ATTEND', {detail: err});
        return;
      }
      console.log('CALL_ROUTED: ' + data);
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }

      reply(undefined, nextData);
    }

    function sessionCreated (err, data) {

      if (err) {
        reply('SESSION_CREATION_PROBLEM', {detail: err});
        return;
      }

      console.log('SESSION_INIT: ' + data);

      if (typeof data === 'string') {
        data = JSON.parse(data);
      }

      nextData = data;

      callObject.sessionHost = data.sessionHost;
      callObject.sessionId = data.sessionId;

      router(callObject, callRouted);
    }


    apiUtils.post('SESSION_INIT', '/createSession', callObject, callObject, options, sessionCreated, true);

  },

  acceptCall: function (callObject, reply) {
    var self = this;
    // (callType, actualDomain, serverPath, data, reply)
    apiUtils.postDirect('CALL_ACCEPT', callObject.sessionHost, null, callObject, function (err, data) {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      console.log('extension-controller.js: picked up OpenTok identifiers:');
      console.log(data);
      self.joinSession(+data.apiToken, callObject.sessionId, data.token);
    });
  },

  joinSession: function (apiToken, sessionId, token) {
    console.log('Joining OpenTok api:' + apiToken + ' sessionId: ' + sessionId + ' token: ' + token);

    var OT = (global || window).OT;
    OT.setLogLevel(OT.DEBUG);
    var session = OT.initSession(apiToken, sessionId);
    session.on("streamCreated", function (event) {
      session.subscribe(event.stream);
    });
    
    session.connect(token, function (error) {
      var publisher = OT.initPublisher();
      session.publish(publisher);
    });
  }
});


module.exports = Controller;
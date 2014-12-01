'use strict';

console.log('Running inside of entry.js');

var _ = require('lodash'),
    Controller = require('../extension-controller');

////////////////////////////////////////////
var state = (function () {
  var $el = document.querySelector('#state');
  return {
    start: function (clazz) {
      $el.classList.add(clazz);
    },
    end: function (clazz) {
      $el.classList.remove(clazz);
    },
    toggle: function (on, off) {
      var $cl = $el.classList;
      var _off = $cl.contains(off),
          _on = $cl.contains(on);
      if ((_on && !_off) || (!_on && _off)) {
        $cl.toggle(on);
        $cl.toggle(off);
      } else if (_on && _off) {
        // cl contains on and off
        $cl.toggle(on);
      } else {
        $cl.toggle(off);
      }
    }
  };
})();

////////////////////////////////////////////

var collectForm = function (parentSelector, childIds) {
  var data = {};

  var $el = document.querySelector(parentSelector);
  if (!$el) {
    return data;
  }

  for (var i=1, max=arguments.length; i < max; i++) {
    var id = arguments[i];
    var $input = $el.querySelector('#' + id);
    if ($input) {
      data[id] = $input.value;
    }
  }
  return data;
};


////////////////////////////////////////////
var extensionController;
var presentation = {
  displayCallAlert: function (callObject) {
    state.start('interruption-started');
    if (window.confirm(callObject.callerId + ' is calling. Pickup?')) {
      state.start('connected');
      extensionController.acceptCall(callObject, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      });
    }
  },
};

extensionController = new Controller(presentation);

var uiState = {};

////////////////////////////////////////////
var listeners = {
  'button#dial': function (e) {
    console.log('dial');
    var form = collectForm('#dialBox', 'calleeId');

    var calleeId = form.calleeId;
    if (calleeId.indexOf('@') < 0) {
      calleeId += '@' + form.domain;
    }

    var callObject = {
      calleeId: form.calleeId,
      callerId: uiState.username,
    };

    extensionController.requestCall(callObject, function (err, data) {
      console.log('Call request unsuccessful');
      if (!err) {
        console.log('Call request granted successfully');
        extensionController.joinSession(data.apiToken, data.sessionId, data.token);
      }
    });
  },

  'button#login': function (e) {
    console.log('login');
    var form = collectForm('#loginBox', 'callerId', 'password', 'domain');
    uiState.username = form.callerId;
    state.toggle('loggedOut', 'loggedIn');
  },

  'button#loginForWebsocket': function (e) {
    console.log('loginForWebsocket');
    var form = collectForm('#loginBox', 'calleeId', 'password', 'domain');
    var callObject = {
      calleeId: form.calleeId + '@' + form.domain,
      password: form.password
    };

    uiState.username = callObject.calleeId;
    

    extensionController.login(
      callObject, 
      function (err, data) {
        if (!err) {
          state.toggle('loggedOut', 'loggedIn');
        }
      });
  },


  'button#loginForC2DM': function (e) {
    console.log('loginForC2DM');
    var form = collectForm('#loginBox', 'calleeId', 'password', 'domain');
    var callObject = {
      calleeId: form.calleeId + '@' + form.domain,
      password: form.password
    };

    uiState.username = callObject.calleeId;
    

    extensionController.login(
      callObject, 
      function (err, data) {
        if (!err) {
          state.toggle('loggedOut', 'loggedIn');
        }
      });
  },

  'button#startOldDemo': function () {
    // Replace with your API key (see https://dashboard.tokbox.com/projects)
    // and a valid session ID (see http://tokbox.com/opentok/tutorials/create-session/):
    var apiToken = 1127;
    var sessionId = "1_MX4xMTI3fn4xNDE3MDQ4NzAyNTg2fjhVTmNHb3QxN3ZJVWx0NUx6TzVmMHU4UX5-";

    // Replace with a valid token.
    // See http://tokbox.com/opentok/tutorials/create-token/
    var token = "T1==cGFydG5lcl9pZD0xMTI3JnNpZz1jZTYxYTVmNTA5MWJiOTA2ODE4N2Y2NDBmN2MyYmZlNmYzODQ5MzhlOnNlc3Npb25faWQ9MV9NWDR4TVRJM2ZuNHhOREUzTURRNE56QXlOVGcyZmpoVlRtTkhiM1F4TjNaSlZXeDBOVXg2VHpWbU1IVTRVWDUtJmNyZWF0ZV90aW1lPTE0MTcwNDg3MzAmbm9uY2U9MjcwNzEzJnJvbGU9cHVibGlzaGVy";
    
    extensionController.joinSession(apiToken, sessionId, token);
  },
};

state.start('loggedOut');

_.each(listeners, function (i, selector) {
  var $el = document.querySelector(selector);
  if ($el && $el.addEventListener) {
    $el.addEventListener('click', listeners[selector]);
  }
});
////////////////////////////////////////////



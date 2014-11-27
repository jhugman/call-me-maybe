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

var presentation = {
  displayCallAlert: function (callObject) {
    state.start('interruption-started');
    window.confirm(callObject.callerId + ' is calling. Pickup?');
  },
};

var extensionController = new Controller(presentation);

var uiState = {};

////////////////////////////////////////////
var listeners = {
  'button#dial': function (e) {
    console.log('dial');
    var form = collectForm('#dialBox', 'calleeId');
    var callObject = {
      calleeId: form.calleeId,
      callerId: uiState.username,
    };

    extensionController.requestCall(callObject, function (err) {
      if (!err) {
        console.log('Call request granted successfully');
      }
      console.log('call request error: ' + err);
    });
  },

  'button#login': function (e) {
    console.log('login');
    var form = collectForm('#loginBox', 'callerId', 'password', 'domain');
    state.toggle('loggedOut', 'loggedIn');
    uiState.username = form.callerId;
  },

  'button#loginForRealz': function (e) {
    console.log('loginForRealz');
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


};

state.start('loggedOut');

_.each(listeners, function (i, selector) {
  var $el = document.querySelector(selector);
  if ($el && $el.addEventListener) {
    $el.addEventListener('click', listeners[selector]);
  }
});
////////////////////////////////////////////



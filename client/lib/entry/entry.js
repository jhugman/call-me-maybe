'use strict';

console.log('Running inside of entry.js');

var cmm = require('../dial.js'),
    _ = require('lodash');

var location = window.location;

var state = (function () {
  
  var $el = document.querySelector('#state'),
      currentState = [];

  var update = function () {
    $el.classList = currentState.join(" ");
  };

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
var listeners = {
  'button#dial': function (e) {
    console.log('dial');



  },

  'button#login': function (e) {
    console.log('login');
    state.toggle('loggedOut', 'loggedIn');
  }
};

state.start('loggedOut');

////////////////////////////////////////////

_.each(listeners, function (i, selector) {
  var $el = document.querySelector(selector);
  if ($el && $el.addEventListener) {
    $el.addEventListener('click', listeners[selector]);
  }
});

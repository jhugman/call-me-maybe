'use strict';
var _ = require('lodash');

function contains (list, member) {
  if (!list) {
    return false;
  }
  console.log(member + ' in list: ' + JSON.stringify(list));
  return list.indexOf(member) >= 0;
}

var priorities = [
  'unknown', 'neutral', 'low', 'medium', 'high', 'block'
];

var findPriority = function (str) {
  var ordinal = priorities.indexOf(str);
  return ordinal;
};

///////////////////////////////////
function Connector (priority, devices, addition) {
  if (devices) {
    if (addition) {
      devices = _.clone(devices);
      devices.push(addition);
    }
  } else {
    devices = [];
  }
  this.priority = priority;
  this._ordinal = findPriority(priority);
  this._devices = devices;
}

_.extend(Connector.prototype, {
  or: function (priority, bool, device) {

    if (device === undefined && bool !== undefined) {
      device = bool;
      bool = true;
    }

    if (bool === undefined) {
      bool = true;
    }


    if (this.priority === 'blocked') {
      return this;
    }

    var test = findPriority(priority),
        actual = this._ordinal;

    if (bool && test <= actual) {
      return new Connector(this.priority, this._devices, device);
    }
    return this;
  },

  forwardIf: function (priority, bool) {
    return this.or(priority, bool, 'forward');
  },

  connectIf: function (priority, bool) {
    return this.or(priority, bool, 'connect');
  },

  voicemailIf: function (priority, bool) {
    return this.or(priority, bool, 'voicemail');
  },

  textIf: function (priority, bool) {
    return this.or(priority, bool, 'text');
  },

});

Object.defineProperties(Connector.prototype, {
  devices: {
    get: function () {
      return _.uniq(this._devices);
    }
  }
});


///////////////////////////////////

function Approver (priority) {
  this.priority = priority;
  this._ordinal = findPriority(priority);
}

_.extend(Approver.prototype, {
  or: function (bool, priority) {
    var test = findPriority(priority);
    if (bool && test > this._ordinal) {
      return new Approver(priority);
    }
    return this;
  },

  butNot: function (bool, priority) {
    // TODO implement this.
    return this;
  },

  connectTo: function (priority, bool, device) {
    return new Connector(this.priority).or(priority, bool, device);
  },

  connectIf: function (priority, bool) {
    return this.connectTo(priority, bool, 'connect');
  },

  forwardIf: function (priority, bool) {
    return this.connectTo(priority, bool, 'forward');
  },

  voicemailIf: function (priority, bool) {
    return this.connectTo(priority, bool, 'voicemail');
  },

  textIf: function (priority, bool) {
    return this.connectTo(priority, bool, 'text');
  },



});

///////////////////////////////////

function Call (callObject) {
  this._call = callObject;
}

_.extend(Call.prototype, {

  isRatedByAs: function (claimant, priority) {
    var callObject = this._call;

    var test = findPriority(priority);
    if (!callObject.claims) {
      return false;
    }
    var specificClaims = callObject.claims[claimant];
    if (!specificClaims) {
      return false;
    }

    var actual = findPriority(specificClaims.priority);

    return actual >= test;
  }

});


///////////////////////////////////

function They (me, them, data) {
  this._me = me;
  this._them = them;
  this._data = data;
}

_.extend(They.prototype, {

  areMyFriend: function () {
    return contains(this._data.people[this._me].friends, this._them);
  },

  areAFriendOfAFriend: function () {
    return true;
  },

  areAFriendOf: function (id) {
    var person = this._data.people[id];
    if (!person) {
      return false;
    }
    return contains(person.friends, this._them);
  },

  areMemberOf: function (groupId) {
    return contains(this._data.groups[groupId], this._them);
  },

  areWhitelisted: function (id) {
    return contains(this._data.people[this._me].whitelist, this._them);
  },

  areBlacklisted: function (id) {
    return contains(this._data.people[this._me].blacklist, this._them);
  },
});

///////////////////////////////////

function Me (me, data) {
  this._me = me;
  this._data = data;
}

_.extend(Me.prototype, {

  amAwake: function () {
    return true;
  },

  amAvailable: function (start, end) {
    return true;
  },

  areNear: function (lat, lon) {
    return false;
  },

  approvesIf: function (bool, priority) {
    return new Approver('neutral').or(bool, priority);
  },
});

///////////////////////////////////////

module.exports = {
  Me: Me,
  They: They,

  theyCanCallMe: function (data, callerId, calleeId, callObject) {
    var me = new Me(calleeId, data),
        they = new They(calleeId, callerId, data);

    // what if we don't know anyone here?
    var callee = data.people[calleeId];

    if (!callee) {
      // we probably won't have a forwarding address either
      return {
        priority: 'unknown',
        devices: [],
      };
    }

    var rule = callee.rules;
    if (!rule || !_.isFunction(rule)) {
      return 'neutral';
    }

    var connections = rule(me, they, new Call(callObject));

    if (!connections.devices || connections.priority) {
      return {
        priority: connections.priority || 'unknown',
        devices: connections.devices || []
      };
    }

    return connections;
  },

  forwardingAddress: function (data, calleeId) {
    var callee = data.people[calleeId];

    if (!callee) {
      return;
    }

    return callee.forwardTo;
  }
};

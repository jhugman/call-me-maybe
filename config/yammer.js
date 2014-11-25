'use strict';

module.exports = {


  groups: {
    'french': ['freddie']
  },

  network: {
    alice: ['bob', 'charlie', 'daisy'],
    charlie: ['daisy', 'ed', 'freddie'],
  },

  rules: {
    alice: function (d, they) {
      return d(they.areMyFriend(), 'connect|forward')
          || d(they.areAFriendOf('daisy'), 'connect')
          || d();

    }
  },

  forwards: {



  },

  connections: {

  }
};


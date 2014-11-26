'use strict';

module.exports = {

  groups: {
    'Mozilla Executives': ['cbeard', 'mbaker', 'mreid', 'kborchardt'],
    'PDX Stickers': ['pdx-stickers'],
    'PDX Birds': ['birders@oregan.gov'],
  },

  people: {
    jhugman: {
      rules: function (me, they) {
        return me.approvesIf(they.areMyFriend(), 'high')
               .or(they.areAFriendOf('bwalker'), 'high')
               .or(they.areMemberOf('Mozilla Executives'), 'high')
               .or(they.areMemberOf('PDX Stickers'), 'medium')

               .connect('high')
               .forward('medium');
      },
    },

    bwalker: {
      friends: ['digitarald', 'rfant', 'backslashn', 'jhugman'],

      whitelist: ['daisy@disney.com'],
      blacklist: [],

      forwardTo: 'bwalker@owncloud.com',

      rules: function (me, they) {
        return me.approvesIf(they.areMyFriend(), 'high')
               .or(they.areAFriendOf('rfant'), 'high')
               .or(they.areMemberOf('Mozilla Executives'), 'high')
               .or(they.areMemberOf('PDX Birds'), 'medium')

               .or(they.areWhitelisted(), 'high')
               .or(they.areBlacklisted(), 'blocked')
               
               .connectIf('high')
               .forwardIf('medium')

               // implicitly, everything else gets blocked.
               ;
      },
    },
  },

  forwards: {

  },

  connections: {

  }
};


'use strict';

module.exports = {

  groups: {
    'Mozilla Executives': ['cbeard', 'mbaker', 'mreid', 'kborchardt'],
    'PDX Stickers': ['pdx-stickers'],
    'PDX Birds': ['birders@oregon.gov'],
  },

  people: {
    jhugman: {
      rules: function (me, they) {
        return me.approvesIf(they.areMyFriend(), 'high')
               .or(they.areAFriendOf('bwalker'), 'high')
               .or(they.areMemberOf('Mozilla Executives'), 'high')
               .or(they.areMemberOf('PDX Stickers'), 'medium')

               .connectIf('high')
               .forwardIf('medium');
      },
    },

    fab: {
      friends: ['james'],
      rules: function (me, they) {
        return me.approvesIf(they.areMyFriend(), 'high')
               .or(they.areMemberOf('Mozilla Executives'), 'high')
               .or(they.areMemberOf('PDX Stickers'), 'medium')

               .connectIf('high')
               .forwardIf('medium');
      },
    },

    james: {
      friends: ['fab'],
      rules: function (me, they) {
        return me.approvesIf(they.areMyFriend(), 'high')
               .or(they.areMemberOf('Mozilla Executives'), 'high')
               .or(they.areMemberOf('PDX Stickers'), 'medium')

               .connectIf('high')
               .forwardIf('medium');
      },
    },

    bwalker: {
      friends: ['digitarald', 'rfant', 'backslashn', 'jhugman'],

      whitelist: ['daisy@disney.com'],
      blacklist: [],

      forwardTo: 'bill@hello.firefox.com',

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


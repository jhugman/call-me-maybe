'use strict';

module.exports = {
  people: {
    bwalker: {

      rules: function (me, they, call) {
        return me.approvesIf(they.areWhitelisted(), 'high')
                .or(call.isRatedByAs('localhost:8081', 'high'), 'high')
                .or(call.isRatedByAs('facebook', 'medium'), 'medium')
                .or(they.areBlacklisted(), 'blocked')

                .connectIf('high')
                .textIf('medium')
                .voicemailIf('low')

               // implicitly, everything else gets blocked.
               ;
      },
    },
  },
};


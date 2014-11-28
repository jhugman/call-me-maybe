'use strict';

module.exports = {
  people: {
    bill: {

      rules: function (me, they, call) {
        return me.approvesIf(they.areWhitelisted(), 'high')
                .or(call.isRatedByAs('localhost:8081', 'high'), 'high') // work.
                .or(call.isRatedByAs('facebook', 'high'), 'medium')  // facebook
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


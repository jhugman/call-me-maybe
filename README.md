WebCall: a complement to WebRTC
===============================

For the purposes of this discussion:

 * network operator: is an entity that allows a collection of people to 'call and talk', 'chat' or text to one another
   e.g. Facebook Messenger, WhatsApp

Right now we have:

  * a series of systems of calling one another.
    - Firefox Hello
    - Facebook Connect
    - Google Hangouts
  * each system allows direct person to person calling.
    - largely limited to within its ecosystem.
    - WebRTC on its own won't change that.
  * the caller chooses when to interrupt the callee.
    - the telephone number or sign-in id gives the caller the right to do this at any time.
    - the callee can only ignore or deal with the call, each and every time.

The consequences of 'sender choses' on users is dramatic:

  * spam
  * abusive behaviour
  * reluctance to widely share phone numbers, Skype ids, email addresses etc.

The consequences of 'within silo only' are similarly so for network operators and the wider ecosystem:

  * no pressure to interoperate between networks
  * easy to close source the connection
    - less easy to resist legal/intelligence assault
    - usually zero third party clients
  * one official client per network
  * users have multiple desktop clients or places to go to call others on various networks
  * zero innovation possible

Proposed here:

A server side API to ease the implentation of calling between arbitrary compatible clients.

  * 'Receiver choses' calling semantics
  * Cross-silo addressability.
  * A minimal HTTPS server-side spec.

Receiver choses
---------------
The 'receiver choses' semantics gives the users tools to whitelist their callers.

Whitelists may be simple or dynamic/rule based. This leads to a virtuous circle where bad actors, and bad behaviour is not rewarded.

Users contact details become safely publishable anywhere. Who gets to call is decided by the user, just-in-time after the fact.

Cross-silo addressability
-------------------------
Minimally, callers can call anonymously, if the callee accepts anonymous calls.

More generally, users from one namespace can receive calls from another.

Addresses, from whichever namespace, can be made stable and long lasting. My friend from junior school can still call me with the my address then.

Minimal API
-----------
Given a suitable first party API (e.g. Facebook's Graph API), this dynamic whitelisting service can be bolted on without the further cooperation from the first-party.

Client developers do not need to develop calling and receiving at the same time.

Services can compete /for/ the connection to the user.

Services compete /with/ user tools, privacy guarantees, functional and beautiful clients.

Use cases
=========

Call me from Facebook!
----------------------
Alice doesn't like Facebook Messenger, but doesn't want to leave her Facebook friends behind.

Alice signs up with hello.com.

She installs an app (perhaps it's Firefox, or a separate app) on her phone and connects it to her account on hello.com.

She can now be called either by her callee id, alice@hello.com or by visiting the link hello.com/call/alice.

hello.com gives her tools to configure rules for who can call, based on her Facebook graph. She gives hello.com permission (via Facebook Connect) to use the Graph API.

She can now be called either by her callee id, alice@facebook.com or by visiting the link hello.com/call/alice1968@facebook.com.

She decides to put that link in her Facebook description.

Bob finds that link and types it into a browser.

He is asked to sign in to hello.com as bob1978@facebook.com using Facebook Connect.

Alice's rules are now able to reason about alice1968@facebook.com and her relationship to bob1978@facebook.com, that are both in the facebook.com namespace.

Based on Alice's rules, at this time, Alice's Hello mobile app is alerted and she and Bob are connected.

On call at work
---------------
Alice works for a company who is moving to WebRTC based calling. It's cheaper and is encrypted.

Alice signs in to her company's WebRTC connector-node with her LDAP account.

She configures it with a web front end to forward any calls to alice@hello.com, but only during work hours. By default, her company will forward those calls to hello.com.

She is also part of the on-call rota, so any calls to on-call@employer.com goes to alice@hello.com but only when Alice is scheduled to be on-call.

Moving jobs
-----------
Alice leaves her employer.com, to go work at someplaceelse.co.uk.

Employer.com can protect itself by routing calls from external contacts (customers, suppliers, journalists) can be forwarded on to others in the company.

Alice can protect herself, by setting up alice@hello.com to accept voice messages from people calling from employer.com. She may accept calls one day.

One HTTP endpoint changes everything
====================================
Let's have an example:

An Example
----------
  * Alf is trying to get a message to Chloe but doesn't know how to call her.
  * 'Chloe' is the name Alf knows her as.
  * Alf knows a mutual acquaintance, Betty who can help.
  * Betty can:
    - take Alf's number and pass it to Chloe.
    - take Alf's number and decide (for whatever reason), not pass it to Chloe.

The reasons that Betty might use to decide if to give Chloe Alf's number are manifold:

  * she knows Alf, and can vouch for him
  * she knows Chloe is on vacation, and doesn't want to be disturbed by strangers.
  * Chloe has told Betty how to decide if she is to be interrupted.

In the context of WebRTC
------------------------

WebRTC [can be persuaded to](http://tokbox.com) to have a metaphor for rooms (sessions) and keys into those rooms (tokens).

If the message Alf wants to get to Chloe is:

> Please meet me in this room, now. Here is a key to get in.

If we were to imagine a virtual Betty, and implement it as a HTTP request that Alf (or his calling device) might call:

```
POST /webcall

request params:
  - callerId
  - calleeId
  - sessionId?
  - token?

response params:
  - success
    - sessionId?
    - token?
  
error responses
  - could_not_attend

  - unknown_caller_namespace
    - list of namespace know by this connector router.
```

A server which has this endpoint may be called a 'connector node'.

Connect me
----------
The caller calls the endpoint to ask it the following:
  - please connect me to the callee /OR/
  - forward me on to someone who can.

If the end point is unable to connect, or decides not to then it gives a neutral 'could_not_attend'. It is not advisable, culturally, to distinguish between 'the callee is offline' and 'the callee doesn't want to talk [to you]'.

This corresponds to one of three minimal replies:

> Ok, I've passed on the note

or

> I can't find her. You can try later or never.

or

> I don't know you, but do you go by any other names?

The optional request parameters account for a different type of note from Alf:

> Please meet me in /a/ room, now. Can you find a room (and a key) please.

This may result in an error response:

> I can't find a room. Please find a room, then try again.

The optional response parameters account for this type of call as well as, Betty responding with:

> Ok, she'll meet you in this other room instead. Here is a key for you, too.

and:

> Ok, that room is good, but use this type of key instead.

This is useful if the key (the token) gives you different access rights to the room.

The node may own a direct communication to the user, but its implementations are out of scope too. Possible implementations may be: 

 * WebSockets
 * Google Cloud Messaging
 * Push Notifications

A collaborating client app or browser extension or open web page is assumed.

Connector-nodes with such a direct connection to the user may be called 'receiver nodes'.

Without such a direct connection to the user, it is refered to as a 'router node'.

Whatever the implementation, if it isn't able to pass the message directly to callee, then if pre-arranged with the callee, it can recursively make a request another `/webcall` endpoint.

Forwarding
----------
If pre-arranged by the callee, the call may be 'forwarded' on to another connector-node, with another id.

Thus namespace mapping becomes possible, e.g.:

A call from alf.coalface@employer.com to chloe.manager@employer.com may be forwarded to Chloe's receving service at `personal.me`.

> chloe.manager@employer.com forwarded onto chloe1988@personal.me.

The connector-node responsible for the `employer.com` namespace can reason about the call, forward it on to the `personal.me` receiver node, which can decide what to do.

It is not specified here, but needs to be, how the decision reasoning is communicated from node to node, and verified by the next-in-line node.

`personal.me` may know about `employer.com` as on a global whitelist, or Chloe may have set up rules to reason about calls from specific domains.

Chains of forwards are possible:

  * dan.sales@supplier.com asks the supplier.com connector node to establish call with chloe.manager@employer.com.
  * supplier.com forwards to chloe.manager@employer.com.
  * employer.com forwards to chloe1988@personal.me
  * personal.me connects joins the call


Choosing the first connector node
---------------------------------

The first connector-node, i.e. the node which the client web page or app calls, can be one of three: 

  * The receiver-node of the namespace that the caller uses.
  * The connector node responsible for the namespace of the callee.
  * A connector node provided by the client web page/app.

From a trust point of view, each connector should be satisfied that the caller and callee both have the right to use those identifiers.

The first connector should have collected enough login information from the caller to be convinced that the user has the right to use that id.

If caller Dan is using the Hello Dialler app on his phone, he will have needed to give permission to the app to zero or more accounts other than his hello.com login.
i.e. the caller app can sign into multiple connector-nodes, and he can call as different ids.

The first connector should then vouch (i.e. verifiably sign for the identity of the caller) that the caller is who they say they are.

i.e. Dan signs into hello.com and the hello.com connector node can verify that Dan is dan2048@hello.com.

As a service to Dan, hello.com might try and find Dan's login for employer.com, but in this case, there isn't one.

Once this is done, it can forward it on to the callee's connector node.

Implementation
==============

Outside of a call, a minimally useful connector node should allow a user to specify a forwarding address. 

This proposal does not need to specify (or rule out):

  * how to pass the message to the callee in real time (e.g. desktop WebPush, Google Cloud Messaging, MQTT, Push Notifications).
  * how the user specifies their forwarding address
  * how the user specifies their whitelisting rules
  * how realtime user data can be fed back into the rules e.g. location, am I driving, am I in a meeting.

Additionally, it does not specify:

  * can the node map the caller id from one namespace into its own i.e. calling as different IDs?
  * can the receiver node map WebRTC onto another type of voice/text/voice network, e.g. SIP etc.

Trust, Privacy, Security
========================
The content of the calls is subject to the same considerations as vanilla WebRTC.

The handoff to the WebRTC coordinating server (minimally the only server both ends touch) is fairly clean, so either end can specify where that happens.

The collectable 'metadata' is less clear.

This is most usefully examined in chains of forwards. 

For the call to connect successfully, almost all the connector nodes will need to have been trusted (and minimally configured) by the users at either end.

The caller will never gain more callee ids by making a call.

The callee will gets a minimum of one id from the caller, and a maximally all of the caller ids (in the case of a retries).

For further consideration
-------------------------
For routing purposes, each in the chain is connector node is free to rename caller and callee ids, however, the routing chain may be broken into two portions:

  * the part known to, configured by and nominally trusted by the caller
  * the part known to, configured by and nominally trusted by the callee

Up until the two meet, the caller chain has no choice but to maintain the same callee id.

To increase the chance of a call be whitelisted, the caller chain may be able to present the callee chain with the caller's id in the same namespace as the callee (common ground is not necessary for a successful call, but reduces callee configuration).

At this point, what id(s) the caller chain gives the callee chain is up to the caller.

If common ground has been found by the caller chain, then the caller can give the single id that matches.

If common ground is not found by the caller chain, and the call can't be routed, then the callee chain may offer the namespaces it knows how to reason about. Thus, namespace mapping becomes possible, but not at the expense of caller privacy.

Caller/Callee Trust considerations
----------------------------------
Most security concerns can be addressed by using HTTPS between caller client and between connector nodes.

However, the chain of forwards is the most interesting case.

The caller chain's job to verify the caller, and verifiably assert that to the callee chain.

The callee chain should be able to verify those assertions made by the caller chain.

For this, lessons can be drawn from the Mozilla Persona project.

Second, down stream nodes should be able to trust the reasoning of the nodes themselves – for this additional endpoints may be necessary.

No serious examination has been made of these issues for this implementation, though it is hoped that these already have well known solutions.

Possible extensions
===================

  * Observer based Presence. Is this person available to talk, to me?
  * On demand trust verification. This person is calling me right now. Why should I take the call?
  * White pages. Who in my networks is contactable?

Observations
============
1. Large scale adoption of this spec by an untrusted entity would inevitably lead to a corresponding effort and adoption by community or a more trusted entity.
2. An ecosystem of services not possible before, either on the web, or at all.
3. Most of the innovation in this ecosystem would be user-respectful.


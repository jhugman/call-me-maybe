module.exports = {
  'bind-address': 'localhost',

  'dataModule': 'data.js',
  'appModule': 'app-server.js',
  

  'opentok-api-token': {
    '': '45090862',
    'dev': '1127',
  },

  'session-host': '',

  'connector-nodes-for-namespaces': {
    'dev': './config/domain-mappings-dev.js',
    '': './config/domain-mappings.js',
  },

  mozilla: {
    'namespace-dir': './servers/mozilla',
    '': {
      'opentok-session': '2_MX40NTA5MDg2Mn5-MTQxNzExMTc3NDczN345QTg2bUxPRy9Xb0ptdjUveHBQR3F2Q0d-fg',
      'opentok-token-caller': 'T1==cGFydG5lcl9pZD00NTA5MDg2MiZzaWc9ODJmZTZiNGQwNzQ3NmJiY2U3OTkwNWFlMjE1ZmIyYTNhNzg3NDMzYzpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UQTVNRGcyTW41LU1UUXhOek0yTVRjek1EWXpPWDVXYUcxM2RXNWpWMmxEZEhkMldXdHVORmxzZVM4d2MxbC1mZyZjcmVhdGVfdGltZT0xNDE3MzYxNzkyJm5vbmNlPTAuNDMzNzc3NzMwMDIyMjM5NiZleHBpcmVfdGltZT0xNDE5OTUzNzIw',
      'opentok-token-callee': 'T1==cGFydG5lcl9pZD00NTA5MDg2MiZzaWc9YjlkNmNhNjQyZTZjMzVmMzFlNjczMGYxMjA5NDhkOGJiOTcyZjE0Nzpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UQTVNRGcyTW41LU1UUXhOek0yTVRjek1EWXpPWDVXYUcxM2RXNWpWMmxEZEhkMldXdHVORmxzZVM4d2MxbC1mZyZjcmVhdGVfdGltZT0xNDE3MzYxODMxJm5vbmNlPTAuNTU1NzQzNjA2NzMwODEyNSZleHBpcmVfdGltZT0xNDE5OTUzNzIw',
    },
    'dev': {
      'opentok-session': '1_MX4xMTI3fn4xNDE3Mzk3NTAxNjU2fmZYZHk2dTNCb01YYmE2S0JFT0ltakthSn5-',
      'opentok-token-caller': 'T1==cGFydG5lcl9pZD0xMTI3JnNpZz1jYjAzMzNmMzBjNmIxNDJmNmNhMzNjY2E5ODhiNDUxZTJiN2Q3NTU3OnNlc3Npb25faWQ9MV9NWDR4TVRJM2ZuNHhOREUzTXprM05UQXhOalUyZm1aWVpIazJkVE5DYjAxWVltRTJTMEpGVDBsdGFrdGhTbjUtJmNyZWF0ZV90aW1lPTE0MTczOTc1Nzcmbm9uY2U9OTk3MDc0JnJvbGU9cHVibGlzaGVy',
      'opentok-token-callee': 'T1==cGFydG5lcl9pZD0xMTI3JnNpZz0wM2NjYjczYjRiNGEwNWQ1NDhkNjUxOTA0ZWI1YjllMzJmNjdkM2Y0OnNlc3Npb25faWQ9MV9NWDR4TVRJM2ZuNHhOREUzTXprM05UQXhOalUyZm1aWVpIazJkVE5DYjAxWVltRTJTMEpGVDBsdGFrdGhTbjUtJmNyZWF0ZV90aW1lPTE0MTczOTc3OTYmbm9uY2U9Nzg1MTcmcm9sZT1wdWJsaXNoZXI=',
    }
  },

  hello: {
    'namespace-dir': './servers/hello',
    '': {
      'opentok-session': '2_MX40NTA5MDg2Mn5-MTQxNzExMTc3NDczN345QTg2bUxPRy9Xb0ptdjUveHBQR3F2Q0d-fg',
      'opentok-token-caller': 'T1==cGFydG5lcl9pZD00NTA5MDg2MiZzaWc9ODJmZTZiNGQwNzQ3NmJiY2U3OTkwNWFlMjE1ZmIyYTNhNzg3NDMzYzpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UQTVNRGcyTW41LU1UUXhOek0yTVRjek1EWXpPWDVXYUcxM2RXNWpWMmxEZEhkMldXdHVORmxzZVM4d2MxbC1mZyZjcmVhdGVfdGltZT0xNDE3MzYxNzkyJm5vbmNlPTAuNDMzNzc3NzMwMDIyMjM5NiZleHBpcmVfdGltZT0xNDE5OTUzNzIw',
      'opentok-token-callee': 'T1==cGFydG5lcl9pZD00NTA5MDg2MiZzaWc9YjlkNmNhNjQyZTZjMzVmMzFlNjczMGYxMjA5NDhkOGJiOTcyZjE0Nzpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UQTVNRGcyTW41LU1UUXhOek0yTVRjek1EWXpPWDVXYUcxM2RXNWpWMmxEZEhkMldXdHVORmxzZVM4d2MxbC1mZyZjcmVhdGVfdGltZT0xNDE3MzYxODMxJm5vbmNlPTAuNTU1NzQzNjA2NzMwODEyNSZleHBpcmVfdGltZT0xNDE5OTUzNzIw',
    },
    'dev': {
      'opentok-session': '1_MX4xMTI3fn4xNDE3Mzk3NTAxNjU2fmZYZHk2dTNCb01YYmE2S0JFT0ltakthSn5-',
      'opentok-token-caller': 'T1==cGFydG5lcl9pZD0xMTI3JnNpZz1jYjAzMzNmMzBjNmIxNDJmNmNhMzNjY2E5ODhiNDUxZTJiN2Q3NTU3OnNlc3Npb25faWQ9MV9NWDR4TVRJM2ZuNHhOREUzTXprM05UQXhOalUyZm1aWVpIazJkVE5DYjAxWVltRTJTMEpGVDBsdGFrdGhTbjUtJmNyZWF0ZV90aW1lPTE0MTczOTc1Nzcmbm9uY2U9OTk3MDc0JnJvbGU9cHVibGlzaGVy',
      'opentok-token-callee': 'T1==cGFydG5lcl9pZD0xMTI3JnNpZz0wM2NjYjczYjRiNGEwNWQ1NDhkNjUxOTA0ZWI1YjllMzJmNjdkM2Y0OnNlc3Npb25faWQ9MV9NWDR4TVRJM2ZuNHhOREUzTXprM05UQXhOalUyZm1aWVpIazJkVE5DYjAxWVltRTJTMEpGVDBsdGFrdGhTbjUtJmNyZWF0ZV90aW1lPTE0MTczOTc3OTYmbm9uY2U9Nzg1MTcmcm9sZT1wdWJsaXNoZXI=',
    }
  },


  owncloud: {
    'namespace-dir': './servers/owncloud',
    'opentok-session': '2_MX40NTA5MDg2Mn5-MTQxNzExMTc3NDczN345QTg2bUxPRy9Xb0ptdjUveHBQR3F2Q0d-fg',
    'opentok-token-caller': 'T1==cGFydG5lcl9pZD00NTA5MDg2MiZzaWc9ODJmZTZiNGQwNzQ3NmJiY2U3OTkwNWFlMjE1ZmIyYTNhNzg3NDMzYzpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UQTVNRGcyTW41LU1UUXhOek0yTVRjek1EWXpPWDVXYUcxM2RXNWpWMmxEZEhkMldXdHVORmxzZVM4d2MxbC1mZyZjcmVhdGVfdGltZT0xNDE3MzYxNzkyJm5vbmNlPTAuNDMzNzc3NzMwMDIyMjM5NiZleHBpcmVfdGltZT0xNDE5OTUzNzIw',
    'opentok-token-callee': 'T1==cGFydG5lcl9pZD00NTA5MDg2MiZzaWc9YjlkNmNhNjQyZTZjMzVmMzFlNjczMGYxMjA5NDhkOGJiOTcyZjE0Nzpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UQTVNRGcyTW41LU1UUXhOek0yTVRjek1EWXpPWDVXYUcxM2RXNWpWMmxEZEhkMldXdHVORmxzZVM4d2MxbC1mZyZjcmVhdGVfdGltZT0xNDE3MzYxODMxJm5vbmNlPTAuNTU1NzQzNjA2NzMwODEyNSZleHBpcmVfdGltZT0xNDE5OTUzNzIw',
  },
}
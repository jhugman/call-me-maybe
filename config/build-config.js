module.exports = {
  'project-dir': {
    '': '.'
  },
  'dist-relative': {
    '': 'build/dist',
    'cordova': 'www'
  },
  'run-command': {
    'ios': 'cordova emulate ios',
    'android': 'cordova run android',
    '': 'echo "localhost already running"'
  },
  'icons-relative': {
    'android': 'platforms/android/res'
  },

  // to be copied into the top level dist directory.
  'resources-common': [
    'icon-font.css'
  ],

  'resources-specific': {
    '': ['manifest.webapp', 'img/icon.png'],
    'cordova': ['config.xml'],
  },

  // grunt tasks we call depending on build variant.
  'extra-build-tasks': {
    '': ['manifest'],
    'cordova': ['copy:cordova', 'run-native'], 
  },

  'launcher-icon': {
    'android': {
      'mdpi': 'drawable-mdpi/ic_launcher.png',
      'hdpi': 'drawable-hdpi/ic_launcher.png',
      'xhdpi': 'drawable-xhdpi/ic_launcher.png',
      'xxhdpi': 'drawable-xxhdpi/ic_launcher.png',
      'xxxhdpi': 'drawable-xxxhdpi/ic_launcher.png',
    },
  },
};
module.exports = {

  'basic-info': 'info.js',

  'project-dir': '.',
  
  'dist-relative': {
    '': 'build/dist',
  },
  'assets-relative': {
    '': 'assets',
  },
  'run-command': {
    '': 'echo "localhost already running"'
  },

  // to be copied into the top level dist directory.
  'resources-common': [
    'icon-font.css'
  ],

  'resources-specific': {
    '': [],
  },

  // grunt tasks we call depending on build variant.
  'extra-build-tasks': {
    '': ['manifest'],
  },
};
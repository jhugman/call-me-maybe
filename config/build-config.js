module.exports = {
  'project-dir': {
    '': '.'
  },
  'dist-relative': {
    '': 'build/dist',
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

  'theme': {
    'yammer': './client/style/yammer-theme.styl'
  },

  // grunt tasks we call depending on build variant.
  'extra-build-tasks': {
    '': ['manifest'],
  },
};
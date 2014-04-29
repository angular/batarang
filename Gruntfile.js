
var markdown = require('marked'),
  semver = require('semver');

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist',
    manifest: grunt.file.readJSON('app/manifest.json')
  };

  grunt.initConfig({
    config: config,
    pkg: grunt.file.readJSON('app/manifest.json'),
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        versionFile: 'app/manifest.json'
      }
    },
    bump: {
      options: {
        file: 'app/manifest.json'
      }
    },
    markdown: {
      all: {
        file: 'README.md',
        dest: 'panes/help.html'
      }
    },
    release: {
      options: {
        commitMessage: 'v<%= version %>',
        tagName: 'v<%= version %>',
        bump: false, // we have out own bump
        npm: false,
        file: 'app/manifest.json'
      }
    },
    stage: {
      files: ['CHANGELOG.md', 'panes/help.html']
    },
    zip: {
      release: {
        src: [
          'app/devtools-panel/css/*.css',
          'app/devtools-panel/img/**',
          'app/devtools-panel/js/**',
          'app/devtools-panel/panes/*.html',
          'app/devtools-panel/panel.html',
          'LICENSE',
          'app/manifest.json',
          'app/background/**',
          '!app/background/chromereload.js',
          'app/content-scripts/inject.build.js',
          'app/bower_components/angular/angular.js',
          'app/bower_components/angular-mocks/angular-mocks.js',
          'app/bower_components/jquery/jquery.js',,
          'app/bower_components/d3/d3.min.js'
        ],
        dest: 'batarang-release-' + Date.now() + '.zip'
      }
    },
    watch: {
      inline: {
        options: {
          livereload: true
        },
        files: ['scripts/inline.js','app/content-scripts/**/*.js', '!app/content-scripts/inject.build.js'],
        tasks: ['inline']
      },
      scripts: {
        options: {
          livereload: true
        },
        files: ['app/devtools-panel/**/*.*','app/content-scripts/inject.build.js','app/background/**','app/content-scripts/**'],
        tasks: []
      }
    },
    // Grunt server and debug server setting
    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      chrome: {
        options: {
          open: false,
          base: [
            '<%= config.app %>'
          ]
        }
      },
      test: {
        options: {
          open: false,
          base: [
            'test',
            '<%= config.app %>'
          ]
        }
      }
    }
  });

  grunt.registerTask('bump', 'bump manifest version', function (type) {
    var options = this.options({
      file: grunt.config('pkgFile') || 'package.json'
    });
    function setup(file, type){
      var pkg = grunt.file.readJSON(file);
      var newVersion = pkg.version = semver.inc(pkg.version, type || 'patch');
      return {file: file, pkg: pkg, newVersion: newVersion};
    }
    var config = setup(options.file, type);
    grunt.file.write(config.file, JSON.stringify(config.pkg, null, '  ') + '\n');
    grunt.log.ok('Version bumped to ' + config.newVersion);

  });

  grunt.registerMultiTask('markdown', 'compiles markdown README into html for the help pane', function() {
    var md = grunt.file.read(this.data.file);

    // pull out the install instructions, etc
    var marker = '<!-- HELP TAB -->';
    md = md.substr(md.indexOf(marker) + marker.length);

    // fix image paths
    md = md.replace(/https:\/\/github.com\/angular\/angularjs-batarang\/raw\/master\/img\//g, '/img/');

    var html = markdown(md);

    grunt.file.write(this.data.dest, html);
  });

  grunt.registerTask('stage', 'git add files before running the release task', function() {
    grunt.util.spawn({
      cmd: process.platform === 'win32' ?
        'git.cmd' : 'git',
      args: ['add'].append(this.data.files)
    }, grunt.task.current.async());
  });

  grunt.registerTask('url', 'open the url for the chrome app dashboard', function() {
    var url = 'https://chrome.google.com/webstore/developer/dashboard';
    console.log('Publish to: ' + url);
    grunt.util.spawn({
      cmd: process.platform === 'win32' ?
        'explorer' : 'open',
      args: [ url ]
    }, grunt.task.current.async());
  });

  grunt.registerTask('inline', '...', require('./scripts/inline'));

  grunt.registerTask('release', ['bump', 'markdown', 'changelog', 'release', 'zip']);
  grunt.registerTask('build', ['markdown', 'inline']);
  grunt.registerTask('default', ['build']);

  grunt.registerTask('debug', ['connect:chrome', 'watch'])

};

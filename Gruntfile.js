
var markdown = require('marked'),
  semver = require('semver');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('manifest.json'),
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        versionFile: 'manifest.json'
      }
    },
    bump: {
      options: {
        file: 'manifest.json'
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
        file: 'manifest.json'
      }
    },
    stage: {
      files: ['CHANGELOG.md', 'pane/help.html']
    },
    preprocess: {
      firefox: {
        src: 'panel.html',
        dest: 'dist/firefox/data/panel.html',
        options: {
          context: {
            FIREFOX: true
          }
        }
      },
      chrome: {
        src: 'panel.html',
        dest: 'dist/chrome/panel.html',
        options: {
          context: {
            CHROME: true
          }
        }
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'firefox',
            src: [ '**/*' ],
            dest: "dist/firefox/"
          },
          { expand: true,
            src: [
              'css/*.css',
              'img/**',
              'js/**',
              'panes/*.html',
              'LICENSE',
              'manifest.json',
              'background.html',
              'devtoolsBackground.html'
            ],
            dest: "dist/firefox/data/"
          },
          { expand: true,
            src: [
              'css/*.css',
              'img/**',
              'js/**',
              'panes/*.html',
              'LICENSE',
              'manifest.json',
              'background.html',
              'devtoolsBackground.html'
            ],
            dest: "dist/chrome"
          }
        ]
      }
    },
    zip: {
      release: {
        cwd: 'dist/chrome/',
        src: [
          'css/*.css',
          'img/**',
          'js/**',
          'panes/*.html',
          'LICENSE',
          'manifest.json',
          'background.html',
          'devtoolsBackground.html'
        ],
        dest: 'batarang-release-' + Date.now() + '.zip'
      }
    },
    "mozilla-addon-sdk": {
      "1_14": {
        options: { revision: "1.14" }
      }
    },
    "mozilla-cfx": {
      run: {
        options: {
          "mozilla-addon-sdk": "1_14",
          extension_dir: "dist/firefox",
          command: "run"
        }
      }
    },
    "mozilla-cfx-xpi": {
      "1_15": {
        options: {
          "mozilla-addon-sdk": "1_14",
          extension_dir: "dist/firefox",
          dist_dir: "tmp/xpi"
        }
      }
    },
    clean: ['dist']
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

  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-mozilla-addon-sdk');

  grunt.registerTask('default', ['bump', 'markdown', 'changelog', 'release',
                                 'copy', 'preprocess:chrome', 'zip']);
  grunt.registerTask('build_xpi', ['mozilla-addon-sdk',
                                   'copy', 'preprocess:firefox',
                                   'mozilla-cfx-xpi']);
  grunt.registerTask('run_xpi', ['mozilla-addon-sdk',
                                 'copy', 'preprocess:firefox',
                                 'mozilla-cfx:run']);
};

mocha-phantom-lcov-reporter
===================

[![Build Status](https://travis-ci.org/mazerte/mocha-phantom-coverage-reporter.png?branch=master)](https://travis-ci.org/mazerte/mocha-phantom-coverage-reporter)
[![Dependency Status](https://gemnasium.com/mazerte/mocha-phantom-coverage-reporter.png)](https://gemnasium.com/mazerte/mocha-phantom-coverage-reporter)
[![Code Climate](https://codeclimate.com/github/mazerte/mocha-phantom-coverage-reporter.png)](https://codeclimate.com/github/mazerte/mocha-phantom-coverage-reporter)

[![NPM](https://nodei.co/npm/mocha-phantom-coverage-reporter.png?downloads=true&stars=true)](https://nodei.co/npm/mocha-phantom-coverage-reporter/) 

PhantomJS LCOV reporter for [Mocha](http://mochajs.org/).

This reporter combine three Mocha reporter: [Spec](http://visionmedia.github.io/mocha/), [HTMLCov](http://visionmedia.github.io/mocha/) and [Mocha Lcov Reporter](https://github.com/StevenLooman/mocha-lcov-reporter). It work with NodeJS and in browser with PhantomJS.

The output lcov file is fully compatible with Coveralls

Usage
-----

For prepare your sources files for coverage you can read the "Usage" section of [Mocha Lcov Reporter](https://github.com/StevenLooman/mocha-lcov-reporter) or "Mocha + JSCoverage" and "Istanbul" section of [Coveralls node helper](https://github.com/cainus/node-coveralls).
If you are using CoffeeScript, I recommend [CoffeeCoverage](https://github.com/benbria/coffee-coverage).

For NodeJS
```bash
mocha -R mocha-phantom-lcov-reporter
```

In browser
```coffeescript
# Gruntfile.coffee
grunt.loadNpmTasks('grunt-mocha')

grunt.initConfig
	mocha:
			all: 
				options:
					mocha:
						ignoreLeaks: false

					urls: ['http://localhost:<%= connect.test.options.port %>/']
					run: false
					reporter: 'mocha-phantom-coverage-reporter'
					timeout: 5000
```
And you must change the Phantom Bridge for pass coverage var at end of test
```js
if (ev == 'end' && window._$jscoverage) {
        var cov = {};
        for(var prop in window._$jscoverage) {
                var file = window._$jscoverage[prop];
                file[0] = file.source;
                cov[prop] = file;
        }
        data.cov = cov;
}

sendMessage('mocha.' + ev, data);
```
See this example in [generator-footguard bridge line 32](https://github.com/mazerte/generator-footguard/blob/master/app/templates/test/runner/bridge.js#L32)

This exemple is issue to [generator-footguard](https://github.com/mazerte/generator-footguard) a project generator for [Yeoman](http://yeoman.io). You can see the result on [test-footguard](https://github.com/mazerte/test-footguard)

Report
------

In your console you can see the spec reporter of [Mocha](http://mochajs.org/) and two files are created in coverage directory: coverage.lcov and coverage.html.

The file "coverage.html", it's the result of Mocha HTMLCov reporter. It's very helpful for debug coverage in local.

The file "coverage.lcov", it's file compatible with [LCOV](http://ltp.sourceforge.net/coverage/lcov.php) and [Coveralls](http://coveralls.io)

Link to Coveralls
-----------------

For link your project with [Coveralls](http://coveralls.io), start to add [node-coveralls](https://github.com/cainus/node-coveralls) dependency in your project.

```bash
$ npm install coveralls --save-dev
```

For send coverage result to Coveralls

```bash
cat ./coverage/coverage.lcov | ./node_modules/coveralls/bin/coveralls.js
```

Coveralls parse all files in lcov file for add source, maybe your sources are not linked correctly you can specify the folder like this:

```bash
cat ./coverage/coverage.lcov | ./node_modules/coveralls/bin/coveralls.js src
```

Tips
----

If you work with [Grunt](http://gruntjs.com/) and [CoffeeCcript](http://coffeescript.org/), I recommend you [grunt-coffeecov](https://github.com/mazerte/grunt-coffeecov).

```coffeescript
# Gruntfile.coffee
grunt.loadNpmTasks('grunt-mocha')
grunt.loadNpmTasks('grunt-coffeecov')
grunt.loadNpmTasks('grunt-contrib-coffee')

grunt.initConfig
  connect:
    test:
      options:
        port: 3000
        hostname: '0.0.0.0'

  coffee:
    dist:
      expand: true
      cwd: 'src/coffee/'
      src: ['**/*.coffee']
      dest: '.tmp/js'
      ext: '.js'

  coffeecov:
    options:
      path: 'relative'
    dist:
      src: 'src/coffee/app'
      dest: '.tmp/js/app'

  mocha:
    all: 
      options:
        mocha:
          ignoreLeaks: false

        urls: ['http://localhost:3000/']
        run: false
        reporter: 'mocha-phantom-coverage-reporter'
        timeout: 10000

grunt.registerTask('test', [
  'coffee:dist'
  'coffeecov:dist'
  'connect:test'
  'mocha'
])
```


/**
 * Expose `LCov`.
 */

var fs = require('fs')
  , Spec = require('mocha/lib/reporters/spec')
  , mkdirp = require('mkdirp');

exports = module.exports = Reporter;

/**
 * Initialize a new LCOV reporter.
 * File format of LCOV can be found here: http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php
 * The reporter is built after this parser: https://raw.github.com/SonarCommunity/sonar-javascript/master/sonar-javascript-plugin/src/main/java/org/sonar/plugins/javascript/coverage/LCOVParser.java
 *
 * @param {Runner} runner
 * @api public
 */

function Reporter(runner) {

  Spec.call(this, runner);

  runner.on('end', function(datas){
    var cov = global._$jscoverage;
    if(datas && datas.cov) {
      cov = {};
      for(var prop in datas.cov) {
        file = datas.cov[prop];
        file.source = file[0];
        file[0] = null;
        cov[prop] = file;
      }
    }

    if(cov) {
      try {
        fs.mkdirSync('coverage');
      } catch(e) {}

      fs.writeFileSync("coverage/coverage.lcov", lcov(cov));
      fs.writeFileSync("coverage/coverage.html", HTMLCov(cov));
    }
  });
}
Reporter.prototype.__proto__ = Spec.prototype;

/**
 * LCOV
 */
function lcov(cov) {
  var content = "";
  for (var filename in cov) {
    var data = cov[filename];
    content += reportFile(filename, data);
  }
  return content;
}

function reportFile(filename, data) {
  var content = 'SF:' + filename + '\n';

  data.source.forEach(function(line, num) {
    // increase the line number, as JS arrays are zero-based
    num++;

    if (data[num] !== undefined) {
      content += 'DA:' + num + ',' + data[num] + '\n';
    }
  });

  content += 'end_of_record\n';

  return content;
}

/**
 * HTMLCov
 */
function HTMLCov(cov) {
  var jade = require('jade')
    , file = __dirname + '/../node_modules/mocha/lib/reporters/templates/coverage.jade'
    , str = fs.readFileSync(file, 'utf8')
    , fn = jade.compile(str, { filename: file })
    , self = this;

  return fn({
      cov: map(cov)
    , coverageClass: coverageClass
  });
}

/**
 * Return coverage class for `n`.
 *
 * @return {String}
 * @api private
 */

function coverageClass(n) {
  if (n >= 75) return 'high';
  if (n >= 50) return 'medium';
  if (n >= 25) return 'low';
  return 'terrible';
}

/**
 * JSONCov
 */

/**
 * Map jscoverage data to a JSON structure
 * suitable for reporting.
 *
 * @param {Object} cov
 * @return {Object}
 * @api private
 */

function map(cov) {
  var ret = {
      instrumentation: 'node-jscoverage'
    , sloc: 0
    , hits: 0
    , misses: 0
    , coverage: 0
    , files: []
  };

  for (var filename in cov) {
    var data = coverage(filename, cov[filename]);
    ret.files.push(data);
    ret.hits += data.hits;
    ret.misses += data.misses;
    ret.sloc += data.sloc;
  }

  ret.files.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });

  if (ret.sloc > 0) {
    ret.coverage = (ret.hits / ret.sloc) * 100;
  }

  return ret;
};

/**
 * Map jscoverage data for a single source file
 * to a JSON structure suitable for reporting.
 *
 * @param {String} filename name of the source file
 * @param {Object} data jscoverage coverage data
 * @return {Object}
 * @api private
 */

function coverage(filename, data) {
  var ret = {
    filename: filename,
    coverage: 0,
    hits: 0,
    misses: 0,
    sloc: 0,
    source: {}
  };

  data.source.forEach(function(line, num){
    num++;

    if (data[num] === 0) {
      ret.misses++;
      ret.sloc++;
    } else if (data[num] !== undefined) {
      ret.hits++;
      ret.sloc++;
    }

    ret.source[num] = {
        source: line
      , coverage: data[num] === undefined
        ? ''
        : data[num]
    };
  });

  ret.coverage = ret.hits / ret.sloc * 100;

  return ret;
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
      title: test.title
    , fullTitle: test.fullTitle()
    , duration: test.duration
  }
}

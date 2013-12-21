var Reporter = require('./../lib/reporter')
  , EventEmitter = require('events').EventEmitter
  , cov = require('./fixtures/jscoverage')
  , fs = require('fs')
	, expect = require('chai').expect
  , should = require('chai').should();

require('chai').use(require('chai-fs'));

function run(runner, end) {
  var test = {}
  test.title = "test"
  test.slow = function() { return 1000 };

  end = end || {};
  runner.emit('start', {});
  runner.emit('suite', { title: "suite" });
  runner.emit('pass', test);
  runner.emit('suite end', { title: "suite" });
  runner.emit('end', end);
};

function phantomize(covDatas) {
  var result = {}
  for(var file in covDatas) {
    result[file] = covDatas[file];
    result[file][0] = covDatas[file].source;
  }
  return JSON.parse(JSON.stringify(result));
}

describe('Reporter', function() {

  beforeEach(function() {
    this.runner = new EventEmitter();
    this.reporter = new Reporter(this.runner);
  });

	it('is defined', function() {
    expect(Reporter).to.exists;
  });

  it('run', function() {
    run(this.runner);
  });

  describe('without PhantomJS', function() {

    beforeEach(function() {
      global._$jscoverage = cov;
    });

    it('Lcov', function() {
      run(this.runner);
      expect('coverage/coverage.lcov').to.be.a.file().and.not.empty;
      content = fs.readFileSync('coverage/coverage.lcov', 'utf8');
      content.should.have.string('SF:my/file.js');
      content.should.have.string('end_of_record');
    });

    it('HTMLCov', function() {
      run(this.runner);
      expect('coverage/coverage.html').to.be.a.file().and.not.empty;
      content = fs.readFileSync('coverage/coverage.html', 'utf8');
      content.should.have.string('<span class="basename">file.js</span>');
    });

    it('Spec', function() {
      run(this.runner);
    });

  });

  describe('with PhantomJS', function() {

    beforeEach(function() {
      delete global._$jscoverage;
      this.datas = {
        cov: phantomize(cov)
      };
    });

    it('Lcov', function() {
      run(this.runner, this.datas);
      expect('coverage/coverage.lcov').to.be.a.file().and.not.empty;
      content = fs.readFileSync('coverage/coverage.lcov', 'utf8');
      content.should.have.string('SF:my/file.js');
      content.should.have.string('end_of_record');
    });

    it('HTMLCov', function() {
      run(this.runner, this.datas);
      expect('coverage/coverage.html').to.be.a.file().and.not.empty;
      content = fs.readFileSync('coverage/coverage.html', 'utf8');
      content.should.have.string('<span class="basename">file.js</span>');
    });

    it('Spec', function() {
      run(this.runner, this.datas);
    });

  });

});
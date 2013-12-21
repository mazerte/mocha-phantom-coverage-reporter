var fs = require('fs')
  , JSONCov = require('./json-cov')
  , map = JSONCov.map;

exports = module.exports = HTMLCov;
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

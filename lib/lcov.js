exports = module.exports = lcov;
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
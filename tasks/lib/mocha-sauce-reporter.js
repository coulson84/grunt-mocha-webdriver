'use strict';

var BaseReporter = require('mocha').reporters.Base;
var color = BaseReporter.color;
var total = 0;
  var complete = 0;
  var numberTests = 0;
  var failures = 0;
  var passes = 0;
  var tests = [];
  var stats;
module.exports = function(browser) {
  var bTitle = browser.browserTitle;
  browser.browserTitle = '';
  var SauceReporter = function(runner) {
    BaseReporter.call(this, runner);
    var self = this;
    var these_stats = this.stats;
    var these_numberTests = 0;
    var these_passes = 0;
    var these_failures = 0;
    var these_failInfo = {};
    var xmlResults = '';
    var i;

    stats = stats || this.stats,
    total += 1;

    runner.on('pending', function(test) {
      tests.push(test);
    });

    runner.on('test end', function() {
      theses_numberTests++;
      numberTests++;
    });

    runner.on('pass', function(test) {
      these_passes++;
      passes++;
      test.browser = bTitle;
      tests.push(test);
    });

    runner.on('fail', function(test) {
      failures++;
      these_failures++;
      test.browser = bTitle;
      failInfo[runner.suite.title] = failInfo[runner.suite.title] || [];
      failInfo[runner.suite.title].push(e.title + (e.err.message ? (': ' + e.err.message) : ''));
      these_failInfo[runner.suite.title] = these_failInfo[runner.suite.title] || [];
      these_failInfo[runner.suite.title].push(e.title + (e.err.message ? (': ' + e.err.message) : ''));
      tests.push(test);
    });

    runner.on('end', function() {
      complete += 1;

      if(browser.mode==='saucelabs') {
        browser.sauceJobStatus(failures === 0);
      }

      console.log();
      console.log('Tests complete for ' + bTitle);
      console.log(color('bright pass', '%d %s'), numberTests, 'tests run.');
      if (passes) {
        console.log(color('green', '%d %s'), passes, 'tests passed.');
      }
      if (failures) {
        console.log(color('fail', '%d %s'), failures, 'tests failed.');
        for (var i in failInfo) {
          console.log(color('fail', i + '\n\t' + failInfo[i].join('\n\t')));
        }
      }
      if (browser.mode === 'saucelabs') {
        console.log('Test video at: http://saucelabs.com/tests/' + browser.sessionID);
      }
      console.log();


      if(complete!==total) {
        return;
      }
      xmlResults += tag('testsuite', {
        name: 'Mocha Tests',
        tests: stats.tests,
        failures: stats.failures,
        errors: stats.failures,
        skipped: stats.tests - stats.failures - stats.passes,
        timestamp: (new Date).toUTCString(),
        time: (stats.duration / 1000) || 0,
        browser: bTitle
      }, false);

      tests.forEach(function(testResult) {
        xmlResults += test(testResult)
      });
      xmlResults += '</testsuite>';

      
    });
  }

  /**
   * Inherit from `Base.prototype`.
   */

  //XUnit.prototype.__proto__ = BaseReporter.prototype;

  /**
   * Output tag for the given `test.`
   */

  function test(test) {
    var attrs = {
      classname: test.parent.fullTitle(),
      name: test.browser + ' - ' + test.title,
      time: (test.duration / 1000) || 0
    };

    if ('failed' == test.state) {
      var err = test.err;
      attrs.message = escape(err.message);
      console.log(tag('testcase', attrs, false, tag('failure', attrs, false, cdata(err.stack))));
    } else if (test.pending) {
      console.log(tag('testcase', attrs, false, tag('skipped', {}, true)));
    } else {
      console.log(tag('testcase', attrs, true));
    }
  }

  /**
   * HTML tag helper.
   */

  function tag(name, attrs, close, content) {
    var end = close ? '/>' : '>',
      pairs = [],
      tag;

    for (var key in attrs) {
      pairs.push(key + '="' + escape(attrs[key]) + '"');
    }

    tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;
    if (content) tag += content + '</' + name + end;
    return tag;
  }

  /**
   * Return cdata escaped CDATA `str`.
   */

  function cdata(str) {
    return '<![CDATA[' + escape(str) + ']]>';
  }
  // var SauceReporter = function(runner) {
  //   BaseReporter.call(this, runner);

  

  SauceReporter.prototype.__proto__ = BaseReporter.prototype;

  return SauceReporter;
};
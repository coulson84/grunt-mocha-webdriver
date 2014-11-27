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
  

  var SauceReporter = function(runner) {
    BaseReporter.call(this, runner);
    var stats = stats || this.stats,
      
      self = this;

      total += 1;

    runner.on('pending', function(test) {
      tests.push(test);
    });

    runner.on('test end', function() {
      numberTests++;
    });

    runner.on('pass', function(test) {
      passes++;
      test.browser = browser.browserTitle;
      tests.push(test);
    });

    runner.on('fail', function(test) {
      failures++;
      test.browser = browser.browserTitle;
      failInfo[runner.suite.title] = failInfo[runner.suite.title] || [];
      failInfo[runner.suite.title].push(e.title + (e.err.message ? (': ' + e.err.message) : ''));
      tests.push(test);
    });

    runner.on('end', function() {
      complete += 1;

      if(browser.mode==='saucelabs') {
        browser.sauceJobStatus(failures === 0);
      }

      if(complete!==total) {
        return;
      }
      console.log(tag('testsuite', {
        name: 'Mocha Tests',
        tests: stats.tests,
        failures: stats.failures,
        errors: stats.failures,
        skipped: stats.tests - stats.failures - stats.passes,
        timestamp: (new Date).toUTCString(),
        time: (stats.duration / 1000) || 0,
        browser: browser.browserTitle
      }, false));

      tests.forEach(test);
      console.log('</testsuite>');
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

  //   var self = this;
  //   var stats = this.stats;
  //   var numberTests = 0;
  //   var passes = 0;
  //   var failures = 0;
  //   var failInfo = {};
  //   var i;

  //   runner.on('test end', function() {
  //     numberTests++;
  //   });

  //   runner.on('pass', function() {
  //     passes++;
  //   });
  //   runner.on('fail', function(e) {
  //     failures++;
  //     failInfo[runner.suite.title] = failInfo[runner.suite.title] || [];
  //     failInfo[runner.suite.title].push(e.title + (e.err.message ? (': ' + e.err.message) : ''));
  //   });

  //   runner.on('end', function() {
  //     console.log();
  //     console.log('Tests complete for ' + browser.browserTitle);
  //     console.log(color('bright pass', '%d %s'), numberTests, 'tests run.');
  //     if (passes) {
  //       console.log(color('green', '%d %s'), passes, 'tests passed.');
  //     }
  //     if (failures) {
  //       console.log(color('fail', '%d %s'), failures, 'tests failed.');
  //       for (var i in failInfo) {
  //         console.log(color('fail', i + '\n\t' + failInfo[i].join('\n\t')));
  //       }
  //     }
  //     if (browser.mode === 'saucelabs') {
  //       console.log('Test video at: http://saucelabs.com/tests/' + browser.sessionID);
  //     }
  //     console.log();
  //   });
  // };

  SauceReporter.prototype.__proto__ = BaseReporter.prototype;

  return SauceReporter;
};
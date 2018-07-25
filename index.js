var fs = require('fs');
var util = require('util');

var LOGS_DIR = process.env.LOGS_DIR || '/tmp/logs';

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
}

var p = function (id) {
    return LOGS_DIR + '/' + id + '.log';
};

var serialize = function (value) {
  if (typeof value === 'string' || value instanceof String) {
    return value;
  }
  if (typeof value === 'number' || value instanceof Number) {
    return value;
  }
  if (typeof value === 'boolean' || value instanceof Boolean) {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Error) {
    return '\'' + value.stack.replace(/\n/g, '\\n') + '\'';
  }
  return JSON.stringify(value);
}

var suffix = function (args) {
  var error;
  var second = args.shift();
  length = args.length;
  if (length) {
    error = args[length - 1]
    error = error instanceof Error ? args.pop() : null;
  } else if (second instanceof Error) {
    error = second;
    second = null;
  }
  var suffix = '';
  if (error) {
    suffix += ' error=' + serialize(error);
  }
  if (!second) {
    return suffix;
  }
  var index = 0;
  if (typeof second === 'string' || second instanceof String) {
    second = second.replace(/:/g, '=');
    suffix = util.format.apply(util, [second].concat(args)) + suffix;
    return ' ' + suffix;
  }
  var prefix = '';

  var prefix = '';
  Object.keys(second).forEach(function (key) {
    var value = second[key];
    prefix += ' ' + key + '=' + serialize(second[key]);
  });

  return prefix + suffix;
}

var build = function (log, args) {
  args = Array.prototype.slice.call(args);
  var first = args.shift();
  var splits = first.split(':');
  var group = splits[0];
  var action = splits[1];
  return util.format(' module=%s group=%s action=%s%s', log.name, group, action, suffix(args));
};

var time = function(message) {
  return new Date().toISOString() + ' ' + message;
};

var Log = function (name) {
    this.name = name;
};

Log.prototype.debug = function () {
    console.info(time('level=debug' + build(this, arguments)));
};

Log.prototype.info = function () {
    console.info(time('level=info' + build(this, arguments)));
};

Log.prototype.warn = function () {
    console.info(time('level=warn' + build(this, arguments)));
};

Log.prototype.error = function () {
    console.info(time('level=error' + build(this, arguments)));
};

Log.prototype.fatal = function (err) {
    console.info(time('level=fatal' + build(this, arguments)));
};

Log.prototype.trace = function (err) {
    console.info(err.stack);
};


module.exports = function (name) {
    return new Log(name);
    /*switch (type) {
     case 'error':
     debug('error stream : ' + p(id + '-errors'));
     return fs.createWriteStream(p(id + '-errors'));
     default:
     debug('console stream : ' + p(id));
     return fs.createWriteStream(p(id));
     }*/
};
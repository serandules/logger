var fs = require('fs');
var util = require('util');
var nconf = require('nconf');

var logFormat = nconf.get('LOG_FORMAT');

var LOGS_DIR = process.env.LOGS_DIR || '/tmp/logs';

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

var formatters = {
  JSON: function (o) {
    return o;
  },
  KV: function (o) {
    var entry = '';
    Object.keys(o).forEach(function (key) {
      entry += entry ? ' ' : '';
      var value = o[key];
      if (key === 'time') {
        value = new Date(value).toISOString();
        entry += value;
        return;
      }
      entry += key + ':' + value;
    })
    return entry;
  }
};

var p = function (id) {
  return LOGS_DIR + '/' + id + '.log';
};

var format = formatters[logFormat];

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

var extra = function (o, args) {
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
  if (error) {
    o.error = serialize(error);
  }
  if (!second) {
    return o;
  }
  var pairs;
  var index = 0;
  if (typeof second === 'string' || second instanceof String) {
    pairs = second.split(' ');
    pairs.forEach(function (pair) {
      var kv = pair.split(':');
      var key = kv[0];
      var value = kv[1];
      if (value.indexOf('%') === 0) {
        value = serialize(args.shift());
      }
      o[key] = value;
    })
    return o;
  }

  Object.keys(second).forEach(function (key) {
    o[key] = serialize(second[key])
  });

  return o;
}

var build = function (log, level, args) {
  args = Array.prototype.slice.call(args);
  var first = args.shift();
  var splits = first.split(':');
  var group = splits[0];
  var action = splits[1];
  var o = {
    time: Date.now(),
    level: level,
    module: log.name,
    group: group,
    action: action
  };
  o = extra(o, args);
  return format(o);
};

var time = function (message) {
  return new Date().toISOString() + ' ' + message;
};

var Log = function (name) {
  this.name = name;
};

Log.prototype.debug = function () {
  console.info(build(this, 'debug', arguments));
};

Log.prototype.info = function () {
  console.info(build(this, 'info', arguments));
};

Log.prototype.warn = function () {
  console.info(build(this, 'warn', arguments));
};

Log.prototype.error = function () {
  console.error(build(this, 'error', arguments));
};

Log.prototype.fatal = function (err) {
  console.error(build(this, 'fatal', arguments));
};

Log.prototype.trace = function (err) {
  console.info(err.stack);
};


module.exports = function (name) {
  return new Log(name);
};
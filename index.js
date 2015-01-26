var debug = require('debug')('serandules:logger');
var fs = require('fs');
var stream = require('stream');
var utils = require('utils');

var LOGS_DIR = process.env.LOGS_DIR || '/tmp/logs';

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
}

var p = function (id) {
    return LOGS_DIR + '/' + id + '.log';
};

var build = function (log, args) {
    args = Array.prototype.slice.call(args);
    var index = 1;
    var o = args[0];
    o = (typeof o === 'string' || o instanceof String) ? o : JSON.stringify(o);
    o = o.replace(/%([a-z%])/g, function (match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%%') return match;
        return args[index++];
    });
    return log.name + ':' + o;
};

var Log = function (name) {
    this.name = name;
};

Log.prototype.debug = function () {
    console.info(build(this, arguments));
};

Log.prototype.info = function () {
    console.info(build(this, arguments));
};

Log.prototype.warn = function () {
    console.info(build(this, arguments));
};

Log.prototype.error = function () {
    console.info(build(this, arguments));
};

Log.prototype.trace = function (err) {
    console.trace(err.stack);
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
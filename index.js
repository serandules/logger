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

module.exports = function (id, type) {
    switch (type) {
        case 'error':
            debug('error stream : ' + p(id + '-errors'));
            return fs.createWriteStream(p(id + '-errors'));
        default:
            debug('console stream : ' + p(id));
            return fs.createWriteStream(p(id));
    }
};
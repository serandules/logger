var fs = require('fs');
var stream = require('stream');

var LOGS_DIR = process.env.LOGS_DIR || __dirname + '/tmp';

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
}

var p = function (id) {
    id = 'common';
    return LOGS_DIR + '/' + id + '.log';
};

module.exports = function (id, type) {
    switch (type) {
        case 'error':
            console.log('error stream : ' + p(id + '-errors'));
            return fs.createWriteStream(p(id + '-errors'));
        default:
            console.log('console stream : ' + p(id));
            return fs.createWriteStream(p(id));
    }
};
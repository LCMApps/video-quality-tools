'use strict';

const {EventEmitter} = require('events');

const proxyquire = require('proxyquire');

const correctPath = '/correct/path';

const FramesMonitor = proxyquire('src/FramesMonitor', {
    fs: {
        accessSync(filePath) {
            if (filePath !== correctPath) {
                throw new Error('no such file or directory');
            }
        }
    }
});

const correctUrl = 'rtmp://localhost:1935/myapp/mystream';

const childProcess  = new EventEmitter();
childProcess.stdout = new EventEmitter();
childProcess.stderr = new EventEmitter();
childProcess.kill   = () => {};

module.exports = {
    correctPath,
    correctUrl,
    FramesMonitor,
    childProcess
};

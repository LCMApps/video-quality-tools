'use strict';

const {EventEmitter} = require('events');

const proxyquire = require('proxyquire');

const path = '/correct/path';
const url  = 'rtmp://localhost:1935/myapp/mystream';

const FramesMonitor = proxyquire('src/FramesMonitor', {
    fs: {
        accessSync(filePath) {
            if (filePath !== path) {
                throw new Error('no such file or directory');
            }
        }
    }
});

function makeChildProcess() {
    const childProcess  = new EventEmitter();
    childProcess.stdout = new EventEmitter();
    childProcess.stderr = new EventEmitter();
    childProcess.kill   = () => {};

    return childProcess;
}

function makeFramesReducer() {
    return Object.assign(Object.create(new EventEmitter()), {
        process() {},
        reset() {}
    });
}

module.exports = {
    path,
    url,
    FramesMonitor,
    makeChildProcess,
    makeFramesReducer
};

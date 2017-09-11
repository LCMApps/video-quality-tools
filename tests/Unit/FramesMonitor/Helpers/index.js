'use strict';

const {EventEmitter} = require('events');

const proxyquire = require('proxyquire');

const ffprobePath            = '/correct/path';
const bufferMaxLengthInBytes = 2 ** 20;
const timeoutInSec           = 1;
const url                    = 'rtmp://localhost:1935/myapp/mystream';


const FramesMonitor = proxyquire('src/FramesMonitor', {
    fs: {
        accessSync(filePath) {
            if (filePath !== ffprobePath) {
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

module.exports = {
    config: {
        ffprobePath,
        timeoutInSec,
        bufferMaxLengthInBytes,
    },
    url,
    FramesMonitor,
    makeChildProcess
};

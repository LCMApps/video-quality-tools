'use strict';

const proxyquire = require('proxyquire');
const sinon      = require('sinon');
const {assert}   = require('chai');

const {config, url} = require('./Helpers');

function getSpawnArguments(url, timeoutInSec, errorLevel) {
    return [
        '-hide_banner',
        '-v',
        errorLevel,
        '-fflags',
        'nobuffer',
        '-rw_timeout',
        timeoutInSec,
        '-show_frames',
        '-show_entries',
        'frame=pkt_size,pkt_pts_time,media_type,pict_type,key_frame,width,height',
        '-i',
        url
    ];
}

describe('FramesMonitor::_handleProcessingError', () => {
    const expectedFfprobePath      = config.ffprobePath;
    const expectedFfprobeArguments = getSpawnArguments(url, config.timeoutInSec, config.errorLevel);

    it('must returns child process object just fine', () => {
        const expectedOutput = {cp: true};

        const spawn    = () => expectedOutput;
        const spySpawn = sinon.spy(spawn);

        const FramesMonitor = proxyquire('src/FramesMonitor', {
            fs           : {
                accessSync(filePath) {
                    if (filePath !== config.ffprobePath) {
                        throw new Error('no such file or directory');
                    }
                }
            },
            child_process: {
                spawn: spySpawn
            }
        });

        const framesMonitor = new FramesMonitor(config, url);

        const spyOnProcessStartError = sinon.spy(framesMonitor, '_onProcessStartError');

        const result = framesMonitor._runShowFramesProcess();

        assert.strictEqual(result, expectedOutput);

        assert.isTrue(spySpawn.calledOnce);
        assert.isTrue(
            spySpawn.calledWithExactly(expectedFfprobePath, expectedFfprobeArguments)
        );

        assert.isTrue(spyOnProcessStartError.notCalled);
    });

    it('must re-thrown TypeError error from the spawn call', () => {
        const expectedError = new TypeError('some error');

        const spawn = () => {
            throw expectedError;
        };

        const spySpawn = sinon.spy(spawn);

        const FramesMonitor = proxyquire('src/FramesMonitor', {
            fs           : {
                accessSync(filePath) {
                    if (filePath !== config.ffprobePath) {
                        throw new Error('no such file or directory');
                    }
                }
            },
            child_process: {
                spawn: spySpawn
            }
        });

        const framesMonitor = new FramesMonitor(config, url);

        const spyOnProcessStartError = sinon.spy(framesMonitor, '_onProcessStartError');

        assert.throws(() => {
            framesMonitor._runShowFramesProcess();
        }, TypeError, expectedError.message);

        assert.isTrue(spySpawn.calledOnce);
        assert.isTrue(
            spySpawn.calledWithExactly(expectedFfprobePath, expectedFfprobeArguments)
        );

        assert.isTrue(spyOnProcessStartError.notCalled);
    });

    it('must call FramesMonitor::_onProcessStartError method if error type is not TypeError', () => {
        const expectedError = new EvalError('some error');

        const spawn = () => {
            throw expectedError;
        };

        const spySpawn = sinon.spy(spawn);

        const FramesMonitor = proxyquire('src/FramesMonitor', {
            fs           : {
                accessSync(filePath) {
                    if (filePath !== config.ffprobePath) {
                        throw new Error('no such file or directory');
                    }
                }
            },
            child_process: {
                spawn: spySpawn
            }
        });

        const framesMonitor = new FramesMonitor(config, url);

        const spyOnProcessStartError = sinon.spy(framesMonitor, '_onProcessStartError');

        framesMonitor._runShowFramesProcess();

        assert.isTrue(spySpawn.calledOnce);
        assert.isTrue(
            spySpawn.calledWithExactly(expectedFfprobePath, expectedFfprobeArguments)
        );

        assert.isTrue(spyOnProcessStartError.calledOnce);
        assert.isTrue(spyOnProcessStartError.calledWithExactly(expectedError));
    });
});

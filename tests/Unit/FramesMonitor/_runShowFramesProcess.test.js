'use strict';

const proxyquire = require('proxyquire');
const sinon      = require('sinon');
const {assert}   = require('chai');

const {config, url} = require('./Helpers');

function getSpawnArguments(url, timeoutInMs, analyzeDurationInMs, errorLevel) {
    const args = [
        '-hide_banner',
        '-v',
        errorLevel,
        '-fflags',
        'nobuffer',
        '-rw_timeout',
        timeoutInMs * 1000,
        '-show_frames',
        '-show_entries',
        'frame=pkt_size,pkt_pts_time,media_type,pict_type,key_frame,width,height',
    ];

    if (analyzeDurationInMs) {
        args.push('-analyzeduration', analyzeDurationInMs * 1000);
    }

    args.push('-i', url);

    return args;
}

describe('FramesMonitor::_handleProcessingError', () => {
    const expectedFfprobePath      = config.ffprobePath;
    const expectedFfprobeArguments = getSpawnArguments(
        url, config.timeoutInMs, config.analyzeDurationInMs, config.errorLevel
    );

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

    it('must returns child process object just fine with default analyze duration', () => {
        const analyzeDurationInMs = undefined;

        const expectedOutput = {cp: true};
        const expectedFfprobeArguments = getSpawnArguments(
            url, config.timeoutInMs, analyzeDurationInMs, config.errorLevel
        );

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

        const options = Object.assign({}, config, {analyzeDurationInMs});

        const framesMonitor = new FramesMonitor(options, url);

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

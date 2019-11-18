'use strict';

const {assert}   = require('chai');
const sinon      = require('sinon');
const dataDriven = require('data-driven');

const Errors = require('src/Errors/');

const {config, url, FramesMonitor} = require('./Helpers');

const testData = require('./constructor.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('FramesMonitor::constructor', () => {
    let spyAssertExecutable;

    beforeEach(() => {
        spyAssertExecutable = sinon.spy(FramesMonitor, '_assertExecutable');
    });

    afterEach(() => {
        spyAssertExecutable.restore();
    });

    dataDriven(
        testData.incorrectConfig.map(item => ({type: typeOf(item), config: item})),
        () => {
            it('config param has invalid ({type}) type', ctx => {
                assert.throws(() => {
                    new FramesMonitor(ctx.config, url);
                }, TypeError, 'Config param should be a plain object, bastard.');

                assert.isTrue(spyAssertExecutable.notCalled);
            });
        }
    );

    dataDriven(
        testData.incorrectUrl.map(item => ({type: typeOf(item), url: item})),
        () => {
            it('url param has invalid ({type}) type', ctx => {
                const config = {};

                assert.throws(() => {
                    new FramesMonitor(config, ctx.url);
                }, TypeError, 'You should provide a correct url, bastard.');

                assert.isTrue(spyAssertExecutable.notCalled);
            });
        }
    );

    dataDriven(
        testData.incorrectFfprobePath.map(item => ({type: typeOf(item), ffprobePath: item})),
        () => {
            it('config.ffprobePath param has invalid ({type}) type', ctx => {
                const incorrectConfig = Object.assign({}, config, {
                    ffprobePath: ctx.ffprobePath
                });

                assert.throws(() => {
                    new FramesMonitor(incorrectConfig, url);
                }, Error.ConfigError, 'You should provide a correct path to ffprobe, bastard.');

                assert.isTrue(spyAssertExecutable.notCalled);
            });
        }
    );

    dataDriven(
        testData.incorrectAnalyzeDurationMs.map(item => ({type: typeOf(item), analyzeDurationMs: item})),
        () => {
            it('config.analyzeDurationMs param has invalid ({type}) type', ctx => {
                const incorrectConfig = Object.assign({}, config, {
                    analyzeDurationMs: ctx.analyzeDurationMs
                });

                assert.throws(() => {
                    new FramesMonitor(incorrectConfig, url);
                }, Error.ConfigError, 'You should provide a correct analyze duration, bastard.');

                assert.isTrue(spyAssertExecutable.notCalled);
            });
        }
    );

    dataDriven(
        testData.incorrectBufferMaxLengthInBytes.map(item => ({type: typeOf(item), bufferMaxLengthInBytes: item})),
        () => {
            it('config.bufferMaxLengthInBytes param has invalid ({type}) type', ctx => {
                const incorrectConfig = Object.assign({}, config, {
                    bufferMaxLengthInBytes: ctx.bufferMaxLengthInBytes
                });

                assert.throws(() => {
                    new FramesMonitor(incorrectConfig, url);
                }, Error.ConfigError, 'bufferMaxLengthInBytes param should be a positive integer.');

                assert.isTrue(spyAssertExecutable.notCalled);
            });
        }
    );

    dataDriven(
        testData.incorrectErrorLevel.map(item => ({type: typeOf(item), errorLevel: item})),
        () => {
            it('config.errorLevel param has invalid ({type}) type', ctx => {
                const incorrectConfig = Object.assign({}, config, {
                    errorLevel: ctx.errorLevel
                });

                assert.throws(() => {
                    new FramesMonitor(incorrectConfig, url);
                }, Error.ConfigError, 'You should provide correct error level, bastard. Check ffprobe documentation.');

                assert.isTrue(spyAssertExecutable.notCalled);
            });
        }
    );

    dataDriven(
        testData.incorrectExitProcessGuardTimeoutInMs.map(item => ({
            type                       : typeOf(item),
            exitProcessGuardTimeoutInMs: item
        })),
        () => {
            it('config.exitProcessGuardTimeoutInMs param has invalid ({type}) type', ctx => {
                const incorrectConfig = Object.assign({}, config, {
                    exitProcessGuardTimeoutInMs: ctx.exitProcessGuardTimeoutInMs
                });

                assert.throws(() => {
                    new FramesMonitor(incorrectConfig, url);
                }, Error.ConfigError, 'exitProcessGuardTimeoutInMs param should be a positive integer.');

                assert.isTrue(spyAssertExecutable.notCalled);
            });
        }
    );

    dataDriven(testData.incorrectConfigObject, () => {
        it('{description}', ctx => {
            const incorrectConfig = Object.assign({}, config, ctx.config);

            assert.throws(() => {
                new FramesMonitor(incorrectConfig, url);
            }, Errors.ConfigError, ctx.errorMsg);

            assert.isTrue(spyAssertExecutable.notCalled);
        });
    });

    it('config.ffprobePath points to incorrect path', () => {
        const ffprobeIncorrectPath = `/incorrect/path/${config.ffprobePath}`;

        assert.throws(() => {
            const incorrectConfig = Object.assign({}, config, {
                ffprobePath: ffprobeIncorrectPath
            });

            new FramesMonitor(incorrectConfig, url);
        }, Errors.ExecutablePathError);

        assert.isTrue(spyAssertExecutable.calledOnce);
        assert.isTrue(spyAssertExecutable.calledWithExactly(ffprobeIncorrectPath));
    });

    it('all params are good', () => {
        const expectedChildProcessDefaultValue   = null;
        const expectedChunkRemainderDefaultValue = '';
        const expectedStderrOutputs              = [];

        const framesMonitor = new FramesMonitor(config, url);

        assert.isTrue(spyAssertExecutable.calledOnce);
        assert.isTrue(spyAssertExecutable.calledWithExactly(config.ffprobePath));

        assert.deepEqual(framesMonitor._config, config);
        assert.strictEqual(framesMonitor._url, url);

        assert.strictEqual(framesMonitor._cp, expectedChildProcessDefaultValue);
        assert.strictEqual(framesMonitor._chunkRemainder, expectedChunkRemainderDefaultValue);
        assert.deepEqual(framesMonitor._stderrOutputs, expectedStderrOutputs);
    });

    it('all params are good and analyzeDurationMs === undefined', () => {
        const expectedChildProcessDefaultValue   = null;
        const expectedChunkRemainderDefaultValue = '';
        const expectedStderrOutputs              = [];

        const configClone = JSON.parse(JSON.stringify(config));
        configClone.analyzeDurationMs = undefined;

        const framesMonitor = new FramesMonitor(configClone, url);

        assert.isTrue(spyAssertExecutable.calledOnce);
        assert.isTrue(spyAssertExecutable.calledWithExactly(config.ffprobePath));

        assert.deepEqual(framesMonitor._config, configClone);
        assert.strictEqual(framesMonitor._url, url);

        assert.strictEqual(framesMonitor._cp, expectedChildProcessDefaultValue);
        assert.strictEqual(framesMonitor._chunkRemainder, expectedChunkRemainderDefaultValue);
        assert.deepEqual(framesMonitor._stderrOutputs, expectedStderrOutputs);
    });

});

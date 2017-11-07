'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const ExitReasons = require('src/ExitReasons');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onProcessStartError', () => {
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;

    let spyOnCpRemoveAllListeners;
    let spyOnCpStdoutRemoveAllListeners;
    let spyOnCpStderrRemoveAllListeners;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);

        spyOnCpRemoveAllListeners       = sinon.spy(childProcess, 'removeAllListeners');
        spyOnCpStdoutRemoveAllListeners = sinon.spy(childProcess.stdout, 'removeAllListeners');
        spyOnCpStderrRemoveAllListeners = sinon.spy(childProcess.stderr, 'removeAllListeners');

        framesMonitor.listen();
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();

        spyOnCpRemoveAllListeners.restore();
        spyOnCpStdoutRemoveAllListeners.restore();
        spyOnCpStderrRemoveAllListeners.restore();
    });

    it('must emit processStartError on call and doesn\'t remove listeners from child process cuz it\'s null', done => {
        const originalError = new Error('original, but not enough');

        const expectedErrorMessage      = `${config.ffprobePath} process could not be started.`;
        const expectedChildProcessValue = null;

        // explicitly set to null to test that no listeners will be removed
        framesMonitor._cp = expectedChildProcessValue;

        framesMonitor.on('exit', reason => {
            assert.isTrue(spyOnCpRemoveAllListeners.notCalled);
            assert.isTrue(spyOnCpStdoutRemoveAllListeners.notCalled);
            assert.isTrue(spyOnCpStderrRemoveAllListeners.notCalled);

            assert.strictEqual(framesMonitor._cp, expectedChildProcessValue);

            assert.instanceOf(reason, ExitReasons.StartError);

            assert.strictEqual(reason.payload.error.message, expectedErrorMessage);
            assert.strictEqual(reason.payload.error.extra.url, url);
            assert.strictEqual(reason.payload.error.extra.error, originalError);

            // done is used in order to check that exactly exit event has been emitted
            done();
        });

        framesMonitor._onProcessStartError(originalError);
    });

    it('must emit processStartError on call and remove all listeners from the child process', done => {
        const originalError = new Error('original, but not enough');

        const expectedErrorMessage      = `${config.ffprobePath} process could not be started.`;
        const expectedChildProcessValue = null;

        framesMonitor.on('exit', reason => {
            assert.isTrue(spyOnCpRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnCpRemoveAllListeners.calledWithExactly());

            assert.isTrue(spyOnCpStdoutRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnCpStdoutRemoveAllListeners.calledWithExactly());

            assert.isTrue(spyOnCpStderrRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnCpStderrRemoveAllListeners.calledWithExactly());

            assert.strictEqual(framesMonitor._cp, expectedChildProcessValue);

            assert.instanceOf(reason, ExitReasons.StartError);

            assert.strictEqual(reason.payload.error.message, expectedErrorMessage);
            assert.strictEqual(reason.payload.error.extra.url, url);
            assert.strictEqual(reason.payload.error.extra.error, originalError);

            done();
        });

        framesMonitor._onProcessStartError(originalError);
    });
});

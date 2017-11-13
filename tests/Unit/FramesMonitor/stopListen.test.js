'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');
const Errors   = require('src/Errors');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::stopListen', () => {
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnCpRemoveAllListeners;
    let spyOnCpStdoutRemoveAllListeners;
    let spyOnCpStderrRemoveAllListeners;

    let spySetTimeout;
    let spyCleanTimeout;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess             = makeChildProcess();
        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);

        spyOnCpRemoveAllListeners       = sinon.spy(childProcess, 'removeAllListeners');
        spyOnCpStdoutRemoveAllListeners = sinon.spy(childProcess.stdout, 'removeAllListeners');
        spyOnCpStderrRemoveAllListeners = sinon.spy(childProcess.stderr, 'removeAllListeners');

        spySetTimeout   = sinon.spy(global, 'setTimeout');
        spyCleanTimeout = sinon.spy(global, 'clearTimeout');
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();

        spyOnCpRemoveAllListeners.restore();
        spyOnCpStdoutRemoveAllListeners.restore();
        spyOnCpStderrRemoveAllListeners.restore();

        spySetTimeout.restore();
        spyCleanTimeout.restore();
    });

    it('must just resolve when try to stop listen before start listening', async () => {
        const expectedResult = undefined;

        const spyOnKill = sinon.spy(childProcess, 'kill');

        const result = await framesMonitor.stopListen();

        assert.strictEqual(result, expectedResult);

        assert.isTrue(spyOnKill.notCalled);

        assert.isTrue(spyOnCpRemoveAllListeners.notCalled);
        assert.isTrue(spyOnCpStdoutRemoveAllListeners.notCalled);
        assert.isTrue(spyOnCpStderrRemoveAllListeners.notCalled);

        assert.isTrue(spySetTimeout.notCalled);
        assert.isTrue(spyCleanTimeout.notCalled);

        spyOnKill.restore();
    });

    it('must stop listen just fine', async () => {
        const expectedResult = {code: null, signal: 'SIGTERM'};

        const expectedSignal = 'SIGTERM';

        const spyOnKill = sinon.spy(childProcess, 'kill');

        framesMonitor.listen();

        const result = await framesMonitor.stopListen();

        assert.deepEqual(result, expectedResult);

        assert.isTrue(spyOnKill.calledOnce);
        assert.isTrue(spyOnKill.alwaysCalledWithExactly(expectedSignal));

        assert.isTrue(spyOnCpRemoveAllListeners.calledTwice);
        assert.isTrue(spyOnCpStdoutRemoveAllListeners.calledOnce);
        assert.isTrue(spyOnCpStderrRemoveAllListeners.calledOnce);

        assert.isTrue(spySetTimeout.calledOnce);
        assert.isTrue(spyCleanTimeout.calledOnce);

        assert.isNull(framesMonitor._cp);

        spyOnKill.restore();
    });

    it('must reject listen cuz ChildProcess::kill method emitted error event', async () => {
        const expectedError        = new EvalError('SIGTERM is not supported');
        const expectedErrorMessage = 'process exit error';
        const expectedSignal       = 'SIGTERM';

        const stubOnKill = sinon.stub(childProcess, 'kill').callsFake(() => {
            childProcess.emit('error', expectedError);
        });

        framesMonitor.listen();

        try {
            await framesMonitor.stopListen();
            assert.isTrue(false, 'stopListen must reject promise');
        } catch (err) {
            assert.instanceOf(err, Errors.ProcessExitError);
            assert.strictEqual(err.message, expectedErrorMessage);
            assert.strictEqual(err.extra.url, url);
            assert.strictEqual(err.extra.error, expectedError);

            assert.isTrue(stubOnKill.calledOnce);
            assert.isTrue(stubOnKill.alwaysCalledWithExactly(expectedSignal));

            assert.isTrue(spyOnCpRemoveAllListeners.calledTwice);
            assert.isTrue(spyOnCpStdoutRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnCpStderrRemoveAllListeners.calledOnce);

            assert.isTrue(spySetTimeout.notCalled);
            assert.isTrue(spyCleanTimeout.notCalled);

            assert.isNull(framesMonitor._cp);

            stubOnKill.restore();
        }
    });

    it('must reject listen cuz ChildProcess::kill method thrown an error', async () => {
        const expectedError        = new EvalError('SIGTERM is not supported');
        const expectedErrorMessage = 'process exit error';
        const expectedSignal       = 'SIGTERM';

        const stubOnKill = sinon.stub(childProcess, 'kill').throws(expectedError);

        framesMonitor.listen();
        try {
            await framesMonitor.stopListen();
            assert.isTrue(false, 'stopListen must reject promise');
        } catch (err) {
            assert.instanceOf(err, Errors.ProcessExitError);
            assert.strictEqual(err.message, expectedErrorMessage);
            assert.strictEqual(err.extra.url, url);
            assert.strictEqual(err.extra.error, expectedError);

            assert.isTrue(stubOnKill.calledOnce);
            assert.isTrue(stubOnKill.alwaysCalledWithExactly(expectedSignal));

            assert.isTrue(spyOnCpRemoveAllListeners.calledTwice);
            assert.isTrue(spyOnCpStdoutRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnCpStderrRemoveAllListeners.calledOnce);

            assert.isTrue(spySetTimeout.notCalled);
            assert.isTrue(spyCleanTimeout.notCalled);

            assert.isNull(framesMonitor._cp);

            stubOnKill.restore();
        }
    });

    it('must try to kill with SIGKILL if process has ignored SIGTERM', async function () {
        this.timeout(config.exitProcessGuardTimeoutInMs + 2000);

        const expectedResult = {code: null, signal: 'SIGKILL'};

        const stubOnKill = sinon.stub(childProcess, 'kill').callsFake(signal => {
            if (signal === 'SIGKILL') {
                return childProcess.emit('exit', null, 'SIGKILL');
            }
        });

        framesMonitor.listen();

        const result = await framesMonitor.stopListen();

        assert.deepEqual(result, expectedResult);

        assert.isTrue(stubOnKill.calledTwice);
        assert(stubOnKill.getCall(0).calledWithExactly('SIGTERM'));
        assert(stubOnKill.getCall(1).calledWithExactly('SIGKILL'));

        assert.isTrue(spyOnCpRemoveAllListeners.calledTwice);
        assert.isTrue(spyOnCpStdoutRemoveAllListeners.calledOnce);
        assert.isTrue(spyOnCpStderrRemoveAllListeners.calledOnce);

        assert.isTrue(spySetTimeout.calledOnce);
        assert.isTrue(spyCleanTimeout.calledOnce);

        assert.isNull(framesMonitor._cp);

        stubOnKill.restore();
    });

    it('must resolve just okay during the second stop listen in a row', async () => {
        const expectedSignal  = 'SIGTERM';
        const expectedResult1 = {code: null, signal: expectedSignal};
        const expectedResult2 = undefined;

        const spyOnKill = sinon.spy(childProcess, 'kill');

        framesMonitor.listen();

        const result1 = await framesMonitor.stopListen();
        const result2 = await framesMonitor.stopListen();

        assert.deepEqual(result1, expectedResult1);
        assert.strictEqual(result2, expectedResult2);

        assert.isTrue(spyOnKill.calledOnce);
        assert.isTrue(spyOnKill.alwaysCalledWithExactly(expectedSignal));

        assert.isTrue(spyOnCpRemoveAllListeners.calledTwice);
        assert.isTrue(spyOnCpStdoutRemoveAllListeners.calledOnce);
        assert.isTrue(spyOnCpStderrRemoveAllListeners.calledOnce);

        assert.isTrue(spySetTimeout.calledOnce);
        assert.isTrue(spyCleanTimeout.calledOnce);

        assert.isNull(framesMonitor._cp);

        spyOnKill.restore();
    });
});

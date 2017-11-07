'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const ExitReasons = require('src/ExitReasons');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onExit', () => {
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnRemoveAllListeners;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);

        framesMonitor.listen();

        spyOnRemoveAllListeners = sinon.spy(framesMonitor._cp, 'removeAllListeners');
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyOnRemoveAllListeners.restore();
    });

    it('must emit exit event with correct reason type ExternalSignal', done => {
        const exitCode   = null;
        const exitSignal = 'SIGTERM';

        framesMonitor.on('exit', reason => {
            assert.instanceOf(reason, ExitReasons.ExternalSignal);

            assert.strictEqual(reason.payload.signal, exitSignal);

            assert.isTrue(spyOnRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnRemoveAllListeners.calledWithExactly());

            assert.isNull(framesMonitor._cp);

            // done is used in order to check that exactly exit event has been emitted
            done();
        });

        framesMonitor._onExit(exitCode, exitSignal);
    });

    it('must emit exit event with correct reason type NormalExit', done => {
        const exitCode   = 0;
        const exitSignal = null;

        framesMonitor.on('exit', reason => {
            assert.instanceOf(reason, ExitReasons.NormalExit);

            assert.strictEqual(reason.payload.code, exitCode);

            assert.isTrue(spyOnRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnRemoveAllListeners.calledWithExactly());

            assert.isNull(framesMonitor._cp);

            done();
        });

        framesMonitor._onExit(exitCode, exitSignal);
    });

    it('must emit exit event with correct reason type AbnormalExit (and no stderr output)', done => {
        const exitCode   = 1;
        const exitSignal = null;

        const expectedStderrOutput = '';

        framesMonitor.on('exit', reason => {
            assert.instanceOf(reason, ExitReasons.AbnormalExit);

            assert.strictEqual(reason.payload.code, exitCode);
            assert.strictEqual(reason.payload.stderrOutput, expectedStderrOutput);

            assert.isTrue(spyOnRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnRemoveAllListeners.calledWithExactly());

            assert.isNull(framesMonitor._cp);

            done();
        });

        framesMonitor._onExit(exitCode, exitSignal);
    });

    it('must emit exit event with correct reason type AbnormalExit (with stderr output)', done => {
        const exitCode   = 1;
        const exitSignal = null;

        framesMonitor._stderrOutputs = [
            'error1',
            'error2',
            'error3'
        ];

        const expectedStderrOutput = 'error1\nerror2\nerror3';

        framesMonitor.on('exit', reason => {
            assert.instanceOf(reason, ExitReasons.AbnormalExit);

            assert.strictEqual(reason.payload.code, exitCode);
            assert.strictEqual(reason.payload.stderrOutput, expectedStderrOutput);

            assert.isTrue(spyOnRemoveAllListeners.calledOnce);
            assert.isTrue(spyOnRemoveAllListeners.calledWithExactly());

            assert.isNull(framesMonitor._cp);

            done();
        });

        framesMonitor._onExit(exitCode, exitSignal);
    });
});

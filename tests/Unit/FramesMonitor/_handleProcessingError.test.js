'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const ExitReasons = require('src/ExitReasons');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_handleProcessingError', () => {
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);

        framesMonitor.listen();
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
    });

    it('must call `exit` event after correct stopListen call', async () => {
        const expectedError = new Error('super puper bad error');

        const stubStopListen = sinon.stub(framesMonitor, 'stopListen').resolves();
        const spyOnExit      = sinon.spy();
        const spyOnError     = sinon.spy();

        framesMonitor.on('error', spyOnError);
        framesMonitor.on('exit', spyOnExit);

        await framesMonitor._handleProcessingError(expectedError);

        assert.isTrue(stubStopListen.calledOnce);
        assert.isTrue(stubStopListen.calledWithExactly());

        assert.isTrue(spyOnError.notCalled);
        assert.isTrue(spyOnExit.calledOnce);

        const errorObjectOnExit = spyOnExit.getCall(0).args[0];
        assert.instanceOf(errorObjectOnExit, ExitReasons.ProcessingError);
        assert.strictEqual(errorObjectOnExit.payload.error, expectedError);

        stubStopListen.restore();
    });

    it('must call `error` event right before `exit` one if stopListen rejected promise', async () => {
        const expectedError = new Error('super puper bad error');
        const rejectError   = new Error('reject error');

        const stubStopListen = sinon.stub(framesMonitor, 'stopListen').rejects(rejectError);
        const spyOnExit      = sinon.spy();
        const spyOnError     = sinon.spy();

        framesMonitor.on('error', spyOnError);
        framesMonitor.on('exit', spyOnExit);

        await framesMonitor._handleProcessingError(expectedError);

        assert.isTrue(stubStopListen.calledOnce);
        assert.isTrue(stubStopListen.calledWithExactly());

        assert.isTrue(spyOnError.calledOnce);
        assert.isTrue(spyOnExit.calledOnce);

        const errorObjectOnError = spyOnError.getCall(0).args[0];
        assert.strictEqual(errorObjectOnError, rejectError);

        const errorObjectOnExit = spyOnExit.getCall(0).args[0];
        assert.instanceOf(errorObjectOnExit, ExitReasons.ProcessingError);
        assert.strictEqual(errorObjectOnExit.payload.error, expectedError);

        sinon.assert.callOrder(spyOnError, spyOnExit);

        stubStopListen.restore();
    });
});

'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const Errors = require('src/Errors');

const {correctPath, correctUrl, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::stopListen', () => {

    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;

    let spyIsListening;
    let spyKill;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);

        childProcess             = makeChildProcess();
        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);

        spyIsListening = sinon.spy(framesMonitor, 'isListening');
        spyKill        = sinon.spy(childProcess, 'kill');
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();

        spyIsListening.restore();
        spyKill.restore();
    });

    it('must throw an exception when try to stop listen before start listening', () => {
        const expectedErrorType    = Errors.AlreadyStoppedListenError;
        const expectedErrorMessage = 'This service is already stopped.';

        try {
            framesMonitor.stopListen();
        } catch (err) {
            assert.isTrue(spyIsListening.calledOnce);
            assert.isTrue(spyIsListening.firstCall.calledWithExactly());

            assert.isTrue(spyKill.notCalled);

            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.isFalse(framesMonitor.isListening());
        }
    });

    it('must stop listen just fine', () => {
        framesMonitor.listen();
        framesMonitor.stopListen();

        assert.isTrue(spyIsListening.calledTwice);
        assert.isTrue(spyIsListening.firstCall.calledWithExactly());
        assert.isTrue(spyIsListening.secondCall.calledWithExactly());

        assert.isTrue(spyKill.calledOnce);
        assert.isTrue(spyKill.firstCall.calledWithExactly());

        assert.isFalse(framesMonitor.isListening());
    });

    it('must throw an exception when try to stop listen several times', () => {
        const expectedErrorType    = Errors.AlreadyStoppedListenError;
        const expectedErrorMessage = 'This service is already stopped.';

        framesMonitor.listen();
        framesMonitor.stopListen();

        try {
            framesMonitor.stopListen();
        } catch (err) {
            assert.isTrue(stubRunShowFramesProcess.calledOnce);
            assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

            assert.isTrue(spyIsListening.calledThrice);
            assert.isTrue(spyIsListening.firstCall.calledWithExactly());
            assert.isTrue(spyIsListening.secondCall.calledWithExactly());
            assert.isTrue(spyIsListening.thirdCall.calledWithExactly());

            assert.isTrue(spyKill.calledOnce);
            assert.isTrue(spyKill.firstCall.calledWithExactly());

            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.isFalse(framesMonitor.isListening());
        }
    });

});

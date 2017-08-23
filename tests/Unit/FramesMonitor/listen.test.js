'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const Errors = require('src/Errors');

const {correctPath, correctUrl, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::listen', () => {

    let framesMonitor;
    let childProcess;
    let stubRunShowFramesProcess;
    let spyIsListening;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);

        childProcess             = makeChildProcess();
        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);

        spyIsListening = sinon.spy(framesMonitor, 'isListening');
    });

    afterEach(() => {
        stubRunShowFramesProcess.reset();

        spyIsListening.restore();
    });

    it('must start listen just fine', () => {
        assert.doesNotThrow(() => {
            framesMonitor.listen();
        });

        assert.isTrue(spyIsListening.calledOnce);
        assert.isTrue(spyIsListening.firstCall.calledWithExactly());
        assert.isFalse(spyIsListening.firstCall.returnValue);

        assert.isTrue(stubRunShowFramesProcess.calledOnce);
        assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

        assert.isTrue(framesMonitor.isListening());
    });

    it('must throw an exception when try listen several times', () => {
        const expectedErrorType    = Errors.AlreadyListeningError;
        const expectedErrorMessage = 'You are already listening.';

        framesMonitor.listen();

        try {
            framesMonitor.listen();
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);
            assert.isUndefined(err.extra);

            assert.isTrue(spyIsListening.calledTwice);
            assert.isTrue(spyIsListening.firstCall.calledWithExactly());
            assert.isFalse(spyIsListening.firstCall.returnValue);
            assert.isTrue(spyIsListening.secondCall.calledWithExactly());
            assert.isTrue(spyIsListening.secondCall.returnValue);

            assert.isTrue(stubRunShowFramesProcess.calledOnce);
            assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

            assert.isTrue(framesMonitor.isListening());
        }
    });

    it('must set _onExit as a callback for child process exit event', () => {
        const spyOnExit = sinon.spy(framesMonitor, '_onExit');

        framesMonitor.listen();

        childProcess.emit('exit');

        assert.isTrue(spyOnExit.calledOnce);

        spyOnExit.restore();
    });

    it('must wrap and re-emit error emitted by the child process', done => {
        const expectedError = new Error('test error 123');

        framesMonitor.listen();

        childProcess.emit('error', expectedError);

        framesMonitor.on('error', err => {

            assert.instanceOf(err, Errors.ProcessError);

            assert.strictEqual(err.message, `${correctPath} process could not be spawned or just got an error.`);
            assert.strictEqual(err.extra.error.message, expectedError.message);
            assert.strictEqual(err.extra.url, correctUrl);

            done();
        });
    });

});

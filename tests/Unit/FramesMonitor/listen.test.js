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

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyIsListening           = sinon.spy(framesMonitor, 'isListening');
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
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

    it('must not call any callback, cuz they were not set during the listen call', () => {
        const spyOnExit               = sinon.spy(framesMonitor, '_onExit');
        const spyOnProcessError       = sinon.spy(framesMonitor, '_onProcessError');
        const spyOnProcessStreamError = sinon.spy(framesMonitor, '_onProcessStreamsError');
        const spyOnStderrData         = sinon.spy(framesMonitor, '_onStderrData');
        const spyOnStdoutChunk        = sinon.spy(framesMonitor, '_onStdoutChunk');

        childProcess.on('error', () => {
            // catch err to prevent throw exception
        });

        childProcess.stdout.on('error', () => {
            // catch err to prevent throw exception
        });

        childProcess.stderr.on('error', () => {
            // catch err to prevent throw exception
        });

        childProcess.emit('exit');
        childProcess.emit('error', new Error(1));
        childProcess.stdout.emit('error', new Error(1));
        childProcess.stderr.emit('error', new Error(1));
        childProcess.stderr.emit('data', 'worst possible error');
        childProcess.stdout.emit('data', '[FRAME]a=');

        assert.isTrue(spyOnExit.notCalled);
        assert.isTrue(spyOnProcessError.notCalled);
        assert.isTrue(spyOnProcessStreamError.notCalled);
        assert.isTrue(spyOnStderrData.notCalled);
        assert.isTrue(spyOnStdoutChunk.notCalled);

        spyOnExit.restore();
        spyOnProcessError.restore();
        spyOnProcessStreamError.restore();
        spyOnStderrData.restore();
        spyOnStdoutChunk.restore();
    });

    it('must set all appropriate callbacks for the child process during the listen call', () => {
        const spyOnExit               = sinon.spy(framesMonitor, '_onExit');
        const spyOnProcessError       = sinon.spy(framesMonitor, '_onProcessError');
        const spyOnProcessStreamError = sinon.spy(framesMonitor, '_onProcessStreamsError');
        const spyOnStderrData         = sinon.spy(framesMonitor, '_onStderrData');
        const spyOnStdoutChunk        = sinon.spy(framesMonitor, '_onStdoutChunk');

        framesMonitor.listen();

        childProcess.emit('exit');
        childProcess.emit('error', new Error(1));
        childProcess.stdout.emit('error', new Error(1));
        childProcess.stderr.emit('error', new Error(1));
        childProcess.stderr.emit('data', 'worst possible error');
        childProcess.stdout.emit('data', '[FRAME]a=');

        assert.isTrue(spyOnExit.calledOnce);
        assert.isTrue(spyOnProcessError.calledOnce);
        assert.isTrue(spyOnProcessStreamError.calledTwice);
        assert.isTrue(spyOnStderrData.calledOnce);
        assert.isTrue(spyOnStdoutChunk.calledOnce);

        spyOnExit.restore();
        spyOnProcessError.restore();
        spyOnProcessStreamError.restore();
        spyOnStderrData.restore();
        spyOnStdoutChunk.restore();
    });

});

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
        const expectedIsListening = true;

        assert.doesNotThrow(() => {
            framesMonitor.listen();
        });

        assert.isTrue(stubRunShowFramesProcess.calledOnce);
        assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

        assert.strictEqual(expectedIsListening, framesMonitor.isListening());
    });

    it('must throw an exception when try listen several times in a row', () => {
        const expectedIsListening  = true;
        const expectedErrorType    = Errors.AlreadyListeningError;
        const expectedErrorMessage = 'You are already listening.';

        framesMonitor.listen();

        try {
            framesMonitor.listen();
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);
            assert.isUndefined(err.extra);

            assert.isTrue(stubRunShowFramesProcess.calledOnce);
            assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());
        }
    });

    it('must set all appropriate callbacks for the child process during the listen call', done => {
        const spyOnStderr = sinon.spy();
        const spyOnFrame  = sinon.spy();
        const spyOnError  = sinon.spy();
        const spyOnExit   = sinon.spy();

        framesMonitor.listen();

        framesMonitor.on('frame', spyOnFrame);
        framesMonitor.on('stderr', spyOnStderr);
        framesMonitor.on('error', spyOnError);
        framesMonitor.on('exit', spyOnExit);

        childProcess.emit('exit');
        childProcess.emit('error', new Error(1));
        childProcess.stdout.emit('error', new Error(1));
        childProcess.stderr.emit('error', new Error(1));
        childProcess.stderr.emit('data', 'worst possible error');
        childProcess.stdout.emit('data', '[FRAME]a=b[/FRAME]');

        setImmediate(() => {
            assert.isTrue(spyOnExit.calledOnce);
            assert.isTrue(spyOnError.calledThrice);
            assert.isTrue(spyOnStderr.calledOnce);
            assert.isTrue(spyOnFrame.calledOnce);

            spyOnStderr.reset();
            spyOnFrame.reset();
            spyOnError.reset();
            spyOnExit.reset();

            done();
        });
    });

});

'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const Errors = require('src/Errors');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::listen', () => {

    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyIsListening;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyIsListening           = sinon.spy(framesMonitor, 'isListening');
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyIsListening.restore();
    });

    it('must start listen just fine', () => {
        framesMonitor.listen();

        assert.isTrue(spyIsListening.calledOnce);

        assert.isTrue(stubRunShowFramesProcess.calledOnce);
        assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

        assert.isDefined(framesMonitor._cp);
    });

    it('must throw an exception when try listen several times in a row', () => {
        const expectedErrorType    = Errors.AlreadyListeningError;
        const expectedErrorMessage = 'You are already listening.';

        framesMonitor.listen();

        try {
            framesMonitor.listen();
            assert.isTrue(false, 'listen must throw exception');
        } catch (err) {
            assert.isTrue(spyIsListening.calledTwice);

            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);
            assert.isUndefined(err.extra);

            assert.isTrue(stubRunShowFramesProcess.calledOnce);
            assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

            assert.isDefined(framesMonitor._cp);
        }
    });

    it('must correct set callback for exit event', () => {
        const expectedCode   = 1;
        const expectedSignal = 'SIGTERM';

        const stubOnExit = sinon.stub(framesMonitor, '_onExit');

        framesMonitor.listen();

        childProcess.emit('exit', expectedCode, expectedSignal);

        assert.isTrue(spyIsListening.calledOnce);

        assert.isDefined(framesMonitor._cp);

        assert.isTrue(stubOnExit.calledOnce);
        assert.isTrue(stubOnExit.calledWithExactly(expectedCode, expectedSignal));

        stubOnExit.restore();
    });

    it('must correct set callback for error event', () => {
        const expectedError = new Error('process start error');

        const stubOnProcessStartError = sinon.stub(framesMonitor, '_onProcessStartError');

        framesMonitor.listen();

        childProcess.emit('error', expectedError);

        assert.isTrue(spyIsListening.calledOnce);

        assert.isDefined(framesMonitor._cp);

        assert.isTrue(stubOnProcessStartError.calledOnce);
        assert.isTrue(stubOnProcessStartError.calledWithExactly(expectedError));

        stubOnProcessStartError.restore();
    });

    it('must correct set callback for stdout stream error event', () => {
        const expectedError = new Error('stdout stream error');

        const stubOnProcessStdoutStreamError = sinon.stub(framesMonitor, '_onProcessStdoutStreamError');

        framesMonitor.listen();

        childProcess.stdout.emit('error', expectedError);

        assert.isTrue(spyIsListening.calledOnce);

        assert.isDefined(framesMonitor._cp);

        assert.isTrue(stubOnProcessStdoutStreamError.calledOnce);
        assert.isTrue(stubOnProcessStdoutStreamError.calledWithExactly(expectedError));

        stubOnProcessStdoutStreamError.restore();
    });

    it('must correct set callback for stderr stream error event', () => {
        const expectedError = new Error('stderr stream error');

        const stubOnProcessStderrStreamError = sinon.stub(framesMonitor, '_onProcessStderrStreamError');

        framesMonitor.listen();

        childProcess.stderr.emit('error', expectedError);

        assert.isTrue(spyIsListening.calledOnce);

        assert.isDefined(framesMonitor._cp);

        assert.isTrue(stubOnProcessStderrStreamError.calledOnce);
        assert.isTrue(stubOnProcessStderrStreamError.calledWithExactly(expectedError));

        stubOnProcessStderrStreamError.restore();
    });

    it('must correct set callback for stderr data event', () => {
        const expectedData = Buffer.from('some error in stderr');

        const stubOnStderrData = sinon.stub(framesMonitor, '_onStderrData');

        framesMonitor.listen();

        childProcess.stderr.emit('data', expectedData);

        assert.isTrue(spyIsListening.calledOnce);

        assert.isDefined(framesMonitor._cp);

        assert.isTrue(stubOnStderrData.calledOnce);
        assert.isTrue(stubOnStderrData.calledWithExactly(expectedData));

        stubOnStderrData.restore();
    });

    it('must correct set callback for stdout data event', () => {
        const expectedData = Buffer.from('some data in stdout');

        const stubOnStdoutChunk = sinon.stub(framesMonitor, '_onStdoutChunk');

        framesMonitor.listen();

        childProcess.stdout.emit('data', expectedData);

        assert.isTrue(spyIsListening.calledOnce);

        assert.isDefined(framesMonitor._cp);

        assert.isTrue(stubOnStdoutChunk.calledOnce);
        assert.isTrue(stubOnStdoutChunk.calledWithExactly(expectedData));

        stubOnStdoutChunk.restore();
    });
});

'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const Errors = require('src/Errors');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::listen', () => {

    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
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

});

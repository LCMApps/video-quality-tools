'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');
const Errors   = require('src/Errors');

const {url, path, FramesMonitor, makeFramesReducer, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::stopListen', () => {

    let framesReducer;
    let framesMonitor;
    let childProcess;

    let spyOnKill;
    let stubRunShowFramesProcess;

    beforeEach(() => {
        framesReducer = makeFramesReducer();

        framesMonitor = new FramesMonitor({
            ffprobePath : path,
            timeoutInSec: 1,
        }, url, framesReducer);

        childProcess = makeChildProcess();

        spyOnKill                = sinon.spy(childProcess, 'kill');
        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
    });

    afterEach(() => {
        spyOnKill.reset();
        stubRunShowFramesProcess.restore();
    });

    it('must throw an exception when try to stop listen before start listening', () => {
        const expectedIsListening  = false;
        const expectedErrorType    = Errors.AlreadyStoppedListenError;
        const expectedErrorMessage = 'This service is already stopped.';

        try {
            framesMonitor.stopListen();
            assert.isTrue(false, 'Should not be here');
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.isFalse(spyOnKill.called);

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());
        }
    });

    it('must stop listen just fine', () => {
        const expectedIsListening = false;

        framesMonitor.listen();
        framesMonitor.stopListen();

        assert.isTrue(spyOnKill.calledOnce);
        assert.isTrue(spyOnKill.alwaysCalledWithExactly());

        assert.strictEqual(expectedIsListening, framesMonitor.isListening());
    });

    it('must throw an exception when try to stop listen several times in a row', () => {
        const expectedIsListening  = false;
        const expectedErrorType    = Errors.AlreadyStoppedListenError;
        const expectedErrorMessage = 'This service is already stopped.';

        framesMonitor.listen();
        framesMonitor.stopListen();

        try {
            framesMonitor.stopListen();
            assert.isTrue(false, 'Should not be here');
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.isTrue(spyOnKill.calledOnce);

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());
        }
    });

});

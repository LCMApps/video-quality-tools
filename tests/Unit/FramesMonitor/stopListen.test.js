'use strict';

const {assert} = require('chai');

const Errors = require('src/Errors');

const {correctPath, correctUrl, FramesMonitor} = require('./Helpers/');

describe('FramesMonitor::stopListen', () => {

    let framesMonitor;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);
    });

    it('must throw an exception when try to stop listen before start listening', () => {
        const expectedIsListening  = false;
        const expectedErrorType    = Errors.AlreadyStoppedListenError;
        const expectedErrorMessage = 'This service is already stopped.';

        try {
            framesMonitor.stopListen();
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());
        }
    });

    it('must stop listen just fine', () => {
        const expectedIsListening = false;

        framesMonitor.listen();
        framesMonitor.stopListen();

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
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());
        }
    });

});

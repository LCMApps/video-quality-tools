'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const {url, path, FramesMonitor, makeFramesReducer, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::isListening', () => {

    let framesReducer;
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;

    beforeEach(() => {
        framesReducer = makeFramesReducer();

        framesMonitor = new FramesMonitor({
            ffprobePath : path,
            timeoutInSec: 1,
        }, url, framesReducer);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
    });

    it("must return false, cuz we didn't run listen method", () => {
        const expectedIsListening = false;

        assert.strictEqual(expectedIsListening, framesMonitor.isListening());
    });

    it('must return true, cuz we started listen', () => {
        const expectedIsListening = true;

        framesMonitor.listen();

        assert.strictEqual(expectedIsListening, framesMonitor.isListening());
    });

    it('must return false, cuz we stopped listen', () => {
        const expectedIsListening = false;

        framesMonitor.listen();
        framesMonitor.stopListen();

        assert.strictEqual(expectedIsListening, framesMonitor.isListening());
    });

});

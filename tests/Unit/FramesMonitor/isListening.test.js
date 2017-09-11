'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::isListening', () => {

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

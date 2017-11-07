'use strict';

const {assert} = require('chai');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::isListening', () => {

    let framesMonitor;
    let childProcess;

    beforeEach(() => {
        childProcess = makeChildProcess();

        framesMonitor = new FramesMonitor(config, url);
    });

    it("must return false, cuz we didn't run listen method", () => {
        const expectedIsListening = false;

        assert.strictEqual(framesMonitor.isListening(), expectedIsListening);
    });

    it('must return true, cuz we started listen', () => {
        const expectedIsListening = true;

        framesMonitor._cp = childProcess;

        assert.strictEqual(framesMonitor.isListening(), expectedIsListening);
    });

    it('must return false, cuz we stopped listen', async () => {
        const expectedIsListening = false;

        framesMonitor._cp = childProcess;

        await framesMonitor.stopListen();

        assert.strictEqual(framesMonitor.isListening(), expectedIsListening);
    });

});

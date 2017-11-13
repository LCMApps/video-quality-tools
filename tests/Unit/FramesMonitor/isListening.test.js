'use strict';

const {assert} = require('chai');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::isListening', () => {

    let framesMonitor;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);
    });

    it("must return false, cuz we didn't run listen method", () => {
        const expectedIsListening = false;

        framesMonitor._cp = null;

        assert.strictEqual(framesMonitor.isListening(), expectedIsListening);
    });

    it('must return true, cuz we started listen', () => {
        const expectedIsListening = true;

        framesMonitor._cp = makeChildProcess();

        assert.strictEqual(framesMonitor.isListening(), expectedIsListening);
    });
});

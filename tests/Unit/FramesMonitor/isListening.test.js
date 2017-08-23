'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const {correctPath, correctUrl, FramesMonitor, childProcess} = require('./Helpers/');

describe('FramesMonitor::isListening', () => {

    let framesMonitor;

    let stubRunShowFramesProcess;

    let spyIsListening;
    let spyKill;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);

        spyIsListening = sinon.spy(framesMonitor, 'isListening');
        spyKill        = sinon.spy(childProcess, 'kill');
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();

        spyIsListening.restore();
        spyKill.restore();
    });

    it("must return false, cuz we didn't run listen method", () => {
        assert.isFalse(framesMonitor.isListening());

        assert.isTrue(stubRunShowFramesProcess.notCalled);
        assert.isTrue(spyKill.notCalled);

        assert.isTrue(spyIsListening.calledOnce);
        assert.isTrue(spyIsListening.firstCall.calledWithExactly());

    });

    it('must return false, cuz we stopped listen', () => {
        framesMonitor.listen();
        framesMonitor.stopListen();

        assert.isTrue(stubRunShowFramesProcess.calledOnce);
        assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

        assert.isTrue(spyIsListening.calledTwice);
        assert.isTrue(spyIsListening.firstCall.calledWithExactly());
        assert.isTrue(spyIsListening.secondCall.calledWithExactly());

        assert.isTrue(spyKill.calledOnce);
        assert.isTrue(spyKill.firstCall.calledWithExactly());

        assert.isFalse(framesMonitor.isListening());
    });

    it('must return true, cuz we started listen and forgot to stop', () => {
        framesMonitor.listen();

        assert.isTrue(stubRunShowFramesProcess.calledOnce);
        assert.isTrue(stubRunShowFramesProcess.firstCall.calledWithExactly());

        assert.isTrue(spyIsListening.calledOnce);
        assert.isTrue(spyIsListening.firstCall.calledWithExactly());

        assert.isTrue(spyKill.notCalled);

        assert.isTrue(framesMonitor.isListening());
    });

});

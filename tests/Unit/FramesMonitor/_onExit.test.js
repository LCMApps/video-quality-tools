'use strict';

const sinon      = require('sinon');
const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {correctPath, correctUrl, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::_onExit', () => {

    let framesMonitor;
    let childProcess;
    let stubRunShowFramesProcess;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);

        childProcess             = makeChildProcess();
        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
    });

    const data = [
        {type: 'zero code', exitCode: 0, signal: undefined},
        {type: 'non-zero error code', exitCode: 1, signal: undefined},
        {type: 'signal', exitCode: undefined, signal: 'SIGINT'}
    ];

    dataDriven(data, () => {
        it('must handle exit event that could be emitter by the child process with {type}', ctx => {
            const expectedExitCode   = ctx.exitCode;
            const expectedExitSignal = ctx.signal;

            framesMonitor.listen();

            framesMonitor.on('exit', (code, signal) => {

                assert.strictEqual(code, expectedExitCode);
                assert.strictEqual(signal, expectedExitSignal);

                assert.isFalse(framesMonitor.isListening());
            });

            childProcess.emit('exit', ctx.exitCode, ctx.signal);
        });
    });

    it('must call _onExit callback just once', () => {
        const spyOnExit = sinon.spy(framesMonitor, '_onExit');

        framesMonitor.listen();

        childProcess.emit('exit');
        childProcess.emit('exit');

        assert.isTrue(spyOnExit.calledOnce);

        spyOnExit.restore();
    });

    it("must not call _onExit callback cuz it wasn't set by the 'listen' method call", () => {
        const spyOnExit = sinon.spy(framesMonitor, '_onExit');

        childProcess.emit('exit');
        childProcess.emit('exit');

        assert.isTrue(spyOnExit.notCalled);

        spyOnExit.restore();
    });

});

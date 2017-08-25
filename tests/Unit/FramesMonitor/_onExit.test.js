'use strict';

const sinon      = require('sinon');
const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {correctPath, correctUrl, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::_onExit', () => {

    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnExit;
    let spyOnExitEvent;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyOnExit                = sinon.spy(framesMonitor, '_onExit');
        spyOnExitEvent           = sinon.spy();

        framesMonitor.listen();
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyOnExit.restore();
        spyOnExitEvent.reset();
    });

    const data = [
        {type: 'zero code', exitCode: 0, signal: undefined},
        {type: 'non-zero error code', exitCode: 1, signal: undefined},
        {type: 'signal', exitCode: undefined, signal: 'SIGINT'}
    ];

    dataDriven(data, () => {
        it('must handle exit event that could be emitter by the child process with {type}', (ctx, done) => {
            const expectedExitCode   = ctx.exitCode;
            const expectedExitSignal = ctx.signal;

            childProcess.emit('exit', ctx.exitCode, ctx.signal);

            framesMonitor.on('exit', spyOnExitEvent);

            setImmediate(() => {
                assert.isTrue(spyOnExit.calledOnce);
                assert.isTrue(spyOnExitEvent.calledOnce);

                assert.isTrue(spyOnExitEvent.alwaysCalledWithExactly(expectedExitCode, expectedExitSignal));

                assert.isFalse(framesMonitor.isListening());

                done();
            });
        });
    });

    it('must call _onExit callback just once', done => {
        childProcess.emit('exit');
        childProcess.emit('exit');

        framesMonitor.on('exit', spyOnExitEvent);

        setImmediate(() => {
            assert.isTrue(spyOnExit.calledOnce);
            assert.isTrue(spyOnExitEvent.calledOnce);

            done();
        });
    });

});

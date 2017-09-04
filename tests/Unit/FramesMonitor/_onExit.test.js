'use strict';

const sinon      = require('sinon');
const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {url, path, FramesMonitor, makeFramesReducer, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onExit', () => {

    let framesReducer;
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnExit;
    let spyOnExitEvent;

    beforeEach(() => {

        framesReducer = makeFramesReducer();

        framesMonitor = new FramesMonitor({
            ffprobePath : path,
            timeoutInSec: 1,
        }, url, framesReducer);

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
        {type: 'negative error code', exitCode: -1, signal: undefined},
        {type: 'signal', exitCode: undefined, signal: 'SIGINT'}
    ];

    dataDriven(data, () => {
        it('must handle exit event that could be emitter by the child process with {type}', ctx => {
            const expectedIsListening = false;
            const expectedExitCode    = ctx.exitCode;
            const expectedExitSignal  = ctx.signal;

            framesMonitor.on('exit', spyOnExitEvent);

            childProcess.emit('exit', ctx.exitCode, ctx.signal);

            assert.isTrue(spyOnExit.calledOnce);
            assert.isTrue(spyOnExitEvent.calledOnce);

            assert.isTrue(spyOnExitEvent.alwaysCalledWithExactly(expectedExitCode, expectedExitSignal));

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());
        });
    });

    it('must call _onExit callback just once', () => {
        framesMonitor.on('exit', spyOnExitEvent);

        childProcess.emit('exit');
        childProcess.emit('exit');

        assert.isTrue(spyOnExit.calledOnce);
        assert.isTrue(spyOnExitEvent.calledOnce);
    });

});

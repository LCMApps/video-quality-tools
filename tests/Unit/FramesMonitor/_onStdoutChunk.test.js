'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const {url, path, FramesMonitor, makeFramesReducer, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onStdoutChunk', () => {

    let framesReducer;
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnFramesReducerProcess;

    beforeEach(() => {
        framesReducer = makeFramesReducer();

        framesMonitor = new FramesMonitor({
            ffprobePath : path,
            timeoutInSec: 1,
        }, url, framesReducer);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess  = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyOnFramesReducerProcess = sinon.spy(framesReducer, 'process');

        framesMonitor.listen();
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyOnFramesReducerProcess.restore();
    });

    it('call process method on the next event loop with stringified data', done => {
        const expectedOutput = '[FRAME]\na=b';
        const input          = Buffer.from(expectedOutput);

        childProcess.stdout.emit('data', input);

        setTimeout(() => {
            assert.isTrue(spyOnFramesReducerProcess.calledOnce);
            assert.isTrue(spyOnFramesReducerProcess.alwaysCalledWithExactly(expectedOutput));

            done();
        }, 0);
    });

});

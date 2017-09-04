'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const {url, path, FramesMonitor, makeFramesReducer, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onFramesReducerFrame', () => {

    let framesReducer;
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnFramesReducerFrame;

    beforeEach(() => {
        framesReducer = makeFramesReducer();

        framesMonitor = new FramesMonitor({
            ffprobePath : path,
            timeoutInSec: 1,
        }, url, framesReducer);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyOnFramesReducerFrame  = sinon.spy(framesMonitor, '_onFramesReducerFrame');

        framesMonitor.listen();
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyOnFramesReducerFrame.restore();
    });

    it('re-emit frame from frame reducer', done => {
        const expectedFrame = {a: 'b'};

        framesMonitor.on('frame', frame => {
            assert.deepEqual(frame, expectedFrame);

            assert.isTrue(spyOnFramesReducerFrame.calledOnce);

            done();
        });

        setTimeout(() => {
            framesReducer.emit('frame', expectedFrame);
        }, 0);
    });

});

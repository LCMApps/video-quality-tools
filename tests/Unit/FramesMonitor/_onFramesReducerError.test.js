'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const {url, path, FramesMonitor, makeFramesReducer, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onFramesReducerError', () => {

    let framesReducer;
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnFramesReducerError;

    beforeEach(() => {
        framesReducer = makeFramesReducer();

        framesMonitor = new FramesMonitor({
            ffprobePath : path,
            timeoutInSec: 1,
        }, url, framesReducer);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyOnFramesReducerError  = sinon.spy(framesMonitor, '_onFramesReducerError');

        framesMonitor.listen();
    });

    afterEach(() => {
        spyOnFramesReducerError.restore();
        stubRunShowFramesProcess.restore();
    });

    it('re-emit error from frames reducer', done => {
        const expectedError = new Error('some error');

        framesMonitor.on('error', error => {
            assert.strictEqual(error.message, expectedError.message);

            assert.isTrue(spyOnFramesReducerError.calledOnce);

            done();
        });

        setTimeout(() => {
            framesReducer.emit('error', expectedError);
        }, 0);
    });

});

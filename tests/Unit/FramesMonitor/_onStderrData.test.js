'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const Errors = require('src/Errors');

const {url, path, FramesMonitor, makeFramesReducer, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onStderrData', () => {

    let framesReducer;
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnStderrData;
    let spyOnStderrDataEvent;

    beforeEach(() => {
        framesReducer = makeFramesReducer();

        framesMonitor = new FramesMonitor({
            ffprobePath : path,
            timeoutInSec: 1,
        }, url, framesReducer);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyOnStderrData          = sinon.spy(framesMonitor, '_onStderrData');
        spyOnStderrDataEvent     = sinon.spy();
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyOnStderrData.restore();
        spyOnStderrDataEvent.reset();
    });

    it('must re-emit each data from stderr', () => {
        const expectedErrorType = Errors.FramesMonitorError;
        const expectedErrorMsg  = `got stderr output from a ${path} process`;

        const expectedDataMsg1 = 'some stderr worst possible data1';
        const expectedDataMsg2 = 'some stderr worst possible data2';

        framesMonitor.listen();

        framesMonitor.on('stderr', spyOnStderrDataEvent);

        childProcess.stderr.emit('data', expectedDataMsg1);
        childProcess.stderr.emit('data', expectedDataMsg2);

        assert.isTrue(spyOnStderrData.calledTwice);
        assert.isTrue(spyOnStderrDataEvent.calledTwice);

        const firstCallErrorData  = spyOnStderrDataEvent.firstCall.args[0];
        const secondCallErrorData = spyOnStderrDataEvent.secondCall.args[0];

        assert.instanceOf(firstCallErrorData, expectedErrorType);
        assert.instanceOf(secondCallErrorData, expectedErrorType);

        assert.strictEqual(firstCallErrorData.message, expectedErrorMsg);
        assert.strictEqual(secondCallErrorData.message, expectedErrorMsg);

        assert.strictEqual(firstCallErrorData.extra.url, url);
        assert.strictEqual(secondCallErrorData.extra.url, url);

        assert.strictEqual(firstCallErrorData.extra.data, expectedDataMsg1);
        assert.strictEqual(secondCallErrorData.extra.data, expectedDataMsg2);
    });

});

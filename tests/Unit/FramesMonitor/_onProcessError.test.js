'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const Errors = require('src/Errors');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::onProcessError', () => {

    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnProcessError;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyOnProcessError        = sinon.spy(framesMonitor, '_onProcessError');

        framesMonitor.listen();
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyOnProcessError.restore();
    });

    it('must wrap and re-emit each error emitted by the child process', () => {
        const spyOnErrorEvent = sinon.spy();

        const expectedErrorType = Errors.ProcessError;

        const expectedError1 = new Error('test error 1');
        const expectedError2 = new Error('test error 2');

        framesMonitor.on('error', spyOnErrorEvent);

        childProcess.emit('error', expectedError1);
        childProcess.emit('error', expectedError2);

        assert.isTrue(spyOnProcessError.calledTwice);

        assert.isTrue(spyOnErrorEvent.calledTwice);

        const firstCallErrorData  = spyOnErrorEvent.firstCall.args[0];
        const secondCallErrorData = spyOnErrorEvent.secondCall.args[0];

        assert.instanceOf(firstCallErrorData, expectedErrorType);
        assert.instanceOf(secondCallErrorData, expectedErrorType);

        assert.strictEqual(
            firstCallErrorData.message,
            `${config.ffprobePath} process could not be spawned or just got an error.`
        );

        assert.strictEqual(
            secondCallErrorData.message,
            `${config.ffprobePath} process could not be spawned or just got an error.`
        );

        assert.strictEqual(firstCallErrorData.extra.url, url);
        assert.strictEqual(secondCallErrorData.extra.url, url);

        assert.strictEqual(firstCallErrorData.extra.error.message, expectedError1.message);
        assert.strictEqual(secondCallErrorData.extra.error.message, expectedError2.message);

    });

});

'use strict';

const sinon      = require('sinon');
const {assert}   = require('chai');
const dataDriven = require('data-driven');

const Errors = require('src/Errors');

const {correctPath, correctUrl, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::_onProcessStreamsError', () => {

    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnProcessStreamsError;
    let spyOnStreamErrorEvent;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        spyOnProcessStreamsError = sinon.spy(framesMonitor, '_onProcessStreamsError');
        spyOnStreamErrorEvent    = sinon.spy();
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyOnProcessStreamsError.restore();
        spyOnStreamErrorEvent.reset();
    });

    const data = [
        {type: 'stdout'},
        {type: 'stderr'}
    ];

    dataDriven(data, () => {
        it('must wrap and re-emit each error emitted by the child process {type} object', (ctx, done) => {
            const expectedErrorType = Errors.ProcessStreamError;
            const expectedErrorMsg  = `got an error from a ${correctPath} ${ctx.type.toUpperCase()} process stream.`;

            const expectedError1 = new Error('test error 1');
            const expectedError2 = new Error('test error 2');

            framesMonitor.listen();

            childProcess[ctx.type].emit('error', expectedError1);
            childProcess[ctx.type].emit('error', expectedError2);

            framesMonitor.on('error', spyOnStreamErrorEvent);

            setImmediate(() => {
                assert.isTrue(spyOnProcessStreamsError.calledTwice);

                assert.isTrue(spyOnStreamErrorEvent.calledTwice);

                const firstCallErrorData  = spyOnStreamErrorEvent.firstCall.args[0];
                const secondCallErrorData = spyOnStreamErrorEvent.secondCall.args[0];

                assert.instanceOf(firstCallErrorData, expectedErrorType);
                assert.instanceOf(secondCallErrorData, expectedErrorType);

                assert.strictEqual(firstCallErrorData.message, expectedErrorMsg);
                assert.strictEqual(secondCallErrorData.message, expectedErrorMsg);

                assert.strictEqual(firstCallErrorData.extra.url, correctUrl);
                assert.strictEqual(secondCallErrorData.extra.url, correctUrl);

                assert.strictEqual(firstCallErrorData.extra.error.message, expectedError1.message);
                assert.strictEqual(secondCallErrorData.extra.error.message, expectedError2.message);

                done();
            });
        });
    });

});

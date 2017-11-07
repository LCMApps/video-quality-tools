'use strict';

const sinon      = require('sinon');
const {assert}   = require('chai');
const dataDriven = require('data-driven');

const Errors = require('src/Errors');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onProcessStreamsError', () => {

    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
    });

    const data = [
        {type: 'stdout'},
        {type: 'stderr'}
    ];

    dataDriven(data, () => {
        it('must wrap and handle each error emitted by the child process {type} stream object', async ctx => {
            const expectedErrorType = Errors.ProcessStreamError;

            const stubHandleProcessingError = sinon.stub(framesMonitor, '_handleProcessingError').resolves();

            const originalError = new Error('test error');
            const expectedError = new Errors.ProcessStreamError(
                `got an error from a ${config.ffprobePath} ${ctx.type} process stream.`, {
                    url  : url,
                    error: originalError
                }
            );

            await framesMonitor._onProcessStreamsError(ctx.type, originalError);

            assert.isTrue(stubHandleProcessingError.calledOnce);

            assert.lengthOf(stubHandleProcessingError.getCall(0).args, 1);

            const error = stubHandleProcessingError.getCall(0).args[0];

            assert.instanceOf(error, expectedErrorType);
            assert.strictEqual(error.message, expectedError.message);
            assert.strictEqual(error.extra.url, expectedError.extra.url);
            assert.strictEqual(error.extra.error, originalError);

            stubHandleProcessingError.restore();
        });
    });

    dataDriven(data, () => {
        it('handle error emitted by the child process {type} stream object and reject promise if the error has occurred during the processing', async ctx => { // eslint-disable-line
            const innerError        = new Error('some badass error');
            const expectedErrorType = Errors.ProcessStreamError;

            const stubHandleProcessingError = sinon.stub(framesMonitor, '_handleProcessingError').rejects(innerError);

            const originalError = new Error('test error');
            const expectedError = new Errors.ProcessStreamError(
                `got an error from a ${config.ffprobePath} ${ctx.type} process stream.`, {
                    url  : url,
                    error: originalError
                }
            );

            try {
                await framesMonitor._onProcessStreamsError(ctx.type, originalError);
                assert.isTrue(false, 'should not be here, cuz _onProcessStreamsError rejected promise');
            } catch (err) {
                assert.instanceOf(err, innerError.constructor);
                assert.strictEqual(err.message, innerError.message);

                assert.isTrue(stubHandleProcessingError.calledOnce);

                assert.lengthOf(stubHandleProcessingError.getCall(0).args, 1);

                const error = stubHandleProcessingError.getCall(0).args[0];

                assert.instanceOf(error, expectedErrorType);
                assert.strictEqual(error.message, expectedError.message);
                assert.strictEqual(error.extra.url, expectedError.extra.url);
                assert.strictEqual(error.extra.error, originalError);
            } finally {
                stubHandleProcessingError.restore();
            }
        });
    });

});

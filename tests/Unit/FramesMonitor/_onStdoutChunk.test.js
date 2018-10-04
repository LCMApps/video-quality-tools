'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers');

const Errors = require('src/Errors');

describe('FramesMonitor::_onStdoutChunk', () => {

    let framesMonitor;

    let spyOnCompleteFrame;
    let stubRunShowFramesProcess;
    let stubHandleProcessingError;
    let spyFrameToJson;
    let spyReduceFramesFromChunks;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        const childProcess = makeChildProcess();

        stubRunShowFramesProcess  = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
        stubHandleProcessingError = sinon.stub(framesMonitor, '_handleProcessingError').resolves();
        spyFrameToJson            = sinon.spy(FramesMonitor, '_frameToJson');
        spyReduceFramesFromChunks = sinon.spy(FramesMonitor, '_reduceFramesFromChunks');
        spyOnCompleteFrame        = sinon.spy();

        framesMonitor.listen();
    });

    afterEach(() => {
        spyOnCompleteFrame.resetHistory();
        stubRunShowFramesProcess.restore();
        stubHandleProcessingError.restore();
        spyFrameToJson.restore();
        spyReduceFramesFromChunks.restore();
    });

    const data = [
        {
            description          : 'emit entire frame with empty chunkRemainder, chunkRemainder should have new, empty value', // eslint-disable-line
            currentChunkRemainder: '',
            input                : '[FRAME]\na=b\n[/FRAME]',
            newChundRemainder    : '',
            output               : {a: 'b'}
        },
        {
            description          : 'emit entire frame with empty chunkRemainder, chunkRemainder should have new, not-empty value', // eslint-disable-line
            currentChunkRemainder: '',
            input                : '[FRAME]\na=b\n[/FRAME]\n[FRAME]\nc=d',
            newChundRemainder    : '\n[FRAME]\nc=d',
            output               : {a: 'b'}
        },
        {
            description          : 'emit accumulated set of frames, chunkRemainder should have new, not-empty value',
            currentChunkRemainder: '[FRAME]\na=b\n',
            input                : 'c=d\n[/FRAME]\n[FRAME]\ne=',
            newChundRemainder    : '\n[FRAME]\ne=',
            output               : {a: 'b', c: 'd'}
        }
    ];

    data.forEach((test) => {
        it(`${test.description}`, done => {
            framesMonitor._chunkRemainder = test.currentChunkRemainder;

            const input = Buffer.from(test.input);

            framesMonitor.on('frame', spyOnCompleteFrame);

            framesMonitor._onStdoutChunk(input)
                .then(() => {
                    setImmediate(() => {
                        assert.isTrue(spyOnCompleteFrame.calledOnce);

                        assert.isTrue(stubHandleProcessingError.notCalled);
                        assert.isTrue(spyFrameToJson.calledOnce);
                        assert.isTrue(spyReduceFramesFromChunks.calledOnce);

                        done();
                    });
                });
        });
    });

    it('must not emit empty frame', done => {
        const input = Buffer.from('');

        framesMonitor.on('frame', spyOnCompleteFrame);

        framesMonitor._onStdoutChunk(input)
            .then(() => {
                setImmediate(() => {
                    assert(spyOnCompleteFrame.notCalled);

                    assert.isTrue(stubHandleProcessingError.notCalled);
                    assert.isTrue(spyFrameToJson.notCalled);
                    assert.isTrue(spyReduceFramesFromChunks.calledOnce);

                    done();
                });
            });
    });

    it('must not emit uncomplete frame', done => {
        const input = Buffer.from('[FRAME]\na=b');

        framesMonitor.on('frame', spyOnCompleteFrame);

        framesMonitor._onStdoutChunk(input)
            .then(() => {
                setImmediate(() => {
                    assert(spyOnCompleteFrame.notCalled);

                    assert.isTrue(stubHandleProcessingError.notCalled);
                    assert.isTrue(spyFrameToJson.notCalled);
                    assert.isTrue(spyReduceFramesFromChunks.calledOnce);

                    done();
                });
            });
    });

    it('must emit complete raw frames in json format, which has been accumulated by several chunks', done => {
        const tests = [
            Buffer.from('[FRAME]\na=b\nc=d\n'),
            Buffer.from('a2=b2\nc2=d2\n'),
            Buffer.from('e2=f2\n[/FRAME]\n'),
            Buffer.from('[FRAME]\na=b\n[/FRAME]\n'),
            Buffer.from('[FRAME]\na=b\nc=d\n')
        ];

        const expectedResult1 = {
            a : 'b',
            c : 'd',
            a2: 'b2',
            c2: 'd2',
            e2: 'f2'
        };

        const expectedResult2 = {a: 'b'};

        framesMonitor.on('frame', spyOnCompleteFrame);

        // we cannot use done with async func identifier, so will use then method
        Promise.all(
            tests.map(async test => {
                await framesMonitor._onStdoutChunk(test);
            })
        )
            .then(() => {
                // _onStdoutChunk uses setImmediate under the hood, so we use it here too
                setImmediate(() => {
                    assert(spyOnCompleteFrame.calledTwice);

                    assert.isTrue(spyOnCompleteFrame.firstCall.calledWithExactly(expectedResult1));
                    assert.isTrue(spyOnCompleteFrame.secondCall.calledWithExactly(expectedResult2));

                    assert.isTrue(stubHandleProcessingError.notCalled);
                    assert.isTrue(spyFrameToJson.calledTwice);
                    assert.strictEqual(spyReduceFramesFromChunks.callCount, tests.length);

                    done();
                });
            });
    });

    it('must emit error, invalid data input (too big frame, probably infinite)', async () => {
        const smallInput = '\na=b\n'.repeat(10);
        const largeInput = '\na=b\n'.repeat(config.bufferMaxLengthInBytes - 10);

        await framesMonitor._onStdoutChunk(smallInput);
        await framesMonitor._onStdoutChunk(largeInput);

        assert.isTrue(stubHandleProcessingError.calledOnce);

        const error = stubHandleProcessingError.getCall(0).args[0];

        assert.instanceOf(error, Errors.InvalidFrameError);

        assert.strictEqual(
            error.message,
            'Too long (probably infinite) frame.' +
            `The frame length is ${smallInput.length + largeInput.length}.` +
            `The max frame length must be ${config.bufferMaxLengthInBytes}`
        );

        assert.isTrue(spyFrameToJson.notCalled);
        assert.isTrue(spyReduceFramesFromChunks.calledOnce); // during the first call on smallInput
    });

    it('must throw an exception, invalid data input (unclosed frame)', async () => {
        const expectedErrorType    = Errors.InvalidFrameError;
        const expectedErrorMessage = 'Can not process frame with invalid structure.';

        const chunkRemainder = '[FRAME]\na=b\n';
        const newChunk       = '[FRAME]\na=b\nc=d\n[/FRAME]';

        framesMonitor._chunkRemainder = chunkRemainder;

        await framesMonitor._onStdoutChunk(newChunk);

        assert.isTrue(stubHandleProcessingError.calledOnce);

        const error = stubHandleProcessingError.getCall(0).args[0];

        assert.instanceOf(error, expectedErrorType);

        assert.strictEqual(error.message, expectedErrorMessage);

        assert.deepEqual(error.extra, {
            data : chunkRemainder + newChunk,
            frame: '[FRAME]\na=b\n[FRAME]\na=b\nc=d\n'
        });

        assert.isTrue(spyFrameToJson.notCalled);
        assert.isTrue(spyReduceFramesFromChunks.calledOnce);
    });

    it('must throw an exception, invalid data input (end block without starting one)', async () => {
        const expectedErrorType    = Errors.InvalidFrameError;
        const expectedErrorMessage = 'Can not process frame with invalid structure.';

        const newChunk = 'a=b\nc=d\n[/FRAME]';

        await framesMonitor._onStdoutChunk(newChunk);

        assert.isTrue(stubHandleProcessingError.calledOnce);

        const error = stubHandleProcessingError.getCall(0).args[0];

        assert.instanceOf(error, expectedErrorType);

        assert.strictEqual(error.message, expectedErrorMessage);

        assert.deepEqual(error.extra, {
            data : newChunk,
            frame: 'a=b\nc=d\n'
        });

        assert.isTrue(spyFrameToJson.notCalled);
        assert.isTrue(spyReduceFramesFromChunks.calledOnce);
    });
});

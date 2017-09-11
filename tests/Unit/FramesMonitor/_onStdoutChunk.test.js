'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const {config, url, FramesMonitor} = require('./Helpers');

const Errors = require('src/Errors');

describe('FramesMonitor::_onStdoutChunk', () => {

    let framesMonitor;

    let spyOnCompleteFrame;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        spyOnCompleteFrame = sinon.spy();
    });

    afterEach(() => {
        spyOnCompleteFrame.reset();
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

            framesMonitor._onStdoutChunk(input);

            setImmediate(() => {
                assert(spyOnCompleteFrame.calledOnce);

                assert(spyOnCompleteFrame.firstCall.calledWithExactly(test.output));

                assert.strictEqual(framesMonitor._chunkRemainder, test.newChundRemainder);

                done();
            });
        });
    });

    it('must not emit empty frame', done => {
        const input = Buffer.from('');

        framesMonitor.on('frame', spyOnCompleteFrame);

        framesMonitor._onStdoutChunk(input);

        setImmediate(() => {
            assert(spyOnCompleteFrame.notCalled);

            done();
        });
    });

    it('must not emit uncomplete frame', done => {
        const input = Buffer.from('[FRAME]\na=b');

        framesMonitor.on('frame', spyOnCompleteFrame);

        framesMonitor._onStdoutChunk(input);

        setImmediate(() => {
            assert(spyOnCompleteFrame.notCalled);

            done();
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

        tests.forEach(test => {
            framesMonitor._onStdoutChunk(test);
        });

        setImmediate(() => {
            assert(spyOnCompleteFrame.calledTwice);

            assert.isTrue(spyOnCompleteFrame.firstCall.calledWithExactly(expectedResult1));
            assert.isTrue(spyOnCompleteFrame.secondCall.calledWithExactly(expectedResult2));

            done();
        });
    });

    it('must emit error, invalid data input (too big frame, probably infinite)', done => {
        const smallInput = '\na=b\n'.repeat(10);
        const largeInput = '\na=b\n'.repeat(config.bufferMaxLengthInBytes - 10);

        framesMonitor.on('error', error => {
            assert.instanceOf(error, Errors.InvalidFrameError);

            assert.strictEqual(
                error.message,
                'Too long (probably infinite) frame.' +
                `The frame length is ${smallInput.length + largeInput.length}.` +
                `The max frame length must be ${config.bufferMaxLengthInBytes}`
            );

            done();
        });

        framesMonitor._onStdoutChunk(smallInput);
        framesMonitor._onStdoutChunk(largeInput);
    });

    it('must throw an exception, invalid data input (unclosed frame)', done => {
        const expectedErrorType    = Errors.InvalidFrameError;
        const expectedErrorMessage = 'Can not process frame with invalid structure.';

        const chunkRemainder = '[FRAME]\na=b\n';
        const newChunk       = '[FRAME]\na=b\nc=d\n[/FRAME]';

        framesMonitor._chunkRemainder = chunkRemainder;

        framesMonitor.on('error', error => {
            assert.instanceOf(error, expectedErrorType);

            assert.strictEqual(error.message, expectedErrorMessage);

            assert.deepEqual(error.extra, {
                data : chunkRemainder + newChunk,
                frame: '[FRAME]\na=b\n[FRAME]\na=b\nc=d\n'
            });

            done();
        });

        framesMonitor._onStdoutChunk(newChunk);
    });

    it('must throw an exception, invalid data input (end block without starting one)', done => {
        const expectedErrorType    = Errors.InvalidFrameError;
        const expectedErrorMessage = 'Can not process frame with invalid structure.';

        const newChunk = 'a=b\nc=d\n[/FRAME]';

        framesMonitor.on('error', error => {
            assert.instanceOf(error, expectedErrorType);

            assert.strictEqual(error.message, expectedErrorMessage);

            assert.deepEqual(error.extra, {
                data : newChunk,
                frame: 'a=b\nc=d\n'
            });

            done();
        });

        framesMonitor._onStdoutChunk(newChunk);
    });

});

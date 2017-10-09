'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {FramesMonitor} = require('./Helpers');

const Errors = require('src/Errors');

describe('FramesMonitor::_reduceFramesFromChunks', () => {

    const data = [
        {
            description         : 'must return empty array of frames for empty input',
            inputChunkRemainder : '[FRAME]\na=b\n',
            input               : 'c=d',
            outputChunkRemainder: '[FRAME]\na=b\nc=d',
            expectedFrames      : []
        },
        {
            description         : 'must return empty array of frames for incomplete frame input',
            inputChunkRemainder : '',
            input               : '[FRAME]\na=b\nc=d',
            outputChunkRemainder: '[FRAME]\na=b\nc=d',
            expectedFrames      : []
        },
        {
            description         : 'must return an array with one raw frame',
            inputChunkRemainder : '',
            input               : '[FRAME]\na=b\nc=d\n[/FRAME]',
            outputChunkRemainder: '',
            expectedFrames      : ['a=b\nc=d']
        },
        {
            description         : 'must return an array with two raw frames',
            inputChunkRemainder : '[FRAME]\na=b\n',
            input               : 'c=d\n[/FRAME]\n[FRAME]\na2=b2\nc2=d2\n[/FRAME]\n[FRAME]\na3=b3\nc2=d2',
            outputChunkRemainder: '\n[FRAME]\na3=b3\nc2=d2',
            expectedFrames      : ['a=b\nc=d', 'a2=b2\nc2=d2']
        }
    ];

    dataDriven(data, () => {
        it('{description}', ctx => {
            let chunkRemainder;
            let frames;

            assert.doesNotThrow(() => {
                ({chunkRemainder, frames} = FramesMonitor._reduceFramesFromChunks(ctx.inputChunkRemainder + ctx.input));
            });

            assert.deepStrictEqual(frames, ctx.expectedFrames);
            assert.deepStrictEqual(chunkRemainder, ctx.outputChunkRemainder);
        });
    });

    it('must throw an exception, invalid data input (unclosed frame)', () => {
        const expectedErrorType    = Errors.InvalidFrameError;
        const expectedErrorMessage = 'Can not process frame with invalid structure.';

        const chunkRemainder = '[FRAME]\na=b\n';
        const newChunk       = '[FRAME]\na=b\nc=d\n[/FRAME]';

        try {
            FramesMonitor._reduceFramesFromChunks(chunkRemainder + newChunk);
            assert.isFalse(true, 'Should not be here');
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.deepEqual(err.extra, {
                data : chunkRemainder + newChunk,
                frame: '[FRAME]\na=b\n[FRAME]\na=b\nc=d\n'
            });
        }
    });

    it('must throw an exception, invalid data input (end block without starting one)', () => {
        const expectedErrorType    = Errors.InvalidFrameError;
        const expectedErrorMessage = 'Can not process frame with invalid structure.';

        const chunkRemainder = '[FRAME]\na=b\n[/FRAME]\n';
        const newChunk       = 'a=b\nc=d\n[/FRAME]';

        try {
            FramesMonitor._reduceFramesFromChunks(chunkRemainder + newChunk);
            assert.isFalse(true, 'Should not be here');
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.deepEqual(err.extra, {
                data : chunkRemainder + newChunk,
                frame: '\na=b\nc=d\n'
            });
        }
    });
});

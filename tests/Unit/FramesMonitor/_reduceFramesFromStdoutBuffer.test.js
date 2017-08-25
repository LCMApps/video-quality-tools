'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {correctPath, correctUrl, FramesMonitor} = require('./Helpers/');

describe('FramesMonitor::_reduceFramesFromStdoutBuffer', () => {

    let framesMonitor;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);
    });

    const data = [
        {
            description   : 'must return empty array of frames for empty input',
            input         : '',
            expectedFrames: []
        },
        {
            description   : 'must return empty array of frames for incomplete frame input',
            input         : '[FRAME]\na=b\nc=d',
            expectedFrames: []
        },
        {
            description   : 'must return an array with one raw frame',
            input         : '[FRAME]\na=b\nc=d\n[/FRAME]',
            expectedFrames: ['[FRAME]\na=b\nc=d']
        },
        {
            description   : 'must return an array with one raw frame, corner case',
            input         : '[FRAME]\na=b\nc=d\n[FRAME]\na2=b2\nc2=d2\n[/FRAME]',
            expectedFrames: ['[FRAME]\na=b\nc=d\n[FRAME]\na2=b2\nc2=d2']
        },
        {
            description   : 'must return an array with one raw frame, without start block',
            input         : '\na=b\nc=d\n[/FRAME]',
            expectedFrames: ['a=b\nc=d']
        },
        {
            description   : 'must return an array with two raw frames',
            input         : '[FRAME]\na=b\nc=d\n[/FRAME]\n[FRAME]\na2=b2\nc2=d2\n[/FRAME]\n[FRAME]\na3=b3\nc2=d2',
            expectedFrames: ['[FRAME]\na=b\nc=d', '[FRAME]\na2=b2\nc2=d2']
        }
    ];

    dataDriven(data, () => {
        it('{description}', ctx => {
            const frames = framesMonitor._reduceFramesFromStdoutBuffer(ctx.input);

            assert.deepEqual(frames, ctx.expectedFrames);
        });
    });

    it('must return complete raw frames which has been accumulated by several chunks', () => {
        const tests = [
            {input: '[FRAME]\na=b\nc=d\n', expectedResult: []},
            {input: 'a2=b2\nc2=d2\n', expectedResult: []},
            {input: 'e2=f2\n[/FRAME]\n', expectedResult: ['[FRAME]\na=b\nc=d\na2=b2\nc2=d2\ne2=f2']},
            {input: '[FRAME]\na=b\n[/FRAME]\n', expectedResult: ['[FRAME]\na=b']},
            {input: '[FRAME]\na=b\nc=d\n', expectedResult: []},
        ];

        tests.forEach(item => {
            const frames = framesMonitor._reduceFramesFromStdoutBuffer(item.input);

            assert.deepEqual(frames, item.expectedResult);
        });
    });

});

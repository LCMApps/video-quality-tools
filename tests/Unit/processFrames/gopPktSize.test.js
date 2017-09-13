'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

const Errors = require('src/Errors');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('processFrames.accumulatePktSize', () => {

    const invalidData = [
        undefined,
        null,
        true,
        '1',
        {},
        () => {},
        Symbol(),
        Buffer.alloc(0)
    ];

    dataDriven(
        invalidData.map(item => ({type: typeOf(item), item: item})),
        () => {
            it('must throw an error if frame pkt_size field has invalid {type} type', ctx => {
                const invalidFrame = {pkt_size: ctx.item};
                const invalidInput = {
                    frames   : [invalidFrame],
                    startTime: 1,
                    endTime  : 1
                };

                try {
                    processFrames.accumulatePktSize(invalidInput);
                    assert.isFalse(true, 'should not be here');
                } catch (error) {
                    assert.instanceOf(error, Errors.FrameInvalidData);

                    assert.strictEqual(error.message, `frame's pkt_size field has invalid type ${ctx.type}`);

                    assert.deepEqual(error.extra, {frame: invalidFrame});
                }
            });
        }
    );

    it('must correct accumulate frames pkt_size', () => {
        const frames = [
            {pkt_size: 1},
            {pkt_size: 2},
            {pkt_size: 3}
        ];

        const expectedRes = frames.reduce((sum, frame) => sum + frame.pkt_size, 0);

        const res = processFrames.accumulatePktSize({frames});

        assert.strictEqual(res, expectedRes);
    });


});

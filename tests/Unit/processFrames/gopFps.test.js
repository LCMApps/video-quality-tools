'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

const Errors = require('src/Errors');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('processFrames.gopFps', () => {

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
            it('must throw an error if frame pkt_duration_time field has invalid {type} type', ctx => {
                const invalidFrame = {pkt_duration_time: ctx.item};
                const invalidInput = [invalidFrame];

                try {
                    processFrames.gopFps(invalidInput);
                } catch (error) {
                    assert.instanceOf(error, Errors.FrameInvalidData);

                    assert.strictEqual(error.message, `frame's pkt_duration_time field has invalid type ${ctx.type}`);

                    assert.deepEqual(error.extra, {frame: invalidFrame});
                }
            });
        }
    );

    it("must throw an exception if the sum of pkt_duration_time's is zero", () => {
        const gop = [
            {pkt_duration_time: 0},
            {pkt_duration_time: 0},
            {pkt_duration_time: 0}
        ];

        try {
            processFrames.gopFps(gop);
        } catch (error) {
            assert.instanceOf(error, Errors.FrameInvalidData);

            assert.strictEqual(
                error.message,
                "the sum of pkt_ducation_time fields === 0, so we can't devide by 0, thus can't calculate gop bitrate"
            );

            assert.deepEqual(error.extra, {gop});
        }
    });

    it('must calculate correct fps for gop', () => {
        const expectedFps = 3 / (0.033333 + 0.033333 + 0.033333);
        const delta       = 0.1;

        const gop = [
            {pkt_duration_time: 0.033333},
            {pkt_duration_time: 0.033333},
            {pkt_duration_time: 0.033333}
        ];

        const fps = processFrames.gopFps(gop);

        assert.approximately(fps, expectedFps, delta);
    });

});

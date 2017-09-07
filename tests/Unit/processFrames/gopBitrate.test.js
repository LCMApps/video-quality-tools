'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

const Errors = require('src/Errors');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('processFrames.gopBitrate', () => {

    const validPktSize         = 1;
    const validPktDurationTime = 1;

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
                const invalidFrame = {pkt_size: ctx.item, pkt_duration_time: validPktDurationTime};
                const invalidInput = [invalidFrame];

                try {
                    processFrames.gopBitrate(invalidInput);
                } catch (error) {
                    assert.instanceOf(error, Errors.FrameInvalidData);

                    assert.strictEqual(error.message, `frame's pkt_size field has invalid type ${ctx.type}`);

                    assert.deepEqual(error.extra, {frame: invalidFrame});
                }
            });
        }
    );

    // TODO: uncomment this code when skip will work (eduard.bondrenko)
    // dataDriven(
    //     invalidData.map(item => ({type: typeOf(item), item: item})),
    //     () => {
    //         it.skip('must throw an error if frame pkt_duration_time field has invalid {type} type', ctx => {
    //             const invalidFrame = {pkt_size: validPktSize, pkt_duration_time: ctx.item};
    //             const invalidInput = [invalidFrame];
    //
    //             try {
    //                 processFrames.gopBitrate(invalidInput);
    //             } catch (error) {
    //                 assert.instanceOf(error, Errors.FrameInvalidData);
    //
    //                 assert.strictEqual(error.message, `frame's pkt_duration_time field has invalid type ${ctx.type}`);
    //
    //                 assert.deepEqual(error.extra, {frame: invalidFrame});
    //             }
    //         });
    //     }
    // );

    it.skip("must throw an exception if the sum of pkt_duration_time's is zero", () => {
        const gop = [
            {pkt_size: 4000, pkt_duration_time: 0},
            {pkt_size: 4000, pkt_duration_time: 0},
            {pkt_size: 4000, pkt_duration_time: 0}
        ];

        try {
            processFrames.gopBitrate(gop);
        } catch (error) {
            assert.instanceOf(error, Errors.FrameInvalidData);

            assert.strictEqual(
                error.message,
                "the sum of pkt_ducation_time fields === 0, so we can't devide by 0, thus can't calculate gop bitrate"
            );

            assert.deepEqual(error.extra, {gop});
        }
    });

    it('must calculate correct bitrate for gop', () => {
        const expectedBitrate = 120001 * 8 / 1024;
        const delta           = 1;

        const gop = [
            {pkt_size: 4000, pkt_duration_time: 0.033333},
            {pkt_size: 4000, pkt_duration_time: 0.033333},
            {pkt_size: 4000, pkt_duration_time: 0.033333}
        ];

        const bitrate = processFrames.gopBitrate(gop);

        assert.approximately(bitrate, expectedBitrate, delta);
    });

});

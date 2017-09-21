'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

const Errors = require('src/Errors');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('processFrames', () => {

    const invalidFramesTypes = [
        undefined,
        null,
        false,
        1,
        '1',
        {},
        Symbol(),
        () => {},
        Buffer.alloc(0)
    ];

    dataDriven(
        invalidFramesTypes.map(item => ({type: typeOf(item), item: item})),
        () => {
            it('must throw an exception for invalid input {type} type', ctx => {
                assert.throws(() => {
                    processFrames(ctx.item);
                }, TypeError, 'process method is supposed to accept an array of frames.');
            });
        }
    );

    it('must throw an exception cuz method cannot find gop', () => {
        const frames = [
            {pkt_size: 3, pkt_pts_time: 15, media_type: 'video', key_frame: 1},
            {pkt_size: 2, pkt_pts_time: 2, media_type: 'audio', key_frame: 1},
            {pkt_size: 5, pkt_pts_time: 17, media_type: 'video', key_frame: 0},
            {pkt_size: 7, pkt_pts_time: 19, media_type: 'video', key_frame: 0},
            {pkt_size: 4, pkt_pts_time: 4, media_type: 'audio', key_frame: 1},
        ];

        try {
            processFrames(frames);
            assert.isFalse(true, 'should not be here');
        } catch (error) {
            assert.instanceOf(error, Errors.GopNotFoundError);

            assert.strictEqual(error.message, 'Can not find any gop for these frames');

            assert.deepEqual(error.extra, {frames});
        }
    });

    it('must return correct info just fine', () => {
        const frames1 = [
            {pkt_size: 1, pkt_pts_time: 1, media_type: 'audio', key_frame: 1},
            {pkt_size: 1, pkt_pts_time: 11, media_type: 'video', key_frame: 1},
            {pkt_size: 3, pkt_pts_time: 13, media_type: 'video', key_frame: 0},
            {pkt_size: 3, pkt_pts_time: 3, media_type: 'audio', key_frame: 1},
            {pkt_size: 5, pkt_pts_time: 15, media_type: 'video', key_frame: 1},
            {pkt_size: 7, pkt_pts_time: 17, media_type: 'video', key_frame: 0},
            {pkt_size: 9, pkt_pts_time: 19, media_type: 'video', key_frame: 1}
        ];

        const frames2 = [
            {pkt_size: 1, pkt_pts_time: 1, media_type: 'audio', key_frame: 1},
            {pkt_size: 1, pkt_pts_time: 11, media_type: 'video', key_frame: 0},
            {pkt_size: 2, pkt_pts_time: 13, media_type: 'video', key_frame: 0},
            {pkt_size: 3, pkt_pts_time: 15, media_type: 'video', key_frame: 1},
            {pkt_size: 3, pkt_pts_time: 15, media_type: 'audio', key_frame: 1},
            {pkt_size: 4, pkt_pts_time: 17, media_type: 'video', key_frame: 0},
            {pkt_size: 5, pkt_pts_time: 19, media_type: 'video', key_frame: 0},
            {pkt_size: 6, pkt_pts_time: 21, media_type: 'video', key_frame: 1},
            {pkt_size: 7, pkt_pts_time: 23, media_type: 'video', key_frame: 0},
            {pkt_size: 3, pkt_pts_time: 15, media_type: 'audio', key_frame: 1},
            {pkt_size: 8, pkt_pts_time: 25, media_type: 'video', key_frame: 0},
            {pkt_size: 9, pkt_pts_time: 27, media_type: 'video', key_frame: 1},
            {pkt_size: 10, pkt_pts_time: 29, media_type: 'video', key_frame: 0}
        ];

        const expectedBitrate1 = {
            min : processFrames.toKbs((1 + 3) / (15 - 11)),
            max : processFrames.toKbs((5 + 7) / (19 - 15)),
            mean: processFrames.toKbs(((1 + 3) / (15 - 11) + (5 + 7) / (19 - 15)) / 2)
        };

        const expectedRemainedFrames1 = [
            {pkt_size: 9, pkt_pts_time: 19, media_type: 'video', key_frame: 1}
        ];

        const expectedBitrate2 = {
            min : processFrames.toKbs((3 + 4 + 5) / (21 - 15)),
            max : processFrames.toKbs((6 + 7 + 8) / (27 - 21)),
            mean: processFrames.toKbs(((3 + 4 + 5) / (21 - 15) + (6 + 7 + 8) / (27 - 21)) / 2)
        };

        const expectedRemainedFrames2 = [
            {pkt_size: 9, pkt_pts_time: 27, media_type: 'video', key_frame: 1},
            {pkt_size: 10, pkt_pts_time: 29, media_type: 'video', key_frame: 0}
        ];

        const expectedFps1 = {min: 0.5, max: 0.5, mean: 0.5};
        const expectedFps2 = {min: 0.5, max: 0.5, mean: 0.5};

        let res1 = processFrames(frames1);

        assert.deepEqual(res1.payload, {
            areAllGopsIdentical: true,
            bitrate            : expectedBitrate1,
            fps                : expectedFps1
        });

        assert.deepEqual(res1.remainedFrames, expectedRemainedFrames1);

        let res2 = processFrames(frames2);

        assert.deepEqual(res2.payload, {
            areAllGopsIdentical: true,
            bitrate            : expectedBitrate2,
            fps                : expectedFps2
        });

        assert.deepEqual(res2.remainedFrames, expectedRemainedFrames2);
    });

});

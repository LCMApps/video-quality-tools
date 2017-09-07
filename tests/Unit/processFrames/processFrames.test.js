'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

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

    const invalidFrames = [
        [undefined],
        [null],
        [true],
        [1],
        ['1'],
        [[]],
        [() => {}],
        [Symbol()],
        [Buffer.alloc(0)]
    ];

    dataDriven(
        invalidFrames.map(frames => ({type: typeOf(frames[0]), frames: frames})),
        () => {
            it('must throw an exception cuz array contains elements of invalid type: [{type}]', ctx => {
                assert.throws(() => {
                    processFrames(ctx.frames);
                }, TypeError, 'process method is supposed to accept an array of plain object(frames).');
            });
        }
    );

    it('must throw an exception cuz there are no video frames inside input array', () => {
        const input = [
            {media_type: 'audio'},
        ];

        assert.isNull(processFrames(input));
    });

    it('must return correct info just fine', () => {
        const expectedBitrate1 = {min: 0.5 * 8 / 1024, max: 0.5 * 8 / 1024, mean: 0.5 * 8 / 1024};
        const expectedBitrate2 = {min: 1 * 8 / 1024, max: 1 * 8 / 1024, mean: 1 * 8 / 1024};

        const expectedFps1 = {min: 0.5, max: 0.5, mean: 0.5};
        const expectedFps2 = {min: 0.5, max: 0.5, mean: 0.5};

        const videoFramesKeyFrames1 = [1, 0, 1, 0, 1];
        const videoFramesKeyFrames2 = [1, 0, 0, 1, 0, 0, 1, 0];
        const videoFramesKeyFrames3 = [1, 0, 0];

        const frames1 = videoFramesKeyFrames1.map(keyFrame => {
            return {
                pkt_size         : 1,
                pkt_duration_time: 2,
                media_type       : 'video',
                key_frame        : keyFrame
            };
        });

        const frames2 = videoFramesKeyFrames2.map(keyFrame => {
            return {
                pkt_size         : 2,
                pkt_duration_time: 2,
                media_type       : 'video',
                key_frame        : keyFrame
            };
        });

        const frames3 = videoFramesKeyFrames3.map(keyFrame => {
            return {
                media_type: 'video',
                key_frame : keyFrame
            };
        });

        let res1 = processFrames(frames1);

        assert.deepEqual(res1.bitrate, expectedBitrate1);
        assert.deepEqual(res1.fps, expectedFps1);

        let res2 = processFrames(frames2);

        assert.deepEqual(res2.bitrate, expectedBitrate2);
        assert.deepEqual(res2.fps, expectedFps2);

        let res3 = processFrames(frames3);

        assert.isNull(res3);
    });

});

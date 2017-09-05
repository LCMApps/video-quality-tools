'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

const Errors = require('src/Errors');

describe('processFrames.calculateBitrate', () => {

    it('must correct calculate min, max and average bitrate for gops', () => {
        const expectedBitrate = {
            min : 1,
            max : 2,
            mean: 1.5
        };

        const gops = [
            [
                {pkt_size: 1, pkt_duration_time: 1},
                {pkt_size: 1, pkt_duration_time: 1},
            ],
            [
                {pkt_size: 2, pkt_duration_time: 1},
                {pkt_size: 2, pkt_duration_time: 1},
            ]
        ];

        const bitrate = processFrames.calculateBitrate(gops);

        assert.deepEqual(bitrate, expectedBitrate);
    });

    it('max throw an exception for invalid data', () => {
        const gops = [
            [
                {pkt_size: undefined, pkt_duration_time: undefined},
            ]
        ];

        try {
            processFrames.calculateBitrate(gops);
        } catch (error) {
            assert.instanceOf(error, Errors.FrameInvalidData);

            assert.strictEqual(
                error.message,
                "frame's pkt_size field has invalid type [object Undefined]"
            );

            assert.deepEqual(error.extra, {frame: {pkt_size: undefined, pkt_duration_time: undefined}});
        }
    });

});

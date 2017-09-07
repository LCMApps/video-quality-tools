'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

const Errors = require('src/Errors');

describe('processFrames.calculateFps', () => {

    it('must correct calculate min, max and average fps for gops', () => {
        const expectedBitrate = {
            min : 0.5,
            max : 1,
            mean: 0.75
        };

        const gops = [
            [
                {pkt_duration_time: 1},
                {pkt_duration_time: 1},
            ],
            [
                {pkt_duration_time: 2},
                {pkt_duration_time: 2},
            ]
        ];

        const bitrate = processFrames.calculateFps(gops);

        assert.deepEqual(bitrate, expectedBitrate);
    });

    it.skip('max throw an exception for invalid data', () => {
        const gops = [
            [
                {pkt_duration_time: undefined},
            ]
        ];

        try {
            processFrames.calculateFps(gops);
        } catch (error) {
            assert.instanceOf(error, Errors.FrameInvalidData);

            assert.strictEqual(
                error.message,
                "frame's pkt_duration_time field has invalid type [object Undefined]"
            );

            assert.deepEqual(error.extra, {frame: {pkt_duration_time: undefined}});
        }
    });

});

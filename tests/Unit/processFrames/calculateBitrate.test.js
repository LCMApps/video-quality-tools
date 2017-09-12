'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

describe('processFrames.calculateBitrate', () => {

    it('must correct calculate min, max and average bitrate for gops', () => {
        const expectedBitrate = {
            min : ((1 + 2) / (5 - 2)) * 8 / 1024,
            max : (1 / (2 - 1)) * 8 / 1024,
            mean: (((1 + 2) / (5 - 2)) + (1 / (2 - 1))) / 2 * 8 / 1024
        };

        const gops = [
            {
                frames   : [
                    {key_frame: 1, pkt_size: 1, pkt_pts_time: 1},
                ],
                startTime: 1,
                endTime  : 2,
            },
            {
                frames   : [
                    {key_frame: 1, pkt_size: 1, pkt_pts_time: 2},
                    {key_frame: 0, pkt_size: 2, pkt_pts_time: 4},
                ],
                startTime: 2,
                endTime  : 5
            }
        ];

        const bitrate = processFrames.calculateBitrate(gops);

        assert.deepEqual(bitrate, expectedBitrate);
    });

});

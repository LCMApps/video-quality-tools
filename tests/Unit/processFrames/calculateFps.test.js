'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

describe('processFrames.calculateFps', () => {

    it('must correct calculate min, max and average fps for gops', () => {
        const expectedFps = {
            min : 0.5,
            max : 1,
            mean: 0.75
        };

        const gops = [
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: 1},
                ],
                startTime: 1,
                endTime  : 2
            },
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: 3},
                    {key_frame: 0, pkt_pts_time: 5},
                    {key_frame: 0, pkt_pts_time: 7},
                ],
                startTime: 3,
                endTime  : 9
            }
        ];

        const bitrate = processFrames.calculateFps(gops);

        assert.deepEqual(bitrate, expectedFps);
    });

});

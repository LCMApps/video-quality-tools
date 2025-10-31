'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

const VideoFrameSchema1 = require('src/Frame/VideoFrameSchema1');

describe('processFrames.calculateFps - raw frame object', () => {

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

describe('processFrames.calculateFps - frame value objects', () => {

    it('must correct calculate min, max and average fps for gops', () => {
        const expectedFps = {
            min : 0.5,
            max : 1,
            mean: 0.75
        };

        const gops = [
            {
                frames   : [
                    new VideoFrameSchema1({media_type: 'video', key_frame: 1, pkt_pts_time: 1}),
                ],
                startTime: 1,
                endTime  : 2
            },
            {
                frames   : [
                    new VideoFrameSchema1({media_type: 'video', key_frame: 1, pkt_pts_time: 3}),
                    new VideoFrameSchema1({media_type: 'video', key_frame: 0, pkt_pts_time: 5}),
                    new VideoFrameSchema1({media_type: 'video', key_frame: 0, pkt_pts_time: 7}),
                ],
                startTime: 3,
                endTime  : 9
            }
        ];

        const bitrate = processFrames.calculateFps(gops);

        assert.deepEqual(bitrate, expectedFps);
    });

});

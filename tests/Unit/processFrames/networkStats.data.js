'use strict';

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

const invalidDurationInSecTypes = [
    undefined,
    null,
    false,
    [],
    [1, 2],
    '1',
    1.2,
    -1,
    {},
    Symbol(),
    () => {},
    Buffer.alloc(0)
];

const testData = [
    {
        description: 'empty frames array',
        frames        : [],
        durationInMsec: 1000,
        expected      : {
            videoFrameRate: 0,
            audioFrameRate: 0,
            videoBitrate: 0,
            audioBitrate: 0,
        },
    },
    {
        description   : 'audio only frames with 1000 msec duration',
        frames        : [
            {pkt_size: 2, pkt_pts_time: 10, media_type: 'audio', key_frame: 1},
            {pkt_size: 3, pkt_pts_time: 11, media_type: 'audio', key_frame: 1},
        ],
        durationInMsec: 1000,
        expected      : {
            videoFrameRate: 0,
            audioFrameRate: 2,
            videoBitrate: 0,
            audioBitrate: 0.0390625,
        },
    },
    {
        description   : 'video only frames with 1000 msec duration',
        frames        : [
            {width: 854, height: 480, pkt_size: 2, pkt_pts_time: 1, media_type: 'video', key_frame: 1, pict_type: 'P'},
            {width: 854, height: 480, pkt_size: 3, pkt_pts_time: 10, media_type: 'video', key_frame: 0, pict_type: 'P'},
        ],
        durationInMsec: 1000,
        expected      : {
            videoFrameRate: 2,
            audioFrameRate: 0,
            videoBitrate: 0.0390625,
            audioBitrate: 0,
        },
    },
    {
        description   : 'frames with 200 msec duration',
        frames        : [
            {width: 854, height: 480, pkt_size: 2, pkt_pts_time: 1, media_type: 'video', key_frame: 1, pict_type: 'P'},
            {pkt_size: 2, pkt_pts_time: 10, media_type: 'audio', key_frame: 1},
            {pkt_size: 3, pkt_pts_time: 11, media_type: 'audio', key_frame: 1},
            {width: 854, height: 480, pkt_size: 3, pkt_pts_time: 10, media_type: 'video', key_frame: 0, pict_type: 'P'},
            {pkt_size: 4, pkt_pts_time: 12, media_type: 'audio', key_frame: 1},
        ],
        durationInMsec: 200,
        expected      : {
            videoFrameRate: 10,
            audioFrameRate: 15,
            videoBitrate: 0.1953125,
            audioBitrate: 0.3515625,
        },
    },
    {
        description   : 'audio only frames with 2000 msec duration',
        frames        : [
            {width: 854, height: 480, pkt_size: 5, pkt_pts_time: 1, media_type: 'video', key_frame: 1, pict_type: 'P'},
            {pkt_size: 2, pkt_pts_time: 10, media_type: 'audio', key_frame: 1},
            {pkt_size: 3, pkt_pts_time: 11, media_type: 'audio', key_frame: 1},
            {width: 854, height: 480, pkt_size: 6, pkt_pts_time: 10, media_type: 'video', key_frame: 0, pict_type: 'P'},
            {pkt_size: 4, pkt_pts_time: 12, media_type: 'audio', key_frame: 1},
            {width: 854, height: 480, pkt_size: 7, pkt_pts_time: 10, media_type: 'video', key_frame: 0, pict_type: 'I'},
        ],
        durationInMsec: 2000,
        expected      : {
            videoFrameRate: 1.5,
            audioFrameRate: 1.5,
            videoBitrate: 0.0703125,
            audioBitrate: 0.03515625,
        },
    },
];

module.exports = {
    invalidFramesTypes,
    invalidDurationInSecTypes,
    testData
};


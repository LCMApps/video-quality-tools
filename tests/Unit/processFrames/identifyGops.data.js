'use strict';

const invalidKeyFramesTypes = [
    undefined,
    null,
    true,
    '1',
    {},
    [],
    () => {}
];

const invalidKeyFramesValues = [-1, -0.5, 0.5, 2, 2.5];

const testData = [
    {
        description: 'works okay for the set of frames with no key frame',
        input      : [
            {key_frame: 0},
            {key_frame: 0},
        ],
        res        : []
    },
    {
        description: 'works okay for the set of frames with one key frame in the middle, but not completed',
        input      : [
            {key_frame: 0},
            {key_frame: 1},
            {key_frame: 0},
        ],
        res        : []
    },
    {
        description: 'works okay for the set of frames with one key frame at the beginning, but not completed',
        input      : [
            {key_frame: 1},
            {key_frame: 0},
            {key_frame: 0},
            {key_frame: 0},
        ],
        res        : []
    },
    {
        description: 'works okay for the set of frames with two completed gops, starts from gop with one frame',
        input      : [
            {key_frame: 1, pkt_pts_time: 1},
            {key_frame: 1, pkt_pts_time: 2},
            {key_frame: 0, pkt_pts_time: 3},
            {key_frame: 0, pkt_pts_time: 4},
            {key_frame: 1, pkt_pts_time: 5},
        ],
        res        : [
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: 1}
                ],
                startTime: 1,
                endTime  : 2
            },
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: 2},
                    {key_frame: 0, pkt_pts_time: 3},
                    {key_frame: 0, pkt_pts_time: 4}
                ],
                startTime: 2,
                endTime  : 5
            }
        ]
    },
    {
        description: 'edge case, works okay even for undefined pkt_pts_time values, error exception would be throw on the next level', // eslint-disable-line
        input      : [
            {key_frame: 1, pkt_pts_time: undefined},
            {key_frame: 0, pkt_pts_time: 3},
            {key_frame: 0, pkt_pts_time: 4},
            {key_frame: 1, pkt_pts_time: undefined},
        ],
        res        : [
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: undefined},
                    {key_frame: 0, pkt_pts_time: 3},
                    {key_frame: 0, pkt_pts_time: 4}
                ],
                startTime: undefined,
                endTime  : undefined
            }
        ]
    },
    {
        description: 'works okay for the set of frames with two completed gops, starts from key_frame=1',
        input      : [
            {key_frame: 1, pkt_pts_time: 1},
            {key_frame: 0, pkt_pts_time: 2},
            {key_frame: 0, pkt_pts_time: 3},
            {key_frame: 1, pkt_pts_time: 4},
            {key_frame: 0, pkt_pts_time: 5},
            {key_frame: 0, pkt_pts_time: 6},
            {key_frame: 1, pkt_pts_time: 7},
            {key_frame: 0, pkt_pts_time: 8}
        ],
        res        : [
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: 1},
                    {key_frame: 0, pkt_pts_time: 2},
                    {key_frame: 0, pkt_pts_time: 3}
                ],
                startTime: 1,
                endTime  : 4
            },
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: 4},
                    {key_frame: 0, pkt_pts_time: 5},
                    {key_frame: 0, pkt_pts_time: 6}
                ],
                startTime: 4,
                endTime  : 7
            }
        ]
    },
    {
        description: 'works okay for the set of frames with two completed gops, starts from key_frame=0',
        input      : [
            {key_frame: 0, pkt_pts_time: 1},
            {key_frame: 0, pkt_pts_time: 2},
            {key_frame: 1, pkt_pts_time: 3},
            {key_frame: 0, pkt_pts_time: 4},
            {key_frame: 0, pkt_pts_time: 5},
            {key_frame: 1, pkt_pts_time: 6},
            {key_frame: 0, pkt_pts_time: 7},
            {key_frame: 0, pkt_pts_time: 8},
            {key_frame: 1, pkt_pts_time: 9},
            {key_frame: 0, pkt_pts_time: 10},
        ],
        res        : [
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: 3},
                    {key_frame: 0, pkt_pts_time: 4},
                    {key_frame: 0, pkt_pts_time: 5}
                ],
                startTime: 3,
                endTime  : 6
            },
            {
                frames   : [
                    {key_frame: 1, pkt_pts_time: 6},
                    {key_frame: 0, pkt_pts_time: 7},
                    {key_frame: 0, pkt_pts_time: 8}
                ],
                startTime: 6,
                endTime  : 9
            }
        ]
    }
];

module.exports = {
    invalidKeyFramesTypes,
    invalidKeyFramesValues,
    testData
};


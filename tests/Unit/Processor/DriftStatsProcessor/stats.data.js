'use strict';

const FrameEnvelope = require('src/FrameEnvelope');

const {
    createVideoFrameSchema1,
    createVideoFrameSchema2,
    createVideoFrameSchema3,
    createVideoFrameSchema4,
    createAudioFrameSchema1,
    createAudioFrameSchema2,
    createAudioFrameSchema3,
    createAudioFrameSchema4,
} = require('./Helpers');

function createTestData(description, createVideoFrameFn, createAudioFrameFn) {
    return {
        description: description,
        durationInMs: 1000,
        frameGroups: [
            [
                new FrameEnvelope(createVideoFrameFn(1, 2.599, 2.599), new Date('2025-11-03T12:04:19.568Z')),
                new FrameEnvelope(createAudioFrameFn(2, 2.603, 2.603), new Date('2025-11-03T12:04:19.572Z')),
                new FrameEnvelope(createVideoFrameFn(1, 2.615, 2.615), new Date('2025-11-03T12:04:19.573Z')),
                new FrameEnvelope(createAudioFrameFn(2, 2.624, 2.624), new Date('2025-11-03T12:04:19.580Z')),
                new FrameEnvelope(createVideoFrameFn(1, 2.632, 2.632), new Date('2025-11-03T12:04:19.580Z')),
                new FrameEnvelope(createAudioFrameFn(2, 2.645, 2.645), new Date('2025-11-03T12:04:19.583Z')),
            ],
            [
                new FrameEnvelope(createAudioFrameFn(2, 2.665, 2.665), new Date('2025-11-03T12:04:20.610Z')),
                new FrameEnvelope(createVideoFrameFn(1, 2.667, 2.667), new Date('2025-11-03T12:04:20.620Z')),
                new FrameEnvelope(createVideoFrameFn(1, 2.850, 2.850), new Date('2025-11-03T12:04:20.621Z')),
                new FrameEnvelope(createAudioFrameFn(2, 2.860, 2.860), new Date('2025-11-03T12:04:20.622Z')),
                new FrameEnvelope(createVideoFrameFn(1, 3.200, 3.200), new Date('2025-11-03T12:04:20.800Z')),
                new FrameEnvelope(createAudioFrameFn(2, 3.215, 3.215), new Date('2025-11-03T12:04:20.801Z')),
            ],
            [
                // no frames
            ],
            [
                new FrameEnvelope(createAudioFrameFn(2, 5.701, 5.701), new Date('2025-11-03T12:04:22.711Z')),
                new FrameEnvelope(createVideoFrameFn(1, 5.720, 5.720), new Date('2025-11-03T12:04:22.714Z')),
                new FrameEnvelope(createVideoFrameFn(1, 5.730, 5.730), new Date('2025-11-03T12:04:22.739Z')),
                new FrameEnvelope(createAudioFrameFn(2, 5.731, 5.731), new Date('2025-11-03T12:04:22.756Z')),
                new FrameEnvelope(createVideoFrameFn(1, 5.739, 5.739), new Date('2025-11-03T12:04:22.769Z')),
                new FrameEnvelope(createAudioFrameFn(2, 5.741, 5.741), new Date('2025-11-03T12:04:22.777Z')),
            ],
            [
                new FrameEnvelope(createAudioFrameFn(3, 6.666, 6.666), new Date('2025-11-03T12:04:23.666Z')),
            ]
        ],
        expectedFirstFrameData: new Map([
            [
                'video',
                new Map([
                    [
                        1,
                        {
                            initialReceivedAt: new Date('2025-11-03T12:04:19.568Z'),
                            initialPtsTime: 2.599,
                            initialDtsTime: 2.599
                        }
                    ]
                ])
            ],
            [
                'audio',
                new Map([
                    [
                        2,
                        {
                            initialReceivedAt: new Date('2025-11-03T12:04:19.572Z'),
                            initialPtsTime: 2.603,
                            initialDtsTime: 2.603
                        }
                    ],
                    [
                        3,
                        {
                            initialReceivedAt: new Date('2025-11-03T12:04:23.666Z'),
                            initialPtsTime: 6.666,
                            initialDtsTime: 6.666
                        }
                    ]
                ])
            ]
        ]),
        expectedStats: [
            {
                video: {
                    1: {
                        pts: {
                            min: -0.02100,
                            max: 0.00000,
                            avg: -0.010666,
                        },
                        dts: {
                            min: -0.02100,
                            max: 0.00000,
                            avg: -0.010666,
                        },
                        framesCount: 3
                    }
                },
                audio: {
                    2: {
                        pts: {
                            min: -0.03100,
                            max: 0.00000,
                            avg: -0.01466,
                        },
                        dts: {
                            min: -0.03100,
                            max: 0.00000,
                            avg: -0.01466,
                        },
                        framesCount: 3
                    }
                }
            },
            {
                video: {
                    1: {
                        pts: {
                            min: 0.63100,
                            max: 0.98400,
                            avg: 0.80566,
                        },
                        dts: {
                            min: 0.63100,
                            max: 0.98400,
                            avg: 0.80566,
                        },
                        framesCount: 3
                    }
                },
                audio: {
                    2: {
                        pts: {
                            min: 0.61700,
                            max: 0.97600,
                            avg: 0.79533
                        },
                        dts: {
                            min: 0.61700,
                            max: 0.97600,
                            avg: 0.79533
                        },
                        framesCount: 3
                    }
                }
            },
            {
                video: {
                    1: {
                        pts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        dts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        framesCount: 0
                    }
                },
                audio: {
                    2: {
                        pts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        dts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        framesCount: 0
                    }
                }
            },
            {
                video: {
                    1: {
                        pts: {
                            min: 0.02500,
                            max: 0.06100,
                            avg: 0.04200,
                        },
                        dts: {
                            min: 0.02500,
                            max: 0.06100,
                            avg: 0.04200,
                        },
                        framesCount: 3
                    }
                },
                audio: {
                    2: {
                        pts: {
                            min: 0.04100,
                            max: 0.06700,
                            avg: 0.05466,
                        },
                        dts: {
                            min: 0.04100,
                            max: 0.06700,
                            avg: 0.05466,
                        },
                        framesCount: 3
                    }
                }
            },
            {
                video: {
                    1: {
                        pts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        dts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        framesCount: 0
                    }
                },
                audio: {
                    2: {
                        pts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        dts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        framesCount: 0
                    },
                    3: {
                        pts: {
                            min: 0,
                            max: 0,
                            avg: 0
                        },
                        dts: {
                            min: 0,
                            max: 0,
                            avg: 0
                        },
                        framesCount: 1
                    }
                }
            },
        ]
    };
}

const statsTestData = [
    createTestData(
        'should store stats for VideoFrameSchema1 and AudioFrameSchema1',
        createVideoFrameSchema1,
        createAudioFrameSchema1
    ),
    createTestData(
        'should store stats for VideoFrameSchema2 and AudioFrameSchema2',
        createVideoFrameSchema2,
        createAudioFrameSchema2
    ),
    createTestData(
        'should store stats for VideoFrameSchema3 and AudioFrameSchema3',
        createVideoFrameSchema3,
        createAudioFrameSchema3
    ),
    createTestData(
        'should store stats for VideoFrameSchema4 and AudioFrameSchema4',
        createVideoFrameSchema4,
        createAudioFrameSchema4
    ),
];


module.exports = {
    statsTestData,
};


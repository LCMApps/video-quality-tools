'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

describe('processFrames.identifyGops', () => {

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
            description: 'works okay for the set of frames with two completed gops, starts from key_frame=1',
            input      : [
                {key_frame: 1, width: 1},
                {key_frame: 0, width: 2},
                {key_frame: 0, width: 3},
                {key_frame: 1, width: 4},
                {key_frame: 0, width: 5},
                {key_frame: 0, width: 6},
                {key_frame: 1, width: 7},
                {key_frame: 0, width: 8}
            ],
            res        : [
                [
                    {key_frame: 1, width: 1},
                    {key_frame: 0, width: 2},
                    {key_frame: 0, width: 3},
                ],
                [
                    {key_frame: 1, width: 4},
                    {key_frame: 0, width: 5},
                    {key_frame: 0, width: 6},
                ]
            ]
        },
        {
            description: 'works okay for the set of frames with two completed gops, starts from key_frame=0',
            input      : [
                {key_frame: 0, width: 1},
                {key_frame: 0, width: 2},
                {key_frame: 1, width: 3},
                {key_frame: 0, width: 4},
                {key_frame: 0, width: 5},
                {key_frame: 1, width: 6},
                {key_frame: 0, width: 7},
                {key_frame: 0, width: 8},
                {key_frame: 1, width: 9},
                {key_frame: 0, width: 10},
            ],
            res        : [
                [
                    {key_frame: 1, width: 3},
                    {key_frame: 0, width: 4},
                    {key_frame: 0, width: 5},
                ],
                [
                    {key_frame: 1, width: 6},
                    {key_frame: 0, width: 7},
                    {key_frame: 0, width: 8},
                ]
            ]
        }
    ];

    dataDriven(testData, () => {
        it('{description}', ctx => {
            const expectedResult = ctx.res;

            const gops = processFrames.identifyGops(ctx.input);

            assert.deepEqual(gops, expectedResult);
        });
    });

});

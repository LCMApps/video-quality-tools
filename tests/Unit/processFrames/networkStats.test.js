'use strict';

const _          = require('lodash');
const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

const {invalidFramesTypes, invalidDurationInSecTypes, testData} = require('./networkStats.data');

const PRECISION = 0.00001;

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('processFrames.networkStats', () => {

    dataDriven(
        invalidFramesTypes.map(item => ({type: typeOf(item), item: item})),
        () => {
            it('must throw an exception for invalid input {type} type for frames', ctx => {
                assert.throws(() => {
                    processFrames.networkStats(ctx.item);
                }, TypeError, 'Method accepts only an array of frames');
            });
        }
    );

    dataDriven(
        invalidDurationInSecTypes.map(item => ({type: typeOf(item), item: item})),
        () => {
            it('must throw an exception for invalid input {type} type for durationInMsec', ctx => {
                assert.throws(() => {
                    processFrames.networkStats([], ctx.item);
                }, TypeError, 'Method accepts only a positive integer as duration');
            });
        }
    );

    dataDriven(testData, () => {
        it('{description}', ctx => {
            const expectedResult = ctx.expected;

            const result = processFrames.networkStats(ctx.frames, ctx.durationInMsec);

            assert.isTrue(_.inRange(
                result.videoFrameRate,
                expectedResult.videoFrameRate - PRECISION,
                expectedResult.videoFrameRate + PRECISION,
            ));

            assert.isTrue(_.inRange(
                result.audioFrameRate,
                expectedResult.audioFrameRate - PRECISION,
                expectedResult.audioFrameRate + PRECISION,
            ));

            assert.isTrue(_.inRange(
                result.videoBitrate,
                expectedResult.videoBitrate - PRECISION,
                expectedResult.videoBitrate + PRECISION
            ));

            assert.isTrue(_.inRange(
                result.audioBitrate,
                expectedResult.audioBitrate - PRECISION,
                expectedResult.audioBitrate + PRECISION
            ));
        });
    });
});

'use strict';

const _ = require('lodash');
const {assert} = require('chai');
const dataDriven = require('data-driven');
const sinon = require('sinon');

const Errors = require('src/Errors/');

const {
    DriftStatsProcessor,
    durationInMs,
    createVideoFrameSchema1,
    createVideoFrameSchema2,
    createVideoFrameSchema3,
    createVideoFrameSchema4,
    createAudioFrameSchema1,
    createAudioFrameSchema2,
    createAudioFrameSchema3,
    createAudioFrameSchema4,
    createFrameEnvelope
} = require('./Helpers');

const testData = require('./stats.data');

const PRECISION = 0.00001;

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

function assertNullOrInRange(groupNo, mediaType, streamIndex, varName, actualValue, expectedValue) {
    if (expectedValue === null) {
        assert.isNull(actualValue, `${varName} expected to be null`);
        return;
    }

    assert.isTrue(
        _.inRange(actualValue, expectedValue - PRECISION, expectedValue + PRECISION),
        `${varName} (${actualValue}) is not in the expected range of `
        + `${expectedValue - PRECISION} to ${expectedValue + PRECISION}`
        + `mediaType: ${mediaType}, streamIndex: ${streamIndex}, groupNo: ${groupNo}`
    );
}

describe('DriftStatsProcessor::stats', () => {
    let processor;

    before(() => {
        this.clock = sinon.useFakeTimers();
    });

    after(() => {
        this.clock.restore();
    });

    beforeEach(() => {
        processor = new DriftStatsProcessor(durationInMs);
    });

    afterEach(() => {
        if (processor && processor.isStarted()) {
            processor.stop();
        }
    });

    dataDriven(testData.statsTestData, () => {
        it('{description}', ctx => {
            // sanity check
            assert.strictEqual(
                ctx.frameGroups.length,
                ctx.expectedStats.length,
                'test data is incorrect. frameGroups and expectedStats have different lengths'
            );

            processor.start();

            const spyOnStats = sinon.spy();
            processor.on('stats', spyOnStats);

            let frameGroupNo = 1;
            ctx.frameGroups.forEach(frameGroup => {


                frameGroup.forEach(frame => {
                    processor.addFrameEnvelope(frame);
                });


                this.clock.tick(ctx.durationInMs);

                assert.isTrue(spyOnStats.callCount === frameGroupNo, 'spyOnStats was called the wrong number of times');

                const spyOnStatsArgs = spyOnStats.getCall(frameGroupNo - 1).args[0];
                const expectedStats = ctx.expectedStats[frameGroupNo - 1];
                
                assert.hasAllKeys(
                    spyOnStatsArgs,
                    expectedStats,
                    `spyOnStatsArgs and expectedStats have different media types. mediaTypes: `
                        + `"${Object.keys(spyOnStatsArgs)}" and "${Object.keys(expectedStats)}". `
                        + `groupNo: ${frameGroupNo}`
                );

                for (const mediaType of Object.keys(spyOnStatsArgs)) {
                    assert.hasAllKeys(
                        spyOnStatsArgs[mediaType],
                        expectedStats[mediaType],
                        'spyOnStatsArgs and expectedStats have different stream indices'
                    );

                    for (const streamIndex of Object.keys(spyOnStatsArgs[mediaType])) {
                        assert.hasAllKeys(
                            spyOnStatsArgs[mediaType][streamIndex],
                            expectedStats[mediaType][streamIndex],
                            'spyOnStatsArgs and expectedStats have different keys'
                        );

                        const spyOnStatsDts = spyOnStatsArgs[mediaType][streamIndex].dts;
                        const expectedStatsDts = expectedStats[mediaType][streamIndex].dts;

                        const spyOnStatsPts = spyOnStatsArgs[mediaType][streamIndex].pts;
                        const expectedStatsPts = expectedStats[mediaType][streamIndex].pts;

                        const spyOnStatsFramesCount = spyOnStatsArgs[mediaType][streamIndex].framesCount;
                        const expectedStatsFramesCount = expectedStats[mediaType][streamIndex].framesCount;

                        assert.strictEqual(
                            spyOnStatsFramesCount,
                            expectedStatsFramesCount,
                            'spyOnStatsFramesCount is not the expected value. '
                                + `mediaType: ${mediaType}, streamIndex: ${streamIndex}, groupNo: ${frameGroupNo}`
                        );

                        assertNullOrInRange(
                            frameGroupNo, mediaType, streamIndex,
                            'spyOnStatsDts.avg', spyOnStatsDts.avg, expectedStatsDts.avg
                        );

                        assertNullOrInRange(
                            frameGroupNo, mediaType, streamIndex,
                            'spyOnStatsPts.avg', spyOnStatsPts.avg, expectedStatsPts.avg
                        );

                        assertNullOrInRange(
                            frameGroupNo, mediaType, streamIndex,
                            'spyOnStatsDts.min', spyOnStatsDts.min, expectedStatsDts.min
                        );

                        assertNullOrInRange(
                            frameGroupNo, mediaType, streamIndex,
                            'spyOnStatsPts.min', spyOnStatsPts.min, expectedStatsPts.min
                        );

                        assertNullOrInRange(
                            frameGroupNo, mediaType, streamIndex,
                            'spyOnStatsDts.avg', spyOnStatsDts.avg, expectedStatsDts.avg
                        );

                        assertNullOrInRange(
                            frameGroupNo, mediaType, streamIndex,
                            'spyOnStatsPts.avg', spyOnStatsPts.avg, expectedStatsPts.avg
                        );

                        assertNullOrInRange(
                            frameGroupNo, mediaType, streamIndex,
                            'spyOnStatsDts.max', spyOnStatsDts.max, expectedStatsDts.max
                        );

                        assertNullOrInRange(
                            frameGroupNo, mediaType, streamIndex,
                            'spyOnStatsPts.max', spyOnStatsPts.max, expectedStatsPts.max
                        );
                    }
                }

                frameGroupNo++;
            });

            const actualFirstFrameData = processor._firstFrameData;
            const expectedFirstFrameData = ctx.expectedFirstFrameData;
            assert.deepStrictEqual(actualFirstFrameData, expectedFirstFrameData);
        });
    });
});



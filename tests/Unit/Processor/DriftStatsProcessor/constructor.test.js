'use strict';

const {assert} = require('chai');
const dataDriven = require('data-driven');

const Errors = require('src/Errors/');

const {DriftStatsProcessor, durationInMs} = require('./Helpers');

const testData = require('./constructor.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('DriftStatsProcessor::constructor', () => {
    dataDriven(
        testData.incorrectDurationInMs.map(item => ({type: typeOf(item), durationInMs: item})),
        () => {
            it('durationInMs param has invalid ({type}) type', ctx => {
                assert.throws(() => {
                    new DriftStatsProcessor(ctx.durationInMs);
                }, Errors.ConfigError, 'Expected durationInMs to be a positive integer greater than 0.');
            });
        }
    );

    dataDriven(testData.incorrectDurationInMsValues, () => {
        it('{description}', ctx => {
            assert.throws(() => {
                new DriftStatsProcessor(ctx.durationInMs);
            }, Errors.ConfigError, ctx.errorMsg);
        });
    });

    it('all params are good', () => {
        const processor = new DriftStatsProcessor(durationInMs);

        assert.strictEqual(processor._durationInMs, durationInMs);
        assert.isFalse(processor._isStarted);
        assert.isNull(processor._intervalId);
        
        assert.instanceOf(processor._firstFrameData, Map);
        assert.strictEqual(processor._firstFrameData.size, 0);
        
        assert.instanceOf(processor._framesBuffer, Map);
        assert.strictEqual(processor._framesBuffer.size, 0);
        
        assert.instanceOf(processor._ignoredStreams, Map);
        assert.strictEqual(processor._ignoredStreams.size, 0);
    });
});


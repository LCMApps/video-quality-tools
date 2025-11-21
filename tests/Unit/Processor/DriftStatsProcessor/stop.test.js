'use strict';

const {assert} = require('chai');

const {DriftStatsProcessor, durationInMs} = require('./Helpers');

describe('DriftStatsProcessor::stop', () => {
    let processor;

    beforeEach(() => {
        processor = new DriftStatsProcessor(durationInMs);
    });

    afterEach(() => {
        if (processor.isStarted()) {
            processor.stop();
        }
    });

    it('should stop the processor and clear internal state', () => {
        processor.start();
        
        assert.isTrue(processor._isStarted);
        assert.isNotNull(processor._intervalId);

        processor.stop();

        assert.isFalse(processor._isStarted);
        assert.isNull(processor._intervalId);
    });

    it('should clear internal structures when stopping', () => {
        processor.start();
        
        // Manually add some data to internal structures
        processor._firstFrameData.set('video', new Map([[0, {initialReceivedAt: new Date()}]]));
        processor._framesBuffer.set('audio', new Map([[1, []]]));
        processor._ignoredStreams.set('video', new Set([2]));

        assert.strictEqual(processor._firstFrameData.size, 1);
        assert.strictEqual(processor._framesBuffer.size, 1);
        assert.strictEqual(processor._ignoredStreams.size, 1);

        processor.stop();

        assert.strictEqual(processor._firstFrameData.size, 0);
        assert.strictEqual(processor._framesBuffer.size, 0);
        assert.strictEqual(processor._ignoredStreams.size, 0);
    });

    it('should not throw error when calling stop multiple times', () => {
        processor.start();
        
        assert.doesNotThrow(() => {
            processor.stop();
            processor.stop();
            processor.stop();
        });

        assert.isFalse(processor.isStarted());
    });

    it('should not throw error when calling stop on not started processor', () => {
        assert.isFalse(processor.isStarted());

        assert.doesNotThrow(() => {
            processor.stop();
        });

        assert.isFalse(processor.isStarted());
    });
});


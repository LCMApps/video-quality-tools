'use strict';

const {assert} = require('chai');

const Errors = require('src/Errors/');

const {DriftStatsProcessor, durationInMs} = require('./Helpers');

describe('DriftStatsProcessor::start', () => {
    let processor;

    beforeEach(() => {
        processor = new DriftStatsProcessor(durationInMs);
    });

    afterEach(() => {
        if (processor.isStarted()) {
            processor.stop();
        }
    });

    it('should start the processor and set internal state', () => {
        processor.start();

        assert.isTrue(processor._isStarted);
        assert.isNotNull(processor._intervalId);
    });

    it('should throw error when trying to start already started processor', () => {
        processor.start();

        assert.throws(() => {
            processor.start();
        }, Errors.ProcessorAlreadyStartedError, 'Processor is already started.');
    });

    it('should clear internal structures when starting', () => {
        // Manually add some data to internal structures
        processor._firstFrameData.set('video', new Map([[0, {initialReceivedAt: new Date()}]]));
        processor._framesBuffer.set('audio', new Map([[1, []]]));
        processor._ignoredStreams.set('video', new Set([2]));

        assert.strictEqual(processor._firstFrameData.size, 1);
        assert.strictEqual(processor._framesBuffer.size, 1);
        assert.strictEqual(processor._ignoredStreams.size, 1);

        processor.start();

        assert.strictEqual(processor._firstFrameData.size, 0);
        assert.strictEqual(processor._framesBuffer.size, 0);
        assert.strictEqual(processor._ignoredStreams.size, 0);
    });

    it('should be able to start after stopping', () => {
        processor.start();
        assert.isTrue(processor.isStarted());

        processor.stop();
        assert.isFalse(processor.isStarted());

        processor.start();
        assert.isTrue(processor.isStarted());
    });
});


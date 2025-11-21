'use strict';

const {assert} = require('chai');

const {DriftStatsProcessor, durationInMs} = require('./Helpers');

describe('DriftStatsProcessor::isStarted', () => {
    let processor;

    beforeEach(() => {
        processor = new DriftStatsProcessor(durationInMs);
    });

    afterEach(() => {
        if (processor.isStarted()) {
            processor.stop();
        }
    });

    it('must return false when processor is not started', () => {
        assert.isFalse(processor.isStarted());
    });

    it('must return true when processor is started', () => {
        processor.start();
        assert.isTrue(processor.isStarted());
    });

    it('must return false after processor is stopped', () => {
        processor.start();
        assert.isTrue(processor.isStarted());
        
        processor.stop();
        assert.isFalse(processor.isStarted());
    });
});


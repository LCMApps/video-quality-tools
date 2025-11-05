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

const testData = require('./addFrameEnvelope.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('DriftStatsProcessor::addFrameEnvelope', () => {
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
        if (processor.isStarted()) {
            processor.stop();
        }
    });

    it('should throw error when processor is not started', () => {
        const frame = createVideoFrameSchema1(1, 1.0, 1.0);
        const envelope = createFrameEnvelope(frame, new Date());

        assert.throws(() => {
            processor.addFrameEnvelope(envelope);
        }, Errors.ProcessorNotStartedError, 'Cannot add frame envelope when processor is not started.');
    });

    dataDriven(
        testData.incorrectFrameEnvelope.map(item => ({type: typeOf(item), frameEnvelope: item})),
        () => {
            it('frameEnvelope param has invalid ({type}) type', ctx => {
                processor.start();

                assert.throws(() => {
                    processor.addFrameEnvelope(ctx.frameEnvelope);
                }, TypeError, 'Expected frameEnvelope to be an instance of FrameEnvelope.');
            });
        }
    );

    it('should buffer all frames including first frame', () => {
        processor.start();

        const receivedAt1 = new Date();
        const frame1 = createVideoFrameSchema1(0, 1.0, 0.9);
        const envelope1 = createFrameEnvelope(frame1, receivedAt1);
        processor.addFrameEnvelope(envelope1);

        // Add subsequent frames
        const receivedAt2 = new Date(receivedAt1.getTime() + 100);
        const frame2 = createVideoFrameSchema1(0, 1.1, 1.0);
        const envelope2 = createFrameEnvelope(frame2, receivedAt2);
        processor.addFrameEnvelope(envelope2);

        const receivedAt3 = new Date(receivedAt1.getTime() + 200);
        const frame3 = createVideoFrameSchema1(0, 1.2, 1.1);
        const envelope3 = createFrameEnvelope(frame3, receivedAt3);
        processor.addFrameEnvelope(envelope3);

        assert.isTrue(processor._framesBuffer.has('video'));
        const videoBuffer = processor._framesBuffer.get('video');
        assert.isTrue(videoBuffer.has(0));

        const frames = videoBuffer.get(0);
        assert.strictEqual(frames.length, 3);
        assert.strictEqual(frames[0], envelope1);
        assert.strictEqual(frames[1], envelope2);
        assert.strictEqual(frames[2], envelope3);
    });


    it('should ignore non-audio and non-video media types', () => {
        processor.start();

        const receivedAt = new Date();
        const subtitleFrame = createVideoFrameSchema1(0, 1.0, 0.9);
        // Override media type
        subtitleFrame._mediaType = 'subtitle';
        
        const envelope = createFrameEnvelope(subtitleFrame, receivedAt);
        processor.addFrameEnvelope(envelope);

        assert.isFalse(processor._firstFrameData.has('subtitle'));
    });

    it('should emit error and ignore stream when stream_index is null', (done) => {
        processor.start();

        processor.on('error', (error) => {
            assert.instanceOf(error, Errors.IncompleteFrameDataError);
            assert.strictEqual(error.message, 'Frame has incomplete data and will be ignored.');
            assert.strictEqual(error.extra.mediaType, 'video');
            assert.isNull(error.extra.streamIndex);
            assert.strictEqual(error.extra.missingField, 'stream_index');

            // Verify stream is ignored
            assert.isTrue(processor._ignoredStreams.has('video'));
            const ignoredSet = processor._ignoredStreams.get('video');
            assert.isTrue(ignoredSet.has(null));

            done();
        });

        const receivedAt = new Date();
        const frame = createVideoFrameSchema1(null, 1.0, 0.9);
        const envelope = createFrameEnvelope(frame, receivedAt);
        processor.addFrameEnvelope(envelope);
    });

    it('should emit error and ignore stream when pts_time is null', (done) => {
        processor.start();

        processor.on('error', (error) => {
            assert.instanceOf(error, Errors.IncompleteFrameDataError);
            assert.strictEqual(error.extra.mediaType, 'video');
            assert.strictEqual(error.extra.streamIndex, 0);
            assert.strictEqual(error.extra.missingField, 'pts_time');

            // Verify stream is ignored
            assert.isTrue(processor._ignoredStreams.has('video'));
            const ignoredSet = processor._ignoredStreams.get('video');
            assert.isTrue(ignoredSet.has(0));

            done();
        });

        const receivedAt = new Date();
        const frame = createVideoFrameSchema1(0, null, 0.9);
        const envelope = createFrameEnvelope(frame, receivedAt);
        processor.addFrameEnvelope(envelope);
    });

    it('should emit error and ignore stream when dts_time is null', (done) => {
        processor.start();

        processor.on('error', (error) => {
            assert.instanceOf(error, Errors.IncompleteFrameDataError);
            assert.strictEqual(error.extra.mediaType, 'audio');
            assert.strictEqual(error.extra.streamIndex, 1);
            assert.strictEqual(error.extra.missingField, 'dts_time');

            done();
        });

        const receivedAt = new Date();
        const frame = createAudioFrameSchema2(1, 1.5, null);
        const envelope = createFrameEnvelope(frame, receivedAt);
        processor.addFrameEnvelope(envelope);
    });

    it('should emit error only once per stream and ignore subsequent frames from that stream', () => {
        processor.start();

        let errorCount = 0;

        processor.on('error', (error) => {
            errorCount++;
            assert.strictEqual(error.extra.mediaType, 'video');
            assert.strictEqual(error.extra.streamIndex, 0);
        });

        const receivedAt = new Date();

        // First frame with null pts_time - should emit error
        const frame1 = createVideoFrameSchema1(0, null, 0.9);
        processor.addFrameEnvelope(createFrameEnvelope(frame1, receivedAt));

        // Second frame with null pts_time - should NOT emit error
        const frame2 = createVideoFrameSchema1(0, null, 1.0);
        processor.addFrameEnvelope(createFrameEnvelope(frame2, receivedAt));

        // Third frame with valid data - should NOT emit error and should be ignored
        const frame3 = createVideoFrameSchema1(0, 1.5, 1.4);
        processor.addFrameEnvelope(createFrameEnvelope(frame3, receivedAt));

        // Error emission is synchronous, so we can check immediately
        assert.strictEqual(errorCount, 1);
        
        // Verify no data was stored for this stream
        assert.isFalse(processor._firstFrameData.has('video') && 
                      processor._firstFrameData.get('video').has(0));
    });

    it('should handle mix of valid frames and frames with incomplete data across multiple streams', () => {
        processor.start();

        const errors = [];
        processor.on('error', (error) => {
            errors.push(error);
        });

        const receivedAt = new Date();

        // Video stream 0 - valid
        const videoFrame0 = createVideoFrameSchema1(0, 1.0, 0.9);
        processor.addFrameEnvelope(createFrameEnvelope(videoFrame0, receivedAt));

        // Video stream 1 - invalid (null pts)
        const videoFrame1 = createVideoFrameSchema1(1, null, 0.9);
        processor.addFrameEnvelope(createFrameEnvelope(videoFrame1, receivedAt));

        // Audio stream 0 - valid
        const audioFrame0 = createAudioFrameSchema1(0, 1.5, 1.4);
        processor.addFrameEnvelope(createFrameEnvelope(audioFrame0, receivedAt));

        // Audio stream 1 - invalid (null dts)
        const audioFrame1 = createAudioFrameSchema1(1, 2.5, null);
        processor.addFrameEnvelope(createFrameEnvelope(audioFrame1, receivedAt));

        // Error emission is synchronous, so we can check immediately
        // Should have 2 errors
        assert.strictEqual(errors.length, 2);

        // Verify valid streams were stored
        const videoMap = processor._firstFrameData.get('video');
        assert.isTrue(videoMap.has(0));
        assert.isFalse(videoMap.has(1));

        const audioMap = processor._firstFrameData.get('audio');
        assert.isTrue(audioMap.has(0));
        assert.isFalse(audioMap.has(1));
    });
});

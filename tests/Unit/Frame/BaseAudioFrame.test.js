'use strict';

const { assert } = require('chai');
const BaseAudioFrame = require('src/Frame/BaseAudioFrame');
const FRAME_FIELD_NAMES = require('src/Frame/rawFrameFieldNames');

class DummyAudioFrame extends BaseAudioFrame {
    static get schema() {
        return 0;
    }

    constructor(data) {
        super(data);
    }
}

describe('BaseAudioFrame', function () {
    it('should throw TypeError when constructor argument is not an object', function () {
        assert.throws(
            () => new DummyAudioFrame(undefined),
            TypeError,
            'Expected an object as constructor argument.'
        );
        assert.throws(
            () => new DummyAudioFrame(null),
            TypeError,
            'Expected an object as constructor argument.'
        );
        assert.throws(
            () => new DummyAudioFrame(123),
            TypeError,
            'Expected an object as constructor argument.'
        );
        assert.throws(
            () => new DummyAudioFrame('oops'),
            TypeError,
            'Expected an object as constructor argument.'
        );
    });

    it('should map audio-specific fields from input object', function () {
        const input = {
            // базовые поля допустимы, но в этом тесте нам важны аудио-специфичные
            [FRAME_FIELD_NAMES.SAMPLE_FMT]: 'fltp',
            [FRAME_FIELD_NAMES.NB_SAMPLES]: 1024,
            [FRAME_FIELD_NAMES.CHANNELS]: 2,
            [FRAME_FIELD_NAMES.CHANNEL_LAYOUT]: 'stereo',
            extra_field: 'ignored'
        };

        const frame = new DummyAudioFrame(input);

        assert.strictEqual(frame.getSampleFmt(), 'fltp');
        assert.strictEqual(frame.getNbSamples(), 1024);
        assert.strictEqual(frame.getChannels(), 2);
        assert.strictEqual(frame.getChannelLayout(), 'stereo');
    });

    it('should set audio-specific fields to null when missing', function () {
        const frame = new DummyAudioFrame({});

        assert.isNull(frame.getSampleFmt());
        assert.isNull(frame.getNbSamples());
        assert.isNull(frame.getChannels());
        assert.isNull(frame.getChannelLayout());
    });

    it('should preserve explicit null values for audio-specific fields', function () {
        const frame = new DummyAudioFrame({
            [FRAME_FIELD_NAMES.SAMPLE_FMT]: null,
            [FRAME_FIELD_NAMES.NB_SAMPLES]: null,
            [FRAME_FIELD_NAMES.CHANNELS]: null,
            [FRAME_FIELD_NAMES.CHANNEL_LAYOUT]: null
        });

        assert.isNull(frame.getSampleFmt());
        assert.isNull(frame.getNbSamples());
        assert.isNull(frame.getChannels());
        assert.isNull(frame.getChannelLayout());
    });

    it('should ignore unknown fields', function () {
        const frame = new DummyAudioFrame({
            [FRAME_FIELD_NAMES.SAMPLE_FMT]: 's16',
            unknown_field: 123
        });

        assert.strictEqual(frame.getSampleFmt(), 's16');
        assert.notProperty(frame, '_unknown_field');
    });

    describe('validation errors', function () {
        const validBase = () => ({
            [FRAME_FIELD_NAMES.SAMPLE_FMT]: 'fltp',
            [FRAME_FIELD_NAMES.NB_SAMPLES]: 100,
            [FRAME_FIELD_NAMES.CHANNELS]: 2,
            [FRAME_FIELD_NAMES.CHANNEL_LAYOUT]: 'stereo'
        });

        it('should validate sample_fmt as string or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.SAMPLE_FMT] = 42;
            assert.throws(
                () => new DummyAudioFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.SAMPLE_FMT}: expected string or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.SAMPLE_FMT] = { fmt: 'fltp' };
            assert.throws(
                () => new DummyAudioFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.SAMPLE_FMT}: expected string or null`)
            );
        });

        it('should validate nb_samples as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.NB_SAMPLES] = -1;
            assert.throws(
                () => new DummyAudioFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.NB_SAMPLES}: expected non-negative integer or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.NB_SAMPLES] = 12.34;
            assert.throws(
                () => new DummyAudioFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.NB_SAMPLES}: expected non-negative integer or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.NB_SAMPLES] = '100';
            assert.throws(
                () => new DummyAudioFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.NB_SAMPLES}: expected non-negative integer or null`)
            );
        });

        it('should validate channels as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.CHANNELS] = -2;
            assert.throws(
                () => new DummyAudioFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.CHANNELS}: expected non-negative integer or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.CHANNELS] = 1.5;
            assert.throws(
                () => new DummyAudioFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.CHANNELS}: expected non-negative integer or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.CHANNELS] = '2';
            assert.throws(
                () => new DummyAudioFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.CHANNELS}: expected non-negative integer or null`)
            );
        });

        it('should validate channel_layout as string or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.CHANNEL_LAYOUT] = 123;
            assert.throws(
                () => new DummyAudioFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.CHANNEL_LAYOUT}: expected string or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.CHANNEL_LAYOUT] = { layout: 'stereo' };
            assert.throws(
                () => new DummyAudioFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.CHANNEL_LAYOUT}: expected string or null`)
            );
        });
    });

    describe('edge cases', function () {
        it('should allow nb_samples = 0 and channels = 0 (when present)', function () {
            const frame = new DummyAudioFrame({
                [FRAME_FIELD_NAMES.SAMPLE_FMT]: 'fltp',
                [FRAME_FIELD_NAMES.NB_SAMPLES]: 0,
                [FRAME_FIELD_NAMES.CHANNELS]: 0,
                [FRAME_FIELD_NAMES.CHANNEL_LAYOUT]: 'mono'
            });

            assert.strictEqual(frame.getNbSamples(), 0);
            assert.strictEqual(frame.getChannels(), 0);
        });
    });
});

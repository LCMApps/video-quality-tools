'use strict';

const { assert } = require('chai');
const BaseVideoFrame = require('src/Frame/BaseVideoFrame');
const FRAME_FIELD_NAMES = require('src/Frame/rawFrameFieldNames');

class DummyVideoFrame extends BaseVideoFrame {
    static get schema() {
        return 0;
    }

    constructor(data) {
        super(data);
    }
}

describe('BaseVideoFrame', function () {
    it('should throw TypeError when constructor argument is not an object', function () {
        assert.throws(
            () => new DummyVideoFrame(undefined),
            TypeError,
            'Expected an object as constructor argument.'
        );

        assert.throws(
            () => new DummyVideoFrame(null),
            TypeError,
            'Expected an object as constructor argument.'
        );

        assert.throws(
            () => new DummyVideoFrame(123),
            TypeError,
            'Expected an object as constructor argument.'
        );

        assert.throws(
            () => new DummyVideoFrame('oops'),
            TypeError,
            'Expected an object as constructor argument.'
        );
    });

    it('should map video-specific fields from input object', function () {
        const input = {
            [FRAME_FIELD_NAMES.WIDTH]: 1280,
            [FRAME_FIELD_NAMES.HEIGHT]: 720,
            [FRAME_FIELD_NAMES.PIX_FMT]: 'yuv420p',
            [FRAME_FIELD_NAMES.SAMPLE_ASPECT_RATIO]: '1:1',
            [FRAME_FIELD_NAMES.PICT_TYPE]: 'I',
            [FRAME_FIELD_NAMES.INTERLACED_FRAME]: 0,
            [FRAME_FIELD_NAMES.TOP_FIELD_FIRST]: 0,
            [FRAME_FIELD_NAMES.REPEAT_PICT]: 0,
            extra_field: 'ignored'
        };

        const frame = new DummyVideoFrame(input);

        assert.strictEqual(frame.getWidth(), 1280);
        assert.strictEqual(frame.getHeight(), 720);
        assert.strictEqual(frame.getPixFmt(), 'yuv420p');
        assert.strictEqual(frame.getSampleAspectRatio(), '1:1');
        assert.strictEqual(frame.getPictType(), 'I');
        assert.strictEqual(frame.getInterlacedFrame(), 0);
        assert.strictEqual(frame.getTopFieldFirst(), 0);
        assert.strictEqual(frame.getRepeatPict(), 0);
    });

    it('should set video-specific fields to null when missing', function () {
        const frame = new DummyVideoFrame({});

        assert.isNull(frame.getWidth());
        assert.isNull(frame.getHeight());
        assert.isNull(frame.getPixFmt());
        assert.isNull(frame.getSampleAspectRatio());
        assert.isNull(frame.getPictType());
        assert.isNull(frame.getInterlacedFrame());
        assert.isNull(frame.getTopFieldFirst());
        assert.isNull(frame.getRepeatPict());
    });

    it('should preserve explicit null values', function () {
        const frame = new DummyVideoFrame({
            [FRAME_FIELD_NAMES.WIDTH]: null,
            [FRAME_FIELD_NAMES.HEIGHT]: null,
            [FRAME_FIELD_NAMES.PIX_FMT]: null,
            [FRAME_FIELD_NAMES.SAMPLE_ASPECT_RATIO]: null,
            [FRAME_FIELD_NAMES.PICT_TYPE]: null,
            [FRAME_FIELD_NAMES.INTERLACED_FRAME]: null,
            [FRAME_FIELD_NAMES.TOP_FIELD_FIRST]: null,
            [FRAME_FIELD_NAMES.REPEAT_PICT]: null
        });

        assert.isNull(frame.getWidth());
        assert.isNull(frame.getHeight());
        assert.isNull(frame.getPixFmt());
        assert.isNull(frame.getSampleAspectRatio());
        assert.isNull(frame.getPictType());
        assert.isNull(frame.getInterlacedFrame());
        assert.isNull(frame.getTopFieldFirst());
        assert.isNull(frame.getRepeatPict());
    });

    it('should ignore unknown fields', function () {
        const frame = new DummyVideoFrame({
            [FRAME_FIELD_NAMES.WIDTH]: 1920,
            unknown_field: 'value'
        });

        assert.strictEqual(frame.getWidth(), 1920);
        assert.notProperty(frame, '_unknown_field');
    });

    describe('validation errors', function () {
        const validBase = () => ({
            [FRAME_FIELD_NAMES.WIDTH]: 640,
            [FRAME_FIELD_NAMES.HEIGHT]: 360,
            [FRAME_FIELD_NAMES.PIX_FMT]: 'yuv420p',
            [FRAME_FIELD_NAMES.SAMPLE_ASPECT_RATIO]: '1:1',
            [FRAME_FIELD_NAMES.PICT_TYPE]: 'P',
            [FRAME_FIELD_NAMES.INTERLACED_FRAME]: 0,
            [FRAME_FIELD_NAMES.TOP_FIELD_FIRST]: 1,
            [FRAME_FIELD_NAMES.REPEAT_PICT]: 0
        });

        it('should validate width as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.WIDTH] = -1;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.WIDTH}: expected non-negative integer or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.WIDTH] = 12.5;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.WIDTH}: expected non-negative integer or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.WIDTH] = '640';
            assert.throws(
                () => new DummyVideoFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.WIDTH}: expected non-negative integer or null`)
            );
        });

        it('should validate height as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.HEIGHT] = -1;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.HEIGHT}: expected non-negative integer or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.HEIGHT] = 12.5;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.HEIGHT}: expected non-negative integer or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.HEIGHT] = '360';
            assert.throws(
                () => new DummyVideoFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.HEIGHT}: expected non-negative integer or null`)
            );
        });

        it('should validate pix_fmt as string or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PIX_FMT] = 123;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PIX_FMT}: expected string or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PIX_FMT] = { fmt: 'yuv420p' };
            assert.throws(
                () => new DummyVideoFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PIX_FMT}: expected string or null`)
            );
        });

        it('should validate sample_aspect_ratio as string or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.SAMPLE_ASPECT_RATIO] = 1.0;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.SAMPLE_ASPECT_RATIO}: expected string or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.SAMPLE_ASPECT_RATIO] = { sar: '1:1' };
            assert.throws(
                () => new DummyVideoFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.SAMPLE_ASPECT_RATIO}: expected string or null`)
            );
        });

        it('should validate pict_type as string or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PICT_TYPE] = 1;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PICT_TYPE}: expected string or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PICT_TYPE] = { t: 'I' };
            assert.throws(
                () => new DummyVideoFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PICT_TYPE}: expected string or null`)
            );
        });

        it('should validate interlaced_frame as 0 or 1 or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.INTERLACED_FRAME] = -1;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.INTERLACED_FRAME}: expected 0 or 1 or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.INTERLACED_FRAME] = 2;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.INTERLACED_FRAME}: expected 0 or 1 or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.INTERLACED_FRAME] = 1.1;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.INTERLACED_FRAME}: expected 0 or 1 or null`)
            );

            const invalidFrame4 = validBase();
            invalidFrame4[FRAME_FIELD_NAMES.INTERLACED_FRAME] = '1';
            assert.throws(
                () => new DummyVideoFrame(invalidFrame4),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.INTERLACED_FRAME}: expected 0 or 1 or null`)
            );
        });

        it('should validate top_field_first as 0 or 1 or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.TOP_FIELD_FIRST] = -1;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.TOP_FIELD_FIRST}: expected 0 or 1 or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.TOP_FIELD_FIRST] = 2;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.TOP_FIELD_FIRST}: expected 0 or 1 or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.TOP_FIELD_FIRST] = 0.5;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.TOP_FIELD_FIRST}: expected 0 or 1 or null`)
            );

            const invalidFrame4 = validBase();
            invalidFrame4[FRAME_FIELD_NAMES.TOP_FIELD_FIRST] = '0';
            assert.throws(
                () => new DummyVideoFrame(invalidFrame4),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.TOP_FIELD_FIRST}: expected 0 or 1 or null`)
            );
        });

        it('should validate repeat_pict as non-negative number or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.REPEAT_PICT] = -1;
            assert.throws(
                () => new DummyVideoFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.REPEAT_PICT}: expected non-negative number or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.REPEAT_PICT] = '1';
            assert.throws(
                () => new DummyVideoFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.REPEAT_PICT}: expected non-negative number or null`)
            );
        });
    });

    describe('edge cases', function () {
        it('should allow width = 0 and height = 0', function () {
            const frame = new DummyVideoFrame({
                [FRAME_FIELD_NAMES.WIDTH]: 0,
                [FRAME_FIELD_NAMES.HEIGHT]: 0
            });

            assert.strictEqual(frame.getWidth(), 0);
            assert.strictEqual(frame.getHeight(), 0);
        });

        it('should allow interlaced_frame and top_field_first to be 0 or 1', function () {
            const f0 = new DummyVideoFrame({
                [FRAME_FIELD_NAMES.INTERLACED_FRAME]: 0,
                [FRAME_FIELD_NAMES.TOP_FIELD_FIRST]: 0
            });
            assert.strictEqual(f0.getInterlacedFrame(), 0);
            assert.strictEqual(f0.getTopFieldFirst(), 0);

            const f1 = new DummyVideoFrame({
                [FRAME_FIELD_NAMES.INTERLACED_FRAME]: 1,
                [FRAME_FIELD_NAMES.TOP_FIELD_FIRST]: 1
            });
            assert.strictEqual(f1.getInterlacedFrame(), 1);
            assert.strictEqual(f1.getTopFieldFirst(), 1);
        });

        it('should allow repeat_pict = 0', function () {
            const frame = new DummyVideoFrame({ [FRAME_FIELD_NAMES.REPEAT_PICT]: 0 });
            assert.strictEqual(frame.getRepeatPict(), 0);
        });
    });
});

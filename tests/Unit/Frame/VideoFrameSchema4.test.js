'use strict';

const { assert } = require('chai');
const VideoFrameSchema4 = require('src/Frame/VideoFrameSchema4');
const FRAME_FIELD_NAMES = require('src/Frame/rawFrameFieldNames');

describe('VideoFrameSchema4', function () {
    it(
        'should throw TypeError when constructor argument is not an object',
        function () {
            assert.throws(
                () => new VideoFrameSchema4(undefined),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new VideoFrameSchema4(null),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new VideoFrameSchema4(123),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new VideoFrameSchema4('oops'),
                TypeError,
                'Expected an object as constructor argument.'
            );
        }
    );

    it('should map pts and duration fields from input object', function () {
        const input = {
            [FRAME_FIELD_NAMES.PTS]: 9000,
            [FRAME_FIELD_NAMES.PTS_TIME]: 0.3,
            [FRAME_FIELD_NAMES.DURATION]: 301,
            [FRAME_FIELD_NAMES.DURATION_TIME]: 0.0105,
            extra_field: 'ignored'
        };

        const frame = new VideoFrameSchema4(input);

        assert.strictEqual(frame.getPts(), 9000);
        assert.strictEqual(frame.getPtsTime(), 0.3);
        assert.strictEqual(frame.getDuration(), 301);
        assert.strictEqual(frame.getDurationTime(), 0.0105);
    });

    it('should set pts and duration fields to null when missing', function () {
        const frame = new VideoFrameSchema4({});

        assert.isNull(frame.getPts());
        assert.isNull(frame.getPtsTime());
        assert.isNull(frame.getDuration());
        assert.isNull(frame.getDurationTime());
    });

    it('should preserve explicit null values for pts and duration', function () {
        const frame = new VideoFrameSchema4({
            [FRAME_FIELD_NAMES.PTS]: null,
            [FRAME_FIELD_NAMES.PTS_TIME]: null,
            [FRAME_FIELD_NAMES.DURATION]: null,
            [FRAME_FIELD_NAMES.DURATION_TIME]: null
        });

        assert.isNull(frame.getPts());
        assert.isNull(frame.getPtsTime());
        assert.isNull(frame.getDuration());
        assert.isNull(frame.getDurationTime());
    });

    it('should ignore unknown fields', function () {
        const frame = new VideoFrameSchema4({
            [FRAME_FIELD_NAMES.PTS]: 1,
            unknown_field: 'value'
        });

        assert.strictEqual(frame.getPts(), 1);
        assert.notProperty(frame, '_unknown_field');
    });

    describe('validation errors', function () {
        const validBase = () => ({
            [FRAME_FIELD_NAMES.PTS]: 100,
            [FRAME_FIELD_NAMES.PTS_TIME]: 0.1,
            [FRAME_FIELD_NAMES.DURATION]: 300,
            [FRAME_FIELD_NAMES.DURATION_TIME]: 0.3
        });

        it('should validate pts as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PTS] = -1;
            assert.throws(
                () => new VideoFrameSchema4(invalidFrame1),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PTS}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PTS] = 12.5;
            assert.throws(
                () => new VideoFrameSchema4(invalidFrame2),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PTS}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.PTS] = '100';
            assert.throws(
                () => new VideoFrameSchema4(invalidFrame3),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PTS}: ` +
                    `expected non-negative integer or null`
                )
            );
        });

        it(
            'should validate pts_time as non-negative number or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.PTS_TIME] = -0.1;
                assert.throws(
                    () => new VideoFrameSchema4(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PTS_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PTS_TIME] = '0.1';
                assert.throws(
                    () => new VideoFrameSchema4(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PTS_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );
            }
        );

        it(
            'should validate duration as non-negative integer or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.DURATION] = -5;
                assert.throws(
                    () => new VideoFrameSchema4(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.DURATION] = 1.5;
                assert.throws(
                    () => new VideoFrameSchema4(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame3 = validBase();
                invalidFrame3[FRAME_FIELD_NAMES.DURATION] = '10';
                assert.throws(
                    () => new VideoFrameSchema4(invalidFrame3),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );
            }
        );

        it(
            'should validate duration_time as non-negative number or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.DURATION_TIME] = -0.3;
                assert.throws(
                    () => new VideoFrameSchema4(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.DURATION_TIME] = '0.3';
                assert.throws(
                    () => new VideoFrameSchema4(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );
            }
        );
    });

    describe('edge cases', function () {
        it('should allow zeros in pts and duration fields', function () {
            const frame = new VideoFrameSchema4({
                [FRAME_FIELD_NAMES.PTS]: 0,
                [FRAME_FIELD_NAMES.PTS_TIME]: 0,
                [FRAME_FIELD_NAMES.DURATION]: 0,
                [FRAME_FIELD_NAMES.DURATION_TIME]: 0
            });

            assert.strictEqual(frame.getPts(), 0);
            assert.strictEqual(frame.getPtsTime(), 0);
            assert.strictEqual(frame.getDuration(), 0);
            assert.strictEqual(frame.getDurationTime(), 0);
        });
    });
});

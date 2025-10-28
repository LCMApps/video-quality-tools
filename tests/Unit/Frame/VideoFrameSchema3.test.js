'use strict';

const { assert } = require('chai');
const VideoFrameSchema3 = require('src/Frame/VideoFrameSchema3');
const FRAME_FIELD_NAMES = require('src/Frame/rawFrameFieldNames');

describe('VideoFrameSchema3', function () {
    it(
        'should throw TypeError when constructor argument is not an object',
        function () {
            assert.throws(
                () => new VideoFrameSchema3(undefined),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new VideoFrameSchema3(null),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new VideoFrameSchema3(123),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new VideoFrameSchema3('oops'),
                TypeError,
                'Expected an object as constructor argument.'
            );
        }
    );

    it('should map pts, duration and picture numbers from input', function () {
        const input = {
            [FRAME_FIELD_NAMES.PTS]: 9000,
            [FRAME_FIELD_NAMES.PTS_TIME]: 0.3,
            [FRAME_FIELD_NAMES.PKT_DURATION]: 300,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0.01,
            [FRAME_FIELD_NAMES.DURATION]: 301,
            [FRAME_FIELD_NAMES.DURATION_TIME]: 0.0105,
            [FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER]: 42,
            [FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER]: 24,
            extra_field: 'ignored'
        };

        const frame = new VideoFrameSchema3(input);

        assert.strictEqual(frame.getPts(), 9000);
        assert.strictEqual(frame.getPtsTime(), 0.3);
        assert.strictEqual(frame.getPktDuration(), 300);
        assert.strictEqual(frame.getPktDurationTime(), 0.01);
        assert.strictEqual(frame.getDuration(), 301);
        assert.strictEqual(frame.getDurationTime(), 0.0105);
        assert.strictEqual(frame.getCodedPictureNumber(), 42);
        assert.strictEqual(frame.getDisplayPictureNumber(), 24);
    });

    it('should set schema-3 fields to null when missing', function () {
        const frame = new VideoFrameSchema3({});

        assert.isNull(frame.getPts());
        assert.isNull(frame.getPtsTime());
        assert.isNull(frame.getPktDuration());
        assert.isNull(frame.getPktDurationTime());
        assert.isNull(frame.getDuration());
        assert.isNull(frame.getDurationTime());
        assert.isNull(frame.getCodedPictureNumber());
        assert.isNull(frame.getDisplayPictureNumber());
    });

    it('should preserve explicit null values', function () {
        const frame = new VideoFrameSchema3({
            [FRAME_FIELD_NAMES.PTS]: null,
            [FRAME_FIELD_NAMES.PTS_TIME]: null,
            [FRAME_FIELD_NAMES.PKT_DURATION]: null,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: null,
            [FRAME_FIELD_NAMES.DURATION]: null,
            [FRAME_FIELD_NAMES.DURATION_TIME]: null,
            [FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER]: null,
            [FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER]: null
        });

        assert.isNull(frame.getPts());
        assert.isNull(frame.getPtsTime());
        assert.isNull(frame.getPktDuration());
        assert.isNull(frame.getPktDurationTime());
        assert.isNull(frame.getDuration());
        assert.isNull(frame.getDurationTime());
        assert.isNull(frame.getCodedPictureNumber());
        assert.isNull(frame.getDisplayPictureNumber());
    });

    it('should ignore unknown fields', function () {
        const frame = new VideoFrameSchema3({
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
            [FRAME_FIELD_NAMES.PKT_DURATION]: 200,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0.2,
            [FRAME_FIELD_NAMES.DURATION]: 300,
            [FRAME_FIELD_NAMES.DURATION_TIME]: 0.3,
            [FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER]: 10,
            [FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER]: 11
        });

        it('should validate pts as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PTS] = -1;
            assert.throws(
                () => new VideoFrameSchema3(invalidFrame1),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PTS}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PTS] = 12.5;
            assert.throws(
                () => new VideoFrameSchema3(invalidFrame2),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PTS}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.PTS] = '100';
            assert.throws(
                () => new VideoFrameSchema3(invalidFrame3),
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
                    () => new VideoFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PTS_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PTS_TIME] = '0.1';
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PTS_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );
            }
        );

        it(
            'should validate pkt_duration as non-negative integer or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.PKT_DURATION] = -10;
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PKT_DURATION] = 3.14;
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame3 = validBase();
                invalidFrame3[FRAME_FIELD_NAMES.PKT_DURATION] = '100';
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame3),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );
            }
        );

        it(
            'should validate pkt_duration_time as non-negative number or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.PKT_DURATION_TIME] = -0.2;
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PKT_DURATION_TIME] = '0.2';
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );
            }
        );

        it('should validate duration as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.DURATION] = -5;
            assert.throws(
                () => new VideoFrameSchema3(invalidFrame1),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.DURATION}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.DURATION] = 1.5;
            assert.throws(
                () => new VideoFrameSchema3(invalidFrame2),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.DURATION}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.DURATION] = '10';
            assert.throws(
                () => new VideoFrameSchema3(invalidFrame3),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.DURATION}: ` +
                    `expected non-negative integer or null`
                )
            );
        });

        it(
            'should validate duration_time as non-negative number or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.DURATION_TIME] = -0.3;
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.DURATION_TIME] = '0.3';
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );
            }
        );

        it(
            'should validate coded_picture_number as non-negative integer or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER] = -1;
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER] = 1.5;
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame3 = validBase();
                invalidFrame3[FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER] = '5';
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame3),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER}: ` +
                        `expected non-negative integer or null`
                    )
                );
            }
        );

        it(
            'should validate display_picture_number as non-negative integer or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER] = -2;
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER] = 2.2;
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame3 = validBase();
                invalidFrame3[FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER] = '7';
                assert.throws(
                    () => new VideoFrameSchema3(invalidFrame3),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER}: ` +
                        `expected non-negative integer or null`
                    )
                );
            }
        );
    });

    describe('edge cases', function () {
        it('should allow zeros in all numeric fields', function () {
            const frame = new VideoFrameSchema3({
                [FRAME_FIELD_NAMES.PTS]: 0,
                [FRAME_FIELD_NAMES.PTS_TIME]: 0,
                [FRAME_FIELD_NAMES.PKT_DURATION]: 0,
                [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0,
                [FRAME_FIELD_NAMES.DURATION]: 0,
                [FRAME_FIELD_NAMES.DURATION_TIME]: 0,
                [FRAME_FIELD_NAMES.CODED_PICTURE_NUMBER]: 0,
                [FRAME_FIELD_NAMES.DISPLAY_PICTURE_NUMBER]: 0
            });

            assert.strictEqual(frame.getPts(), 0);
            assert.strictEqual(frame.getPtsTime(), 0);
            assert.strictEqual(frame.getPktDuration(), 0);
            assert.strictEqual(frame.getPktDurationTime(), 0);
            assert.strictEqual(frame.getDuration(), 0);
            assert.strictEqual(frame.getDurationTime(), 0);
            assert.strictEqual(frame.getCodedPictureNumber(), 0);
            assert.strictEqual(frame.getDisplayPictureNumber(), 0);
        });
    });
});

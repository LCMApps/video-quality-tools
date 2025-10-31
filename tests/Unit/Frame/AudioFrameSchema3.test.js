'use strict';

const { assert } = require('chai');
const AudioFrameSchema3 = require('src/Frame/AudioFrameSchema3');
const FRAME_FIELD_NAMES = require('src/Frame/rawFrameFieldNames');

describe('AudioFrameSchema3', function () {
    it(
        'should throw TypeError when constructor argument is not an object',
        function () {
            assert.throws(
                () => new AudioFrameSchema3(undefined),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new AudioFrameSchema3(null),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new AudioFrameSchema3(123),
                TypeError,
                'Expected an object as constructor argument.'
            );
            assert.throws(
                () => new AudioFrameSchema3('oops'),
                TypeError,
                'Expected an object as constructor argument.'
            );
        }
    );

    it('should map pts and duration fields from input object', function () {
        const input = {
            [FRAME_FIELD_NAMES.PTS]: 321,
            [FRAME_FIELD_NAMES.PTS_TIME]: 0.321,
            [FRAME_FIELD_NAMES.PKT_DURATION]: 441,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0.441,
            [FRAME_FIELD_NAMES.DURATION]: 551,
            [FRAME_FIELD_NAMES.DURATION_TIME]: 0.551,
            extra_field: 'ignored'
        };

        const frame = new AudioFrameSchema3(input);

        assert.strictEqual(frame.getPts(), 321);
        assert.strictEqual(frame.getPtsTime(), 0.321);
        assert.strictEqual(frame.getPktDuration(), 441);
        assert.strictEqual(frame.getPktDurationTime(), 0.441);
        assert.strictEqual(frame.getDuration(), 551);
        assert.strictEqual(frame.getDurationTime(), 0.551);
    });

    it('should set pts and duration fields to null when missing', function () {
        const frame = new AudioFrameSchema3({});

        assert.isNull(frame.getPts());
        assert.isNull(frame.getPtsTime());
        assert.isNull(frame.getPktDuration());
        assert.isNull(frame.getPktDurationTime());
        assert.isNull(frame.getDuration());
        assert.isNull(frame.getDurationTime());
    });

    it('should preserve explicit null values for pts and duration', function () {
        const frame = new AudioFrameSchema3({
            [FRAME_FIELD_NAMES.PTS]: null,
            [FRAME_FIELD_NAMES.PTS_TIME]: null,
            [FRAME_FIELD_NAMES.PKT_DURATION]: null,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: null,
            [FRAME_FIELD_NAMES.DURATION]: null,
            [FRAME_FIELD_NAMES.DURATION_TIME]: null
        });

        assert.isNull(frame.getPts());
        assert.isNull(frame.getPtsTime());
        assert.isNull(frame.getPktDuration());
        assert.isNull(frame.getPktDurationTime());
        assert.isNull(frame.getDuration());
        assert.isNull(frame.getDurationTime());
    });

    it('should ignore unknown fields', function () {
        const frame = new AudioFrameSchema3({
            [FRAME_FIELD_NAMES.PTS]: 1000,
            unknown_field: 'value'
        });

        assert.strictEqual(frame.getPts(), 1000);
        assert.notProperty(frame, '_unknown_field');
    });

    describe('validation errors', function () {
        const validBase = () => ({
            [FRAME_FIELD_NAMES.PTS]: 100,
            [FRAME_FIELD_NAMES.PTS_TIME]: 0.1,
            [FRAME_FIELD_NAMES.PKT_DURATION]: 200,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0.2,
            [FRAME_FIELD_NAMES.DURATION]: 300,
            [FRAME_FIELD_NAMES.DURATION_TIME]: 0.3
        });

        it('should validate pts as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PTS] = -1;
            assert.throws(
                () => new AudioFrameSchema3(invalidFrame1),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PTS}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PTS] = 12.5;
            assert.throws(
                () => new AudioFrameSchema3(invalidFrame2),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PTS}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.PTS] = '100';
            assert.throws(
                () => new AudioFrameSchema3(invalidFrame3),
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
                    () => new AudioFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PTS_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PTS_TIME] = '0.1';
                assert.throws(
                    () => new AudioFrameSchema3(invalidFrame2),
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
                    () => new AudioFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PKT_DURATION] = 3.14;
                assert.throws(
                    () => new AudioFrameSchema3(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame3 = validBase();
                invalidFrame3[FRAME_FIELD_NAMES.PKT_DURATION] = '100';
                assert.throws(
                    () => new AudioFrameSchema3(invalidFrame3),
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
                    () => new AudioFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PKT_DURATION_TIME] = '0.2';
                assert.throws(
                    () => new AudioFrameSchema3(invalidFrame2),
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
                () => new AudioFrameSchema3(invalidFrame1),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.DURATION}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.DURATION] = 1.5;
            assert.throws(
                () => new AudioFrameSchema3(invalidFrame2),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.DURATION}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.DURATION] = '10';
            assert.throws(
                () => new AudioFrameSchema3(invalidFrame3),
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
                    () => new AudioFrameSchema3(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.DURATION_TIME] = '0.3';
                assert.throws(
                    () => new AudioFrameSchema3(invalidFrame2),
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
            const frame = new AudioFrameSchema3({
                [FRAME_FIELD_NAMES.PTS]: 0,
                [FRAME_FIELD_NAMES.PTS_TIME]: 0,
                [FRAME_FIELD_NAMES.PKT_DURATION]: 0,
                [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0,
                [FRAME_FIELD_NAMES.DURATION]: 0,
                [FRAME_FIELD_NAMES.DURATION_TIME]: 0
            });

            assert.strictEqual(frame.getPts(), 0);
            assert.strictEqual(frame.getPtsTime(), 0);
            assert.strictEqual(frame.getPktDuration(), 0);
            assert.strictEqual(frame.getPktDurationTime(), 0);
            assert.strictEqual(frame.getDuration(), 0);
            assert.strictEqual(frame.getDurationTime(), 0);
        });
    });
});

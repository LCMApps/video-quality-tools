'use strict';

const { assert } = require('chai');
const AudioFrameSchema1 = require('src/Frame/AudioFrameSchema1');
const FRAME_FIELD_NAMES = require('src/Frame/rawFrameFieldNames');

describe('AudioFrameSchema1', function () {
    it(
        'should throw TypeError when constructor argument is not an object',
        function () {
            assert.throws(
                () => new AudioFrameSchema1(undefined),
                TypeError,
                'Expected an object as constructor argument.'
            );

            assert.throws(
                () => new AudioFrameSchema1(null),
                TypeError,
                'Expected an object as constructor argument.'
            );

            assert.throws(
                () => new AudioFrameSchema1(123),
                TypeError,
                'Expected an object as constructor argument.'
            );

            assert.throws(
                () => new AudioFrameSchema1('oops'),
                TypeError,
                'Expected an object as constructor argument.'
            );
        }
    );

    it('should map pkt_* fields from input object', function () {
        const input = {
            [FRAME_FIELD_NAMES.PKT_PTS]: 321,
            [FRAME_FIELD_NAMES.PKT_PTS_TIME]: 0.321,
            [FRAME_FIELD_NAMES.PKT_DURATION]: 441,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0.441,
            extra_field: 'ignored'
        };

        const frame = new AudioFrameSchema1(input);

        assert.strictEqual(frame.getPktPts(), 321);
        assert.strictEqual(frame.getPktPtsTime(), 0.321);
        assert.strictEqual(frame.getPktDuration(), 441);
        assert.strictEqual(frame.getPktDurationTime(), 0.441);
    });

    it('should set pkt_* fields to null when missing', function () {
        const frame = new AudioFrameSchema1({});

        assert.isNull(frame.getPktPts());
        assert.isNull(frame.getPktPtsTime());
        assert.isNull(frame.getPktDuration());
        assert.isNull(frame.getPktDurationTime());
    });

    it('should preserve explicit null values for pkt_* fields', function () {
        const frame = new AudioFrameSchema1({
            [FRAME_FIELD_NAMES.PKT_PTS]: null,
            [FRAME_FIELD_NAMES.PKT_PTS_TIME]: null,
            [FRAME_FIELD_NAMES.PKT_DURATION]: null,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: null
        });

        assert.isNull(frame.getPktPts());
        assert.isNull(frame.getPktPtsTime());
        assert.isNull(frame.getPktDuration());
        assert.isNull(frame.getPktDurationTime());
    });

    it('should ignore unknown fields', function () {
        const frame = new AudioFrameSchema1({
            [FRAME_FIELD_NAMES.PKT_PTS]: 1000,
            unknown_field: 'value'
        });

        assert.strictEqual(frame.getPktPts(), 1000);
        assert.notProperty(frame, '_unknown_field');
    });

    describe('validation errors', function () {
        const validBase = () => ({
            [FRAME_FIELD_NAMES.PKT_PTS]: 100,
            [FRAME_FIELD_NAMES.PKT_PTS_TIME]: 0.1,
            [FRAME_FIELD_NAMES.PKT_DURATION]: 200,
            [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0.2
        });

        it('should validate pkt_pts as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PKT_PTS] = -1;
            assert.throws(
                () => new AudioFrameSchema1(invalidFrame1),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PKT_PTS}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PKT_PTS] = 12.5;
            assert.throws(
                () => new AudioFrameSchema1(invalidFrame2),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PKT_PTS}: ` +
                    `expected non-negative integer or null`
                )
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.PKT_PTS] = '100';
            assert.throws(
                () => new AudioFrameSchema1(invalidFrame3),
                TypeError,
                new RegExp(
                    `Invalid ${FRAME_FIELD_NAMES.PKT_PTS}: ` +
                    `expected non-negative integer or null`
                )
            );
        });

        it(
            'should validate pkt_pts_time as non-negative number or null',
            function () {
                const invalidFrame1 = validBase();
                invalidFrame1[FRAME_FIELD_NAMES.PKT_PTS_TIME] = -0.1;
                assert.throws(
                    () => new AudioFrameSchema1(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_PTS_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PKT_PTS_TIME] = '0.1';
                assert.throws(
                    () => new AudioFrameSchema1(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_PTS_TIME}: ` +
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
                    () => new AudioFrameSchema1(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PKT_DURATION] = 3.14;
                assert.throws(
                    () => new AudioFrameSchema1(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION}: ` +
                        `expected non-negative integer or null`
                    )
                );

                const invalidFrame3 = validBase();
                invalidFrame3[FRAME_FIELD_NAMES.PKT_DURATION] = '100';
                assert.throws(
                    () => new AudioFrameSchema1(invalidFrame3),
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
                    () => new AudioFrameSchema1(invalidFrame1),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );

                const invalidFrame2 = validBase();
                invalidFrame2[FRAME_FIELD_NAMES.PKT_DURATION_TIME] = '0.2';
                assert.throws(
                    () => new AudioFrameSchema1(invalidFrame2),
                    TypeError,
                    new RegExp(
                        `Invalid ${FRAME_FIELD_NAMES.PKT_DURATION_TIME}: ` +
                        `expected non-negative number or null`
                    )
                );
            }
        );
    });

    describe('edge cases', function () {
        it('should allow zeros in pkt_* fields', function () {
            const frame = new AudioFrameSchema1({
                [FRAME_FIELD_NAMES.PKT_PTS]: 0,
                [FRAME_FIELD_NAMES.PKT_PTS_TIME]: 0,
                [FRAME_FIELD_NAMES.PKT_DURATION]: 0,
                [FRAME_FIELD_NAMES.PKT_DURATION_TIME]: 0
            });

            assert.strictEqual(frame.getPktPts(), 0);
            assert.strictEqual(frame.getPktPtsTime(), 0);
            assert.strictEqual(frame.getPktDuration(), 0);
            assert.strictEqual(frame.getPktDurationTime(), 0);
        });
    });
});

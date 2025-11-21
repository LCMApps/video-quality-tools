'use strict';

const _ = require('lodash');
const {assert} = require('chai');
const dataDriven = require('data-driven');
const BaseFrame = require('src/Frame/BaseFrame');
const FRAME_FIELD_NAMES = require('src/Frame/rawFrameFieldNames');

const testData = require('./frame.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

class DummyFrame extends BaseFrame {
    static get schema() {
        return 0;
    }

    constructor(data) {
        super(data);
    }
}

describe('BaseFrame', function () {
    it('should throw when instantiated directly', function () {
        assert.throws(
            () => new BaseFrame({}),
            /BaseFrame is an abstract class and cannot be instantiated directly/
        );
    });

    dataDriven(
        testData.incorrectConstructorType.map(item => ({type: typeOf(item), rawFrame: item})),
        () => {
            it(
                'should throw TypeError when constructor argument is not an object ({type} type passed)',
                ctx => {
                    assert.throws(
                        () => new DummyFrame(ctx.rawFrame),
                        TypeError,
                        'Expected an object as constructor argument.'
                    );
                }
            );
        }
    );

    it('should map all supported fields from input object', function () {
        const expectedResult = {
            [FRAME_FIELD_NAMES.MEDIA_TYPE]: 'audio',
            [FRAME_FIELD_NAMES.STREAM_INDEX]: 2,
            [FRAME_FIELD_NAMES.KEY_FRAME]: 1,
            [FRAME_FIELD_NAMES.PKT_DTS]: 212,
            [FRAME_FIELD_NAMES.PKT_DTS_TIME]: 0.212,
            [FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP]: 3156,
            [FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP_TIME]: 3.156,
            [FRAME_FIELD_NAMES.PKT_POS]: 2236807,
            [FRAME_FIELD_NAMES.PKT_SIZE]: 455,
            extra_field: 'ignored'
        };

        const input = _.cloneDeep(expectedResult);
        const frame = new DummyFrame(input);

        assert.strictEqual(frame.getMediaType(), expectedResult[FRAME_FIELD_NAMES.MEDIA_TYPE]);
        assert.strictEqual(frame.getStreamIndex(), expectedResult[FRAME_FIELD_NAMES.STREAM_INDEX]);
        assert.strictEqual(frame.getKeyFrame(), expectedResult[FRAME_FIELD_NAMES.KEY_FRAME]);
        assert.strictEqual(frame.getPktDts(), expectedResult[FRAME_FIELD_NAMES.PKT_DTS]);
        assert.strictEqual(frame.getPktDtsTime(), expectedResult[FRAME_FIELD_NAMES.PKT_DTS_TIME]);
        assert.strictEqual(frame.getBestEffortTimestamp(), expectedResult[FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP]);
        // eslint-disable-next-line max-len
        assert.strictEqual(frame.getBestEffortTimestampTime(), expectedResult[FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP_TIME]);
        assert.strictEqual(frame.getPktPos(), expectedResult[FRAME_FIELD_NAMES.PKT_POS]);
        assert.strictEqual(frame.getPktSize(), expectedResult[FRAME_FIELD_NAMES.PKT_SIZE]);
    });

    it('should set missing fields to null', function () {
        const frame = new DummyFrame({});

        assert.isNull(frame.getMediaType());
        assert.isNull(frame.getStreamIndex());
        assert.isNull(frame.getKeyFrame());
        assert.isNull(frame.getPktDts());
        assert.isNull(frame.getPktDtsTime());
        assert.isNull(frame.getBestEffortTimestamp());
        assert.isNull(frame.getBestEffortTimestampTime());
        assert.isNull(frame.getPktPos());
        assert.isNull(frame.getPktSize());
    });

    it('should preserve explicit null values from input', function () {
        const frame = new DummyFrame({
            [FRAME_FIELD_NAMES.MEDIA_TYPE]: null,
            [FRAME_FIELD_NAMES.STREAM_INDEX]: null,
            [FRAME_FIELD_NAMES.KEY_FRAME]: null,
            [FRAME_FIELD_NAMES.PKT_DTS]: null,
            [FRAME_FIELD_NAMES.PKT_DTS_TIME]: null,
            [FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP]: null,
            [FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP_TIME]: null,
            [FRAME_FIELD_NAMES.PKT_POS]: null,
            [FRAME_FIELD_NAMES.PKT_SIZE]: null,
        });

        assert.isNull(frame.getMediaType());
        assert.isNull(frame.getStreamIndex());
        assert.isNull(frame.getKeyFrame());
        assert.isNull(frame.getPktDts());
        assert.isNull(frame.getPktDtsTime());
        assert.isNull(frame.getBestEffortTimestamp());
        assert.isNull(frame.getBestEffortTimestampTime());
        assert.isNull(frame.getPktPos());
        assert.isNull(frame.getPktSize());
    });

    it('should ignore unknown fields', function () {
        const frame = new DummyFrame({
            [FRAME_FIELD_NAMES.MEDIA_TYPE]: 'video',
            unknown: 'value'
        });

        assert.strictEqual(frame.getMediaType(), 'video');
    });

    describe('validation errors', function () {
        const validBase = () => ({
            [FRAME_FIELD_NAMES.MEDIA_TYPE]: 'audio',
            [FRAME_FIELD_NAMES.STREAM_INDEX]: 0,
            [FRAME_FIELD_NAMES.KEY_FRAME]: 1,
            [FRAME_FIELD_NAMES.PKT_DTS]: 212,
            [FRAME_FIELD_NAMES.PKT_DTS_TIME]: 0.212,
            [FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP]: 100,
            [FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP_TIME]: 0.1,
            [FRAME_FIELD_NAMES.PKT_POS]: 200,
            [FRAME_FIELD_NAMES.PKT_SIZE]: 300
        });

        it('should validate media_type as string or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.MEDIA_TYPE] = 123;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.MEDIA_TYPE}: expected string or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.MEDIA_TYPE] = {};
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.MEDIA_TYPE}: expected string or null`)
            );
        });

        it('should validate stream_index as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.STREAM_INDEX] = -1;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.STREAM_INDEX}: expected non-negative integer or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.STREAM_INDEX] = 1.5;
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.STREAM_INDEX}: expected non-negative integer or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.STREAM_INDEX] = '2';
            assert.throws(
                () => new DummyFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.STREAM_INDEX}: expected non-negative integer or null`)
            );
        });

        it('should validate key_frame as 0 or 1 or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.KEY_FRAME] = 2;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.KEY_FRAME}: expected 0 or 1 or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.KEY_FRAME] = -1;
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.KEY_FRAME}: expected 0 or 1 or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.KEY_FRAME] = '1';
            assert.throws(
                () => new DummyFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.KEY_FRAME}: expected 0 or 1 or null`)
            );
        });

        it('should validate pkt_dts as non-negative integer or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PKT_DTS] = -1;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_DTS}: expected non-negative integer or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PKT_DTS] = 1.5;
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_DTS}: expected non-negative integer or null`)
            );

            const invalidFrame3 = validBase();
            invalidFrame3[FRAME_FIELD_NAMES.PKT_DTS] = '2';
            assert.throws(
                () => new DummyFrame(invalidFrame3),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_DTS}: expected non-negative integer or null`)
            );
        });

        it('should validate pkt_dts_time as non-negative number or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PKT_DTS_TIME] = -10;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_DTS_TIME}: expected non-negative number or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PKT_DTS_TIME] = '10';
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_DTS_TIME}: expected non-negative number or null`)
            );
        });

        it('should validate best_effort_timestamp as non-negative number or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP] = -10;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP}: expected non-negative number or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP] = '10';
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP}: expected non-negative number or null`)
            );
        });

        it('should validate best_effort_timestamp_time as non-negative number or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP_TIME] = -0.1;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP_TIME}: `
                    + 'expected non-negative number or null')
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP_TIME] = '0.1';
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.BEST_EFFORT_TIMESTAMP_TIME}: `
                    + 'expected non-negative number or null')
            );
        });

        it('should validate pkt_pos as non-negative number or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PKT_POS] = -5;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_POS}: expected non-negative number or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PKT_POS] = '5';
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_POS}: expected non-negative number or null`)
            );
        });

        it('should validate pkt_size as non-negative number or null', function () {
            const invalidFrame1 = validBase();
            invalidFrame1[FRAME_FIELD_NAMES.PKT_SIZE] = -1;
            assert.throws(
                () => new DummyFrame(invalidFrame1),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_SIZE}: expected non-negative number or null`)
            );

            const invalidFrame2 = validBase();
            invalidFrame2[FRAME_FIELD_NAMES.PKT_SIZE] = '100';
            assert.throws(
                () => new DummyFrame(invalidFrame2),
                TypeError,
                new RegExp(`Invalid ${FRAME_FIELD_NAMES.PKT_SIZE}: expected non-negative number or null`)
            );
        });
    });
});

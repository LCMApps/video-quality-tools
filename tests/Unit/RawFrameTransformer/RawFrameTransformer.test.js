'use strict';

const {assert} = require('chai');
const dataDriven = require('data-driven');

const RawFrameTransformer = require('src/RawFrameTransformer');
const FftoolsLibVersions = require('src/FftoolsLibVersions');

const VideoFrameSchema1 = require('src/Frame/VideoFrameSchema1');
const VideoFrameSchema2 = require('src/Frame/VideoFrameSchema2');
const VideoFrameSchema3 = require('src/Frame/VideoFrameSchema3');
const VideoFrameSchema4 = require('src/Frame/VideoFrameSchema4');
const AudioFrameSchema1 = require('src/Frame/AudioFrameSchema1');
const AudioFrameSchema2 = require('src/Frame/AudioFrameSchema2');
const AudioFrameSchema3 = require('src/Frame/AudioFrameSchema3');
const AudioFrameSchema4 = require('src/Frame/AudioFrameSchema4');

const {
    invalidFftoolLibVersionsTypes,
    invalidMediaTypeScenarios,
    schemaVersionScenarios
} = require('./RawFrameTransformer.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('RawFrameTransformer', () => {

    describe('constructor', () => {

        dataDriven(
            invalidFftoolLibVersionsTypes.map(item => ({type: typeOf(item), item: item})),
            () => {
                it('must throw an exception for invalid fftoolLibVersions {type} type', ctx => {
                    assert.throws(() => {
                        new RawFrameTransformer(ctx.item);
                    }, TypeError, 'fftoolLibVersions must be an instance of FftoolsLibVersions');
                });
            }
        );

        it('must select Schema1 for libavutil < 57', () => {
            const libVersionsMap = new Map([
                ['libavutil', '56.70.100']
            ]);
            const fftoolLibVersions = new FftoolsLibVersions(libVersionsMap);

            const transformer = new RawFrameTransformer(fftoolLibVersions);

            assert.instanceOf(transformer, RawFrameTransformer);
            assert.strictEqual(transformer._AudioFrameSchema, AudioFrameSchema1);
            assert.strictEqual(transformer._VideoFrameSchema, VideoFrameSchema1);
        });

        it('must select Schema2 for libavutil >= 57 and < 58', () => {
            const libVersionsMap = new Map([
                ['libavutil', '57.28.100']
            ]);
            const fftoolLibVersions = new FftoolsLibVersions(libVersionsMap);

            const transformer = new RawFrameTransformer(fftoolLibVersions);

            assert.instanceOf(transformer, RawFrameTransformer);
            assert.strictEqual(transformer._AudioFrameSchema, AudioFrameSchema2);
            assert.strictEqual(transformer._VideoFrameSchema, VideoFrameSchema2);
        });

        it('must select Schema3 for libavutil >= 58 and < 59', () => {
            const libVersionsMap = new Map([
                ['libavutil', '58.29.100']
            ]);
            const fftoolLibVersions = new FftoolsLibVersions(libVersionsMap);

            const transformer = new RawFrameTransformer(fftoolLibVersions);

            assert.instanceOf(transformer, RawFrameTransformer);
            assert.strictEqual(transformer._AudioFrameSchema, AudioFrameSchema3);
            assert.strictEqual(transformer._VideoFrameSchema, VideoFrameSchema3);
        });

        it('must select Schema4 for libavutil >= 59 and < 61', () => {
            const libVersionsMap = new Map([
                ['libavutil', '59.8.100']
            ]);
            const fftoolLibVersions = new FftoolsLibVersions(libVersionsMap);

            const transformer = new RawFrameTransformer(fftoolLibVersions);

            assert.instanceOf(transformer, RawFrameTransformer);
            assert.strictEqual(transformer._AudioFrameSchema, AudioFrameSchema4);
            assert.strictEqual(transformer._VideoFrameSchema, VideoFrameSchema4);
        });

        it('must select Schema4 for libavutil = 60', () => {
            const libVersionsMap = new Map([
                ['libavutil', '60.0.0']
            ]);
            const fftoolLibVersions = new FftoolsLibVersions(libVersionsMap);

            const transformer = new RawFrameTransformer(fftoolLibVersions);

            assert.instanceOf(transformer, RawFrameTransformer);
            assert.strictEqual(transformer._AudioFrameSchema, AudioFrameSchema4);
            assert.strictEqual(transformer._VideoFrameSchema, VideoFrameSchema4);
        });

        it('must throw an error for libavutil > 60', () => {
            const libVersionsMap = new Map([
                ['libavutil', '61.0.0']
            ]);
            const fftoolLibVersions = new FftoolsLibVersions(libVersionsMap);

            assert.throws(() => {
                new RawFrameTransformer(fftoolLibVersions);
            }, Error, 'ffmpeg or ffprobe you are running was built with "libavutil 61.0.0". Only versions <= 60 are supported');
        });

    });

    describe('transform', () => {

        let transformer;

        beforeEach(() => {
            const libVersionsMap = new Map([
                ['libavutil', '57.0.0']
            ]);
            const fftoolLibVersions = new FftoolsLibVersions(libVersionsMap);
            transformer = new RawFrameTransformer(fftoolLibVersions);
        });

        it('must transform a valid video frame', () => {
            const rawFrame = {
                media_type: 'video',
                key_frame: 1,
                pkt_pts_time: 1.5,
                pkt_size: 1024,
                width: 1920,
                height: 1080,
                pict_type: 'I'
            };

            const result = transformer.transform(rawFrame);

            assert.instanceOf(result, VideoFrameSchema2);
            assert.strictEqual(result.getMediaType(), 'video');
            assert.strictEqual(result.getKeyFrame(), 1);
        });

        it('must transform a valid audio frame', () => {
            const rawFrame = {
                media_type: 'audio',
                key_frame: 1,
                pkt_pts_time: 1.5,
                pkt_size: 512
            };

            const result = transformer.transform(rawFrame);

            assert.instanceOf(result, AudioFrameSchema2);
            assert.strictEqual(result.getMediaType(), 'audio');
            assert.strictEqual(result.getKeyFrame(), 1);
        });

        dataDriven(invalidMediaTypeScenarios, () => {
            it('must throw an error if {description}', ctx => {
                assert.throws(() => {
                    transformer.transform(ctx.rawFrame);
                }, TypeError, ctx.expectedError);
            });
        });

    });

    describe('transform with different schema versions', () => {

        dataDriven(schemaVersionScenarios, () => {
            it('must use correct schema classes for {description}', ctx => {
                const libVersionsMap = new Map([
                    ['libavutil', ctx.libavutilVersion]
                ]);
                const fftoolLibVersions = new FftoolsLibVersions(libVersionsMap);
                const transformer = new RawFrameTransformer(fftoolLibVersions);

                const videoFrame = transformer.transform({
                    media_type: 'video',
                    key_frame: 1,
                    pkt_pts_time: 1.0
                });

                const audioFrame = transformer.transform({
                    media_type: 'audio',
                    key_frame: 1,
                    pkt_pts_time: 1.0
                });

                assert.instanceOf(videoFrame, ctx.expectedVideoSchema);
                assert.instanceOf(audioFrame, ctx.expectedAudioSchema);
            });
        });

    });

});


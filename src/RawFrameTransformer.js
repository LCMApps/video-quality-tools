'use strict';

const FftoolsLibVersions = require('./FftoolsLibVersions');

const {MEDIA_TYPE} = require('./Frame/rawFrameFieldNames');

const MEDIA_TYPE_AUDIO = 'audio';
const MEDIA_TYPE_VIDEO = 'video';

class RawFrameTransformer {
    constructor(fftoolLibVersions) {
        if (!(fftoolLibVersions instanceof FftoolsLibVersions)) {
            throw new TypeError('fftoolLibVersions must be an instance of FftoolsLibVersions');
        }

        if (fftoolLibVersions.lt(FftoolsLibVersions.LIBAVUTIL, '57')) {
            this._AudioFrameSchema = require('./Frame/AudioFrameSchema1');
            this._VideoFrameSchema = require('./Frame/VideoFrameSchema1');
        } else if (fftoolLibVersions.lt(FftoolsLibVersions.LIBAVUTIL, '58')) {
            this._AudioFrameSchema = require('./Frame/AudioFrameSchema2');
            this._VideoFrameSchema = require('./Frame/VideoFrameSchema2');
        } else if (fftoolLibVersions.lt(FftoolsLibVersions.LIBAVUTIL, '59')) {
            this._AudioFrameSchema = require('./Frame/AudioFrameSchema3');
            this._VideoFrameSchema = require('./Frame/VideoFrameSchema3');
        } else if (fftoolLibVersions.lt(FftoolsLibVersions.LIBAVUTIL, '61')) {
            this._AudioFrameSchema = require('./Frame/AudioFrameSchema4');
            this._VideoFrameSchema = require('./Frame/VideoFrameSchema4');
        } else if (fftoolLibVersions.gt(FftoolsLibVersions.LIBAVUTIL, '60')) {
            throw new Error(`ffmpeg or ffprobe you are running was built with "${FftoolsLibVersions.LIBAVUTIL} `
                + `${fftoolLibVersions.getVersion(FftoolsLibVersions.LIBAVUTIL)}". Only versions <= 60 are supported`);
        }
    }

    transform(rawFrame) {
        const frameMediaType = rawFrame[MEDIA_TYPE];
        if (frameMediaType === undefined) {
            throw new TypeError(`rawFrame object must contain the field "${MEDIA_TYPE}"`);
        } else if (frameMediaType === MEDIA_TYPE_AUDIO) {
            return new this._AudioFrameSchema(rawFrame);
        } else if (frameMediaType === MEDIA_TYPE_VIDEO) {
            return new this._VideoFrameSchema(rawFrame);
        }

        throw new TypeError(
            `The value of "${MEDIA_TYPE}" field of rawFrame must be either "${MEDIA_TYPE_AUDIO}" `
            + `or "${MEDIA_TYPE_VIDEO}"`
        );
    }
}

module.exports = RawFrameTransformer;

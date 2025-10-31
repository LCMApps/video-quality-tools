'use strict';

const BaseFrame = require('./BaseFrame');
const {
    SAMPLE_FMT,
    NB_SAMPLES,
    CHANNELS,
    CHANNEL_LAYOUT,
} = require('./rawFrameFieldNames');

/**
 * @typedef {Object} RawAudioFrameDataExtraFields
 *
 * @property {string} [sample_fmt] - Sample format (audio only), e.g., 'fltp', 's16'.
 * @property {number} [nb_samples] - Number of audio samples in the frame. Expected non-negative integer.
 * @property {number} [channels] - Number of audio channels. Expected positive integer.
 * @property {string} [channel_layout] - Channel layout string (e.g., "stereo", "5.1", "mono").
 */

/**
 * @typedef {import('./BaseFrame').RawFrameData} RawFrameDataImported
 */

/**
 * @typedef {RawFrameDataImported & RawAudioFrameDataExtraFields} RawAudioFrameData
 */


/**
 * BaseAudioFrame serves as an abstract value object (VO)
 * for representing common audio frame attributes.
 *
 * It provides standard getters for shared fields and basic null-safe value extraction.
 *
 * This class cannot be instantiated directly — only subclasses may call its constructor via `super()`.
 * Read for details: https://github.com/LCMApps/video-quality-tools/issues/119
 */
class BaseAudioFrame extends BaseFrame {
    /**
     * @param {RawAudioFrameData} frameData Raw frame object (e.g., from ffprobe).
     */
    constructor(frameData) {
        super(frameData);

        // Audio-specific
        /**
         * @protected
         * @type {string|null}
         */
        this._sampleFmt = this._assertStringOrNull(
            this._returnValueOrNullIfAbsent(frameData, SAMPLE_FMT),
            SAMPLE_FMT
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._nbSamples = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, NB_SAMPLES),
            NB_SAMPLES
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._channels = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, CHANNELS),
            CHANNELS
        );

        /**
         * @protected
         * @type {string|null}
         */
        this._channelLayout = this._assertStringOrNull(
            this._returnValueOrNullIfAbsent(frameData, CHANNEL_LAYOUT),
            CHANNEL_LAYOUT
        );
    }

    /**
     * Sample format (e.g., 'fltp') or null.
     * @returns {string|null}
     */
    getSampleFmt() {
        return this._sampleFmt;
    }

    /**
     * Number of audio samples in the frame or null.
     * @returns {number|null}
     */
    getNbSamples() {
        return this._nbSamples;
    }

    /**
     * Number of channels or null.
     * @returns {number|null}
     */
    getChannels() {
        return this._channels;
    }

    /**
     * Channel layout string (e.g., 'stereo') or null.
     * @returns {string|null}
     */
    getChannelLayout() {
        return this._channelLayout;
    }
}

module.exports = BaseAudioFrame;

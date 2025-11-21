'use strict';

const BaseAudioFrame = require('./BaseAudioFrame');
const {
    PTS,
    PTS_TIME,
    DURATION,
    DURATION_TIME,
} = require('./rawFrameFieldNames');

/**
 * @typedef {Object} RawAudioFrameSchema4DataExtraFields
 *
 * @property {number} [pts] - Packet PTS in timebase units. Expected non-negative number.
 * @property {number} [pts_time] - Packet PTS in seconds. Expected non-negative number.
 * @property {number} [duration] - Packet duration in timebase units. Expected non-negative number.
 * @property {number} [duration_time] - Packet duration in seconds. Expected non-negative number.
 */

/**
 * @typedef {import('./BaseAudioFrame').RawAudioFrameData} RawAudioFrameDataImported
 */

/**
 * @typedef {RawAudioFrameDataImported & RawAudioFrameSchema4DataExtraFields} RawAudioFrameSchema4Data
 */

/**
 * AudioFrameSchema1 describes the "schema 4" layout for audio frame objects.
 * Applied for libavutil 59.
 *
 * It inherits common fields from BaseFrame and adds pkt_* and audio-specific fields.
 * Read for details: https://github.com/LCMApps/video-quality-tools/issues/119
 */
class AudioFrameSchema4 extends BaseAudioFrame {
    static get schema() {
        return 4;
    }

    /**
     * @param {RawAudioFrameSchema4Data} frameData Raw frame object (e.g., from ffprobe).
     */
    constructor(frameData) {
        super(frameData);

        // pkt_* mapping
        /**
         * @protected
         * @type {number|null}
         */
        this._pts = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, PTS),
            PTS
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._ptsTime = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, PTS_TIME),
            PTS_TIME
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._duration = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, DURATION),
            DURATION
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._durationTime = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, DURATION_TIME),
            DURATION_TIME
        );
    }

    /**
     * Presentation timestamp in timebase units or null.
     * @returns {number|null}
     */
    getPts() {
        return this._pts;
    }

    /**
     * Presentation timestamp in seconds or null.
     * @returns {number|null}
     */
    getPtsTime() {
        return this._ptsTime;
    }

    /**
     * Packet duration in timebase units or null.
     * @returns {number|null}
     */
    getDuration() {
        return this._duration;
    }

    /**
     * Packet duration in seconds or null.
     * @returns {number|null}
     */
    getDurationTime() {
        return this._durationTime;
    }
}

module.exports = AudioFrameSchema4;

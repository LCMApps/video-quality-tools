'use strict';

const BaseAudioFrame = require('./BaseAudioFrame');
const {
    PTS,
    PTS_TIME,
    PKT_DURATION,
    PKT_DURATION_TIME,
} = require('./rawFrameFieldNames');

/**
 * @typedef {Object} RawAudioFrameSchema2DataExtraFields
 *
 * @property {number} [pts] - Packet PTS in timebase units. Expected non-negative number.
 * @property {number} [pts_time] - Packet PTS in seconds. Expected non-negative number.
 * @property {number} [pkt_duration] - Packet duration in timebase units. Expected non-negative number.
 * @property {number} [pkt_duration_time] - Packet duration in seconds. Expected non-negative number.
 */

/**
 * @typedef {import('./BaseAudioFrame').RawAudioFrameData} RawAudioFrameDataImported
 */

/**
 * @typedef {RawAudioFrameDataImported & RawAudioFrameSchema2DataExtraFields} RawAudioFrameSchema2Data
 */

/**
 * AudioFrameSchema1 describes the "schema 2" layout for audio frame objects.
 * Applied for libavutil 57.
 *
 * It inherits common fields from BaseFrame and adds pkt_* and audio-specific fields.
 * Read for details: https://github.com/LCMApps/video-quality-tools/issues/119
 */
class AudioFrameSchema2 extends BaseAudioFrame {
    static get schema() {
        return 2;
    }

    /**
     * @param {RawAudioFrameSchema2Data} frameData Raw frame object (e.g., from ffprobe).
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
        this._pktDuration = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, PKT_DURATION),
            PKT_DURATION
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._pktDurationTime = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, PKT_DURATION_TIME),
            PKT_DURATION_TIME
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
    getPktDuration() {
        return this._pktDuration;
    }

    /**
     * Packet duration in seconds or null.
     * @returns {number|null}
     */
    getPktDurationTime() {
        return this._pktDurationTime;
    }
}

module.exports = AudioFrameSchema2;

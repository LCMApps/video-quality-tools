'use strict';

const BaseAudioFrame = require('./BaseAudioFrame');
const {
    PKT_PTS,
    PKT_PTS_TIME,
    PKT_DURATION,
    PKT_DURATION_TIME,
} = require('./rawFrameFieldNames');

/**
 * @typedef {Object} RawAudioFrameSchema1DataExtraFields
 *
 * @property {number} [pkt_pts] - Packet PTS in timebase units. Expected non-negative number.
 * @property {number} [pkt_pts_time] - Packet PTS in seconds. Expected non-negative number.
 * @property {number} [pkt_duration] - Packet duration in timebase units. Expected non-negative number.
 * @property {number} [pkt_duration_time] - Packet duration in seconds. Expected non-negative number.
 */

/**
 * @typedef {import('./BaseAudioFrame').RawAudioFrameData} RawAudioFrameDataImported
 */

/**
 * @typedef {RawAudioFrameDataImported & RawAudioFrameSchema1DataExtraFields} RawAudioFrameSchema1Data
 */

/**
 * AudioFrameSchema1 describes the "schema 1" layout for audio frame objects.
 * Applied for libavutil 56.
 *
 * It inherits common fields from BaseFrame and adds pkt_* and audio-specific fields.
 * Read for details: https://github.com/LCMApps/video-quality-tools/issues/119
 */
class AudioFrameSchema1 extends BaseAudioFrame {
    static get schema() {
        return 1;
    }

    /**
     * @param {RawAudioFrameSchema1Data} frameData Raw frame object (e.g., from ffprobe).
     */
    constructor(frameData) {
        super(frameData);

        // pkt_* mapping
        /**
         * @protected
         * @type {number|null}
         */
        this._pktPts = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, PKT_PTS),
            PKT_PTS
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._pktPtsTime = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, PKT_PTS_TIME),
            PKT_PTS_TIME
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
    getPktPts() {
        return this._pktPts;
    }

    /**
     * Presentation timestamp in seconds or null.
     * @returns {number|null}
     */
    getPktPtsTime() {
        return this._pktPtsTime;
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

module.exports = AudioFrameSchema1;

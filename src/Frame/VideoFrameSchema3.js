'use strict';

const BaseVideoFrame = require('./BaseVideoFrame');
const {
    PTS,
    PTS_TIME,
    PKT_DURATION,
    PKT_DURATION_TIME,
    DURATION,
    DURATION_TIME,
    CODED_PICTURE_NUMBER,
    DISPLAY_PICTURE_NUMBER,
} = require('./rawFrameFieldNames');

/**
 * Raw video frame data for schema 3 (ffprobe output mapped as-is).
 * All properties are optional.
 *
 * @typedef {Object} RawVideoFrameSchema3DataExtraFields
 *
 * @property {number} [pts] - Packet PTS in timebase units. Expected non-negative number.
 * @property {number} [pts_time] - Packet PTS in seconds. Expected non-negative number.
 * @property {number} [pkt_duration] - Packet duration in timebase units. Expected non-negative number.
 * @property {number} [pkt_duration_time] - Packet duration in seconds. Expected non-negative number.
 * @property {number} [duration] - Packet duration in timebase units. Expected non-negative number.
 * @property {number} [duration_time] - Packet duration in seconds. Expected non-negative number.
 * @property {number} [coded_picture_number] - Coded picture sequence number. Expected non-negative integer.
 * @property {number} [display_picture_number] - Display picture sequence number. Expected non-negative integer.
 */

/**
 * @typedef {import('./BaseVideoFrame').RawVideoFrameData} RawVideoFrameDataImported
 */

/**
 * @typedef {RawVideoFrameDataImported & RawVideoFrameSchema3DataExtraFields} RawVideoFrameSchema3Data
 */

/**
 * VideoFrameSchema2 describes the "schema 3" layout for video frame objects.
 * Applied for libavutil 58.
 *
 * It inherits common fields from BaseFrame and adds pkt_* and video-specific fields.
 * Read for details: https://github.com/LCMApps/video-quality-tools/issues/119
 */
class VideoFrameSchema3 extends BaseVideoFrame {
    static get schema() {
        return 3;
    }

    /**
     * @param {RawVideoFrameSchema3Data} frameData Raw frame object (e.g., from ffprobe).
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

        // Video-specific
        /**
         * @protected
         * @type {number|null}
         */
        this._codedPictureNumber = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, CODED_PICTURE_NUMBER),
            CODED_PICTURE_NUMBER
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._displayPictureNumber = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, DISPLAY_PICTURE_NUMBER),
            DISPLAY_PICTURE_NUMBER
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

    /**
     * Coded picture number or null.
     * @returns {number|null}
     */
    getCodedPictureNumber() {
        return this._codedPictureNumber;
    }

    /**
     * Display picture number or null.
     * @returns {number|null}
     */
    getDisplayPictureNumber() {
        return this._displayPictureNumber;
    }
}

module.exports = VideoFrameSchema3;

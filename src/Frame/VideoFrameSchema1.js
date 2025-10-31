'use strict';

const BaseVideoFrame = require('./BaseVideoFrame');
const {
    PKT_PTS,
    PKT_PTS_TIME,
    PKT_DURATION,
    PKT_DURATION_TIME,
    CODED_PICTURE_NUMBER,
    DISPLAY_PICTURE_NUMBER,
} = require('./rawFrameFieldNames');

/**
 * Raw video frame data for schema 1 (ffprobe output mapped as-is).
 * All properties are optional.
 *
 * @typedef {Object} RawVideoFrameSchema1DataExtraFields
 *
 * @property {number} [pkt_pts] - Packet PTS in timebase units. Expected non-negative number.
 * @property {number} [pkt_pts_time] - Packet PTS in seconds. Expected non-negative number.
 * @property {number} [pkt_duration] - Packet duration in timebase units. Expected non-negative number.
 * @property {number} [pkt_duration_time] - Packet duration in seconds. Expected non-negative number.
 * @property {number} [coded_picture_number] - Coded picture sequence number. Expected non-negative integer.
 * @property {number} [display_picture_number] - Display picture sequence number. Expected non-negative integer.
 */

/**
 * @typedef {import('./BaseVideoFrame').RawVideoFrameData} RawVideoFrameDataImported
 */

/**
 * @typedef {RawVideoFrameDataImported & RawVideoFrameSchema1DataExtraFields} RawVideoFrameSchema1Data
 */

/**
 * VideoFrameSchema1 describes the "schema 1" layout for video frame objects.
 * Applied for libavutil 56.
 *
 * It inherits common fields from BaseFrame and adds pkt_* and video-specific fields.
 * Read for details: https://github.com/LCMApps/video-quality-tools/issues/119
 */
class VideoFrameSchema1 extends BaseVideoFrame {
    static get schema() {
        return 1;
    }

    /**
     * @param {RawVideoFrameSchema1Data} frameData Raw frame object (e.g., from ffprobe).
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

module.exports = VideoFrameSchema1;

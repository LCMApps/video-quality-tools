'use strict';

const BaseFrame = require('./BaseFrame');
const {
    WIDTH,
    HEIGHT,
    PIX_FMT,
    SAMPLE_ASPECT_RATIO,
    PICT_TYPE,
    INTERLACED_FRAME,
    TOP_FIELD_FIRST,
    REPEAT_PICT,
} = require('./rawFrameFieldNames');

/**
 *
 * @typedef {Object} RawVideoFrameDataExtraFields
 *
 * @property {number} [width] - Frame width in pixels. Expected positive integer.
 * @property {number} [height] - Frame height in pixels. Expected positive integer.
 * @property {string} [pix_fmt] - Pixel format string (e.g., "yuv420p", "nv12").
 * @property {string} [sample_aspect_ratio] - Sample aspect ratio (e.g., "1:1", "4:3").
 * @property {string} [pict_type] - Picture type (e.g., "I", "P", "B").
 * @property {number} [interlaced_frame] - Interlaced frame flag. Expected 0 or 1.
 * @property {number} [top_field_first] - Top-field-first flag. Expected 0 or 1.
 * @property {number} [repeat_pict] - Number of extra fields to display. Expected non-negative integer.
 */

/**
 * @typedef {import('./BaseFrame').RawFrameData} RawFrameDataImported
 */

/**
 * @typedef {RawFrameDataImported & RawVideoFrameDataExtraFields} RawVideoFrameData
 */

/**
 * BaseVideoFrame serves as an abstract value object (VO)
 * for representing common video frame attributes.
 *
 * It provides standard getters for shared fields and basic null-safe value extraction.
 *
 * This class cannot be instantiated directly — only subclasses may call its constructor via `super()`.
 * Read for details: https://github.com/LCMApps/video-quality-tools/issues/119
 */
class BaseVideoFrame extends BaseFrame {
    /**
     * @param {RawVideoFrameData} frameData Raw frame object (e.g., from ffprobe).
     */
    constructor(frameData) {
        super(frameData);

        // Video-specific
        /**
         * @protected
         * @type {number|null}
         */
        this._width = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, WIDTH),
            WIDTH
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._height = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, HEIGHT),
            HEIGHT
        );

        /**
         * @protected
         * @type {string|null}
         */
        this._pixFmt = this._assertStringOrNull(
            this._returnValueOrNullIfAbsent(frameData, PIX_FMT),
            PIX_FMT
        );

        /**
         * @protected
         * @type {string|null}
         */
        this._sampleAspectRatio = this._assertStringOrNull(
            this._returnValueOrNullIfAbsent(frameData, SAMPLE_ASPECT_RATIO),
            SAMPLE_ASPECT_RATIO
        );

        /**
         * @protected
         * @type {string|null}
         */
        this._pictType = this._assertStringOrNull(
            this._returnValueOrNullIfAbsent(frameData, PICT_TYPE),
            PICT_TYPE
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._interlacedFrame = this._assertZeroOrOneOrNull(
            this._returnValueOrNullIfAbsent(frameData, INTERLACED_FRAME),
            INTERLACED_FRAME
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._topFieldFirst = this._assertZeroOrOneOrNull(
            this._returnValueOrNullIfAbsent(frameData, TOP_FIELD_FIRST),
            TOP_FIELD_FIRST
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._repeatPict = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, REPEAT_PICT),
            REPEAT_PICT
        );
    }

    /**
     * Frame width in pixels or null.
     * @returns {number|null}
     */
    getWidth() {
        return this._width;
    }

    /**
     * Frame height in pixels or null.
     * @returns {number|null}
     */
    getHeight() {
        return this._height;
    }

    /**
     * Pixel format string (e.g., 'yuv420p') or null.
     * @returns {string|null}
     */
    getPixFmt() {
        return this._pixFmt;
    }

    /**
     * Sample aspect ratio string (e.g., '1:1') or null.
     * @returns {string|null}
     */
    getSampleAspectRatio() {
        return this._sampleAspectRatio;
    }

    /**
     * Picture type (e.g., 'I', 'P', 'B') or null.
     * @returns {string|null}
     */
    getPictType() {
        return this._pictType;
    }

    /**
     * Interlaced frame flag (0/1) or null.
     * @returns {number|null}
     */
    getInterlacedFrame() {
        return this._interlacedFrame;
    }

    /**
     * Top-field-first flag (0/1) or null.
     * @returns {number|null}
     */
    getTopFieldFirst() {
        return this._topFieldFirst;
    }

    /**
     * Repeat-pict value or null.
     * @returns {number|null}
     */
    getRepeatPict() {
        return this._repeatPict;
    }
}

module.exports = BaseVideoFrame;

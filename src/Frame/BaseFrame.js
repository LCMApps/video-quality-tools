'use strict';

const {
    MEDIA_TYPE,
    STREAM_INDEX,
    KEY_FRAME,
    PKT_DTS,
    PKT_DTS_TIME,
    BEST_EFFORT_TIMESTAMP,
    BEST_EFFORT_TIMESTAMP_TIME,
    PKT_POS,
    PKT_SIZE,
} = require('./rawFrameFieldNames');


/**
 * @typedef {Object} RawFrameData
 * @property {string} [media_type] - Media type of the frame (e.g., 'audio', 'video').
 * @property {number} [stream_index] - Index of the stream this frame belongs to.
 * @property {number} [key_frame] - Key frame indicator (1 for key frame, 0 otherwise).
 * @property {number} [pkt_dts] - Packet DTS in timebase units. Expected non-negative number.
 * @property {number} [pkt_dts_time] - Packet DTS in seconds. Expected non-negative number.
 * @property {number} [best_effort_timestamp] - Presentation timestamp in timebase units.
 * @property {number} [best_effort_timestamp_time] - Presentation timestamp in seconds.
 * @property {number} [pkt_pos] - Byte position of the packet in the stream.
 * @property {number} [pkt_size] - Packet size in bytes.
 */

/**
 * BaseFrame serves as an abstract value object (VO)
 * for representing common frame attributes shared across audio and video frames.
 *
 * It provides standard getters for shared fields and basic null-safe value extraction.
 *
 * This class cannot be instantiated directly — only subclasses may call its constructor via `super()`.
 * Read for details: https://github.com/LCMApps/video-quality-tools/issues/119
 */
class BaseFrame {
    /**
     * Creates a new BaseFrame instance. Meant to be called by subclasses.
     *
     * @param {RawFrameData} frameData - Raw frame data object, typically parsed from ffprobe/ffmpeg output.
     * @throws {Error} If instantiated directly instead of via subclass.
     * @throws {TypeError} If `frameData` is not an object.
     */
    constructor(frameData) {
        if (new.target === BaseFrame) {
            throw new Error('BaseFrame is an abstract class and cannot be instantiated directly.');
        }

        if (typeof frameData !== 'object' || frameData === null) {
            throw new TypeError('Expected an object as constructor argument.');
        }

        const desc = Object.getOwnPropertyDescriptor(this.constructor, 'schema');

        if (!desc || typeof desc.get !== 'function' || typeof desc.set === 'function') {
            const name = this.constructor && this.constructor.name ? this.constructor.name : '<UnknownClass>';
            throw new Error(
                `${name}.schema must be a static getter without a setter`
            );
        }

        this._schemaVersion = desc.get.call(this.constructor);

        /**
         * @protected
         * @type {string|null}
         */
        this._mediaType = this._assertStringOrNull(
            this._returnValueOrNullIfAbsent(frameData, MEDIA_TYPE),
            MEDIA_TYPE
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._streamIndex = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, STREAM_INDEX),
            STREAM_INDEX
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._keyFrame = this._assertZeroOrOneOrNull(
            this._returnValueOrNullIfAbsent(frameData, KEY_FRAME),
            KEY_FRAME
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._pktDts = this._assertNonNegativeIntegerOrNull(
            this._returnValueOrNullIfAbsent(frameData, PKT_DTS),
            PKT_DTS
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._pktDtsTime = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, PKT_DTS_TIME),
            PKT_DTS_TIME
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._bestEffortTimestamp = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, BEST_EFFORT_TIMESTAMP),
            BEST_EFFORT_TIMESTAMP
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._bestEffortTimestampTime = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, BEST_EFFORT_TIMESTAMP_TIME),
            BEST_EFFORT_TIMESTAMP_TIME
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._pktPos = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, PKT_POS),
            PKT_POS
        );

        /**
         * @protected
         * @type {number|null}
         */
        this._pktSize = this._assertNonNegativeNumberOrNull(
            this._returnValueOrNullIfAbsent(frameData, PKT_SIZE),
            PKT_SIZE
        );
    }

    getSchemaVersion() {
        return this._schemaVersion;
    }

    /**
     * Returns the media type (e.g., 'audio' or 'video').
     * @returns {string|null}
     */
    getMediaType() {
        return this._mediaType;
    }

    /**
     * Returns the stream index this frame belongs to.
     * @returns {number|null}
     */
    getStreamIndex() {
        return this._streamIndex;
    }

    /**
     * Returns whether the frame is a key frame (1) or not (0).
     * @returns {number|null}
     */
    getKeyFrame() {
        return this._keyFrame;
    }

    /**
     * Decoding timestamp in timebase units or null.
     * @returns {number|null}
     */
    getPktDts() {
        return this._pktDts;
    }

    /**
     * Decoding timestamp in seconds or null.
     * @returns {number|null}
     */
    getPktDtsTime() {
        return this._pktDtsTime;
    }

    /**
     * Returns the best-effort timestamp (in timebase units).
     * @returns {number|null}
     */
    getBestEffortTimestamp() {
        return this._bestEffortTimestamp;
    }

    /**
     * Returns the best-effort timestamp converted to seconds.
     * @returns {number|null}
     */
    getBestEffortTimestampTime() {
        return this._bestEffortTimestampTime;
    }

    /**
     * Returns the packet position within the stream.
     * @returns {number|null}
     */
    getPktPos() {
        return this._pktPos;
    }

    /**
     * Returns the packet size in bytes.
     * @returns {number|null}
     */
    getPktSize() {
        return this._pktSize;
    }

    /**
     * Safely extracts a field value from the input data.
     * If the field is absent, returns null.
     *
     * @protected
     * @param {RawFrameData} frameData - Raw frame data.
     * @param {string} fieldName - Key name to extract.
     * @returns {*|null} The extracted value or null if not present.
     */
    _returnValueOrNullIfAbsent(frameData, fieldName) {
        return frameData[fieldName] !== undefined ? frameData[fieldName] : null;
    }

    /**
     * Ensures the value is either null or a string.
     *
     * @protected
     * @param {*} value - Value to validate.
     * @param {string} fieldName - Field name for error messages.
     * @returns {string|null}
     * @throws {TypeError} If value is not null and not a string.
     */
    _assertStringOrNull(value, fieldName) {
        if (value === null) {
            return null;
        }

        if (typeof value === 'string') {
            return value;
        }

        throw new TypeError(`Invalid ${fieldName}: expected string or null, got ${typeof value}`);
    }

    /**
     * Ensures the value is either null or a non-negative integer (>= 0).
     *
     * @protected
     * @param {*} value - Value to validate.
     * @param {string} fieldName - Field name for error messages.
     * @returns {number|null}
     * @throws {TypeError} If value is not null and not a non-negative integer.
     */
    _assertNonNegativeIntegerOrNull(value, fieldName) {
        if (value === null) {
            return null;
        }

        if (Number.isInteger(value) && value >= 0) {
            return value;
        }

        throw new TypeError(`Invalid ${fieldName}: expected non-negative integer or null, got ${value}`);
    }

    /**
     * Ensures the value is either null or a non-negative number (>= 0).
     *
     * @protected
     * @param {*} value - Value to validate.
     * @param {string} fieldName - Field name for error messages.
     * @returns {number|null}
     * @throws {TypeError} If value is not null and not a non-negative number.
     */
    _assertNonNegativeNumberOrNull(value, fieldName) {
        if (value === null) {
            return null;
        }

        if (typeof value === 'number' && value >= 0) {
            return value;
        }

        throw new TypeError(`Invalid ${fieldName}: expected non-negative number or null, got ${value}`);
    }

    /**
     * Ensures the value is either null or strictly 0 or 1.
     *
     * @protected
     * @param {*} value - Value to validate.
     * @param {string} fieldName - Field name for error messages.
     * @returns {0|1|null}
     * @throws {TypeError} If value is not null and not 0 or 1.
     */
    _assertZeroOrOneOrNull(value, fieldName) {
        if (value === null) {
            return null;
        }

        if (value === 0 || value === 1) {
            return value;
        }

        throw new TypeError(`Invalid ${fieldName}: expected 0 or 1 or null, got ${value}`);
    }
}

module.exports = BaseFrame;

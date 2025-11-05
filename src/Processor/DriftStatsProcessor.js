'use strict';

const EventEmitter = require('events');
const FrameEnvelope = require('../FrameEnvelope');
const {
    ConfigError,
    ProcessorNotStartedError,
    ProcessorAlreadyStartedError,
    IncompleteFrameDataError
} = require('../Errors');

/**
 * DriftStatsProcessor analyzes PTS/DTS drift for video and audio frames over time.
 *
 * This class collects frame envelopes and periodically emits statistics about how
 * much the presentation and decoding timestamps have drifted from their expected values
 * based on real-time reception.
 *
 * The processor must be started before frames can be added, and emits 'stats' events
 * at regular intervals with drift metrics per media type and stream index.
 *
 * Stats are emitted in the following format:
 * {
 *   video: {
 *     1: { pts: {min, max, avg}, dts: {min, max, avg}, framesCount: n }
 *   },
 *   audio: {
 *     2: { pts: {min, max, avg}, dts: {min, max, avg}, framesCount: n }
 *   }
 * }
 *
 * @fires DriftStatsProcessor#stats
 * @fires DriftStatsProcessor#error
 *
 * @example
 * const processor = new DriftStatsProcessor(1000); // Calculate stats every 1 second
 * processor.on('stats', (stats) => {
 *     if (stats.video) {
 *         for (const [streamIndex, drift] of Object.entries(stats.video)) {
 *             console.log(`Video stream ${streamIndex}: PTS drift avg=${drift.pts.avg}`);
 *         }
 *     }
 * });
 * processor.on('error', (err) => console.error(err));
 * processor.start();
 * processor.addFrameEnvelope(frameEnvelope);
 */
class DriftStatsProcessor extends EventEmitter {
    /**
     * Creates a new DriftStatsProcessor instance.
     *
     * @param {number} durationInMs - Interval duration in milliseconds for calculating and emitting stats.
     *                                 Must be a positive integer greater than 0.
     * @throws {ConfigError} If durationInMs is not a positive integer greater than 0.
     */
    constructor(durationInMs) {
        super();

        if (!Number.isInteger(durationInMs) || durationInMs <= 0) {
            throw new ConfigError(
                'Expected durationInMs to be a positive integer greater than 0.',
                {durationInMs: durationInMs}
            );
        }

        /**
         * @private
         * @type {number}
         */
        this._durationInMs = durationInMs;

        /**
         * @private
         * @type {boolean}
         */
        this._isStarted = false;

        /**
         * @private
         * @type {NodeJS.Timeout|null}
         */
        this._intervalId = null;

        /**
         * Stores the first frame data for each media type + stream index combination.
         * Structure: Map<mediaType, Map<streamIndex, {initialReceivedAt, initialPtsTime, initialDtsTime}>>
         *
         * @private
         * @type {Map<string, Map<number, {initialReceivedAt: Date, initialPtsTime: number, initialDtsTime: number}>>}
         */
        this._firstFrameData = new Map();

        /**
         * Buffer for storing frame envelopes.
         * Structure: Map<mediaType, Map<streamIndex, Array<FrameEnvelope>>>
         *
         * @private
         * @type {Map<string, Map<number, Array<FrameEnvelope>>>}
         */
        this._framesBuffer = new Map();

        /**
         * Tracks streams that have emitted errors and should be ignored.
         * Structure: Map<mediaType, Set<streamIndex>>
         *
         * @private
         * @type {Map<string, Set<number>>}
         */
        this._ignoredStreams = new Map();
    }

    /**
     * Returns whether the processor is currently started.
     *
     * @returns {boolean} True if started, false otherwise.
     */
    isStarted() {
        return this._isStarted;
    }

    /**
     * Starts the processor and begins the periodic stats calculation cycle.
     * Clears any internal structures from previous sessions.
     *
     * @throws {ProcessorAlreadyStartedError} If the processor is already started.
     */
    start() {
        if (this._isStarted) {
            throw new ProcessorAlreadyStartedError('Processor is already started.');
        }

        this._clearInternalStructures();
        this._isStarted = true;

        this._intervalId = setInterval(() => {
            this._processStats();
        }, this._durationInMs);
    }

    /**
     * Stops the processor and clears the interval timer.
     * Clears any internal structures from the current session.
     * Multiple calls to stop are safe and will not throw errors.
     */
    stop() {
        if (!this._isStarted) {
            return;
        }

        if (this._intervalId !== null) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }

        this._clearInternalStructures();
        this._isStarted = false;
    }

    /**
     * Adds a frame envelope for processing.
     *
     * @param {FrameEnvelope} frameEnvelope - The frame envelope to add.
     * @throws {ProcessorNotStartedError} If the processor is not started.
     * @throws {TypeError} If frameEnvelope is not an instance of FrameEnvelope.
     */
    addFrameEnvelope(frameEnvelope) {
        if (!this._isStarted) {
            throw new ProcessorNotStartedError('Cannot add frame envelope when processor is not started.');
        }

        if (!(frameEnvelope instanceof FrameEnvelope)) {
            throw new TypeError('Expected frameEnvelope to be an instance of FrameEnvelope.');
        }

        const frame = frameEnvelope.getFrame();
        const mediaType = frame.getMediaType();
        const streamIndex = frame.getStreamIndex();

        // Only process audio and video media types
        if (mediaType !== 'audio' && mediaType !== 'video') {
            return;
        }

        // Check if this stream is already ignored
        if (this._isStreamIgnored(mediaType, streamIndex)) {
            return;
        }

        // Check if stream index is null
        if (streamIndex === null) {
            this._markStreamAsIgnored(mediaType, streamIndex);
            this._emitIncompleteFrameDataError(mediaType, streamIndex, 'stream_index');
            return;
        }

        // Extract PTS and DTS time values
        const ptsTime = this._getPtsTime(frame);
        const dtsTime = this._getDtsTime(frame);

        // Check if PTS or DTS time is null
        if (ptsTime === null || dtsTime === null) {
            this._markStreamAsIgnored(mediaType, streamIndex);
            const missingField = ptsTime === null ? 'pts_time' : 'dts_time';
            this._emitIncompleteFrameDataError(mediaType, streamIndex, missingField);
            return;
        }

        // Check if this is the first frame for this media type + stream index
        if (!this._hasFirstFrameData(mediaType, streamIndex)) {
            this._storeFirstFrameData(frameEnvelope, mediaType, streamIndex, ptsTime, dtsTime);
        }

        // Add to frames buffer
        this._addToFramesBuffer(frameEnvelope, mediaType, streamIndex);
    }

    /**
     * Extracts PTS time from a frame based on its schema version.
     *
     * @private
     * @param {BaseFrame} frame - The frame to extract PTS time from.
     * @returns {number|null} The PTS time in seconds or null.
     */
    _getPtsTime(frame) {
        const schemaVersion = frame.getSchemaVersion();

        if (schemaVersion === 1) {
            return frame.getPktPtsTime();
        } else {
            return frame.getPtsTime();
        }
    }

    /**
     * Extracts DTS time from a frame.
     *
     * @private
     * @param {BaseFrame} frame - The frame to extract DTS time from.
     * @returns {number|null} The DTS time in seconds or null.
     */
    _getDtsTime(frame) {
        return frame.getPktDtsTime();
    }

    /**
     * Checks if a stream is marked as ignored.
     *
     * @private
     * @param {string} mediaType - The media type.
     * @param {number|null} streamIndex - The stream index.
     * @returns {boolean} True if the stream is ignored, false otherwise.
     */
    _isStreamIgnored(mediaType, streamIndex) {
        const indexSet = this._ignoredStreams.get(mediaType);
        if (!indexSet) {
            return false;
        }
        return indexSet.has(streamIndex);
    }

    /**
     * Marks a stream as ignored for future processing.
     *
     * @private
     * @param {string} mediaType - The media type.
     * @param {number|null} streamIndex - The stream index.
     */
    _markStreamAsIgnored(mediaType, streamIndex) {
        if (!this._ignoredStreams.has(mediaType)) {
            this._ignoredStreams.set(mediaType, new Set());
        }
        this._ignoredStreams.get(mediaType).add(streamIndex);
    }

    /**
     * Emits an error event for incomplete frame data (only once per stream).
     *
     * @private
     * @param {string} mediaType - The media type.
     * @param {number|null} streamIndex - The stream index.
     * @param {string} missingField - The name of the missing field.
     */
    _emitIncompleteFrameDataError(mediaType, streamIndex, missingField) {
        const error = new IncompleteFrameDataError(
            'Frame has incomplete data and will be ignored.',
            {mediaType: mediaType, streamIndex: streamIndex, missingField: missingField}
        );
        this.emit('error', error);
    }

    /**
     * Checks if first frame data exists for a media type + stream index.
     *
     * @private
     * @param {string} mediaType - The media type.
     * @param {number} streamIndex - The stream index.
     * @returns {boolean} True if first frame data exists, false otherwise.
     */
    _hasFirstFrameData(mediaType, streamIndex) {
        const streamMap = this._firstFrameData.get(mediaType);
        if (!streamMap) {
            return false;
        }
        return streamMap.has(streamIndex);
    }

    /**
     * Stores first frame data for a media type + stream index.
     *
     * @private
     * @param {FrameEnvelope} frameEnvelope - The frame envelope.
     * @param {string} mediaType - The media type.
     * @param {number} streamIndex - The stream index.
     * @param {number} ptsTime - The PTS time in seconds.
     * @param {number} dtsTime - The DTS time in seconds.
     */
    _storeFirstFrameData(frameEnvelope, mediaType, streamIndex, ptsTime, dtsTime) {
        if (!this._firstFrameData.has(mediaType)) {
            this._firstFrameData.set(mediaType, new Map());
        }

        this._firstFrameData.get(mediaType).set(streamIndex, {
            initialReceivedAt: frameEnvelope.getReceivedAt(),
            initialPtsTime: ptsTime,
            initialDtsTime: dtsTime
        });
    }

    /**
     * Adds a frame envelope to the frames buffer.
     *
     * @private
     * @param {FrameEnvelope} frameEnvelope - The frame envelope to add.
     * @param {string} mediaType - The media type.
     * @param {number} streamIndex - The stream index.
     */
    _addToFramesBuffer(frameEnvelope, mediaType, streamIndex) {
        if (!this._framesBuffer.has(mediaType)) {
            this._framesBuffer.set(mediaType, new Map());
        }

        const streamMap = this._framesBuffer.get(mediaType);
        if (!streamMap.has(streamIndex)) {
            streamMap.set(streamIndex, []);
        }

        streamMap.get(streamIndex).push(frameEnvelope);
    }

    /**
     * Processes and emits statistics for all collected frames.
     *
     * @private
     */
    _processStats() {
        const stats = {};

        // Iterate through all media types and stream indices
        for (const [mediaType, streamMap] of this._firstFrameData.entries()) {
            // Initialize media type object if not exists
            if (!stats[mediaType]) {
                stats[mediaType] = {};
            }

            for (const [streamIndex, firstFrameData] of streamMap.entries()) {
                const streamStats = this._calculateStreamStats(
                    mediaType,
                    streamIndex,
                    firstFrameData
                );

                if (streamStats) {
                    // Store stats under streamIndex key, excluding mediaType and streamIndex from the object
                    stats[mediaType][streamIndex] = {
                        pts: streamStats.pts,
                        dts: streamStats.dts,
                        framesCount: streamStats.framesCount
                    };
                } else {
                    stats[mediaType][streamIndex] = {
                        pts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        dts: {
                            min: null,
                            max: null,
                            avg: null
                        },
                        framesCount: 0
                    };
                }
            }
        }

        this._framesBuffer.clear();

        this.emit('stats', stats);
    }

    /**
     * Calculates drift statistics for a specific media type + stream index.
     *
     * @private
     * @param {string} mediaType - The media type.
     * @param {number} streamIndex - The stream index.
     * @param {Object} firstFrameData - The first frame data.
     * @returns {Object|null} The calculated statistics or null if no frames available.
     */
    _calculateStreamStats(mediaType, streamIndex, firstFrameData) {
        const streamBufferMap = this._framesBuffer.get(mediaType);
        if (!streamBufferMap) {
            return null;
        }

        const frameEnvelopes = streamBufferMap.get(streamIndex);
        if (!frameEnvelopes || frameEnvelopes.length === 0) {
            return null;
        }

        const {initialReceivedAt, initialPtsTime, initialDtsTime} = firstFrameData;

        const ptsDrifts = [];
        const dtsDrifts = [];

        for (const frameEnvelope of frameEnvelopes) {
            const frame = frameEnvelope.getFrame();
            const receivedAt = frameEnvelope.getReceivedAt();

            const ptsTime = this._getPtsTime(frame);
            const dtsTime = this._getDtsTime(frame);

            // Calculate drifts in seconds
            const receivedDelta = (receivedAt.getTime() - initialReceivedAt.getTime()) / 1000;

            const ptsDrift = receivedDelta - (ptsTime - initialPtsTime);
            const dtsDrift = receivedDelta - (dtsTime - initialDtsTime);

            ptsDrifts.push(ptsDrift);
            dtsDrifts.push(dtsDrift);
        }

        return {
            mediaType: mediaType,
            streamIndex: streamIndex,
            pts: this._calculateMinMaxAvg(ptsDrifts),
            dts: this._calculateMinMaxAvg(dtsDrifts),
            framesCount: frameEnvelopes.length
        };
    }

    /**
     * Calculates min, max, and average for an array of numbers.
     *
     * @private
     * @param {Array<number>} values - Array of numeric values.
     * @returns {Object} Object with min, max, and avg properties.
     */
    _calculateMinMaxAvg(values) {
        if (values.length === 0) {
            return {min: 0, max: 0, avg: 0};
        }

        const min = Math.min(...values);
        const max = Math.max(...values);
        const sum = values.reduce((acc, val) => acc + val, 0);
        const avg = sum / values.length;

        return {min: min, max: max, avg: avg};
    }

    /**
     * Clears all internal data structures.
     *
     * @private
     */
    _clearInternalStructures() {
        this._firstFrameData.clear();
        this._framesBuffer.clear();
        this._ignoredStreams.clear();
    }
}

module.exports = DriftStatsProcessor;


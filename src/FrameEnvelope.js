'use strict';

const _ = require('lodash');
const BaseFrame = require('./Frame/BaseFrame');

/**
 * FrameEnvelope is a value object that encapsulates a frame and the timestamp when it was received.
 *
 * This class serves as an immutable container for a frame object (any subclass of BaseFrame)
 * and the exact time when that frame was received, enabling temporal tracking of frame events.
 *
 * @example
 * const frame = new VideoFrameSchema1(frameData);
 * const envelope = new FrameEnvelope(frame, new Date());
 * console.log(envelope.getFrame());
 * console.log(envelope.getReceivedAt());
 */
class FrameEnvelope {
    /**
     * Creates a new FrameEnvelope instance.
     *
     * @param {BaseFrame} frame - An instance of any class that extends BaseFrame.
     * @param {Date} receivedAt - A JavaScript Date object representing when the frame was received.
     * @throws {TypeError} If `frame` is not an instance of a class that extends BaseFrame.
     * @throws {TypeError} If `receivedAt` is not a Date object.
     */
    constructor(frame, receivedAt) {
        if (!(frame instanceof BaseFrame)) {
            throw new TypeError('Expected frame to be an instance of a class that extends BaseFrame.');
        }

        if (!_.isDate(receivedAt)) {
            throw new TypeError('Expected receivedAt to be a Date object.');
        }

        /**
         * @private
         * @type {BaseFrame}
         */
        this._frame = frame;

        /**
         * @private
         * @type {Date}
         */
        this._receivedAt = receivedAt;
    }

    /**
     * Returns the encapsulated frame object.
     *
     * @returns {BaseFrame} The frame instance.
     */
    getFrame() {
        return this._frame;
    }

    /**
     * Returns the timestamp when the frame was received.
     *
     * @returns {Date} The receivedAt Date object.
     */
    getReceivedAt() {
        return this._receivedAt;
    }
}

module.exports = FrameEnvelope;


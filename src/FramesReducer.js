'use strict';

const _            = require('lodash');
const EventEmitter = require('events');

const Errors = require('src/Errors');

const startFrameTag = '[FRAME]';
const endFrameTag   = '[/FRAME]';

class FramesReducer extends EventEmitter {
    constructor(config) {
        super();

        if (!_.isPlainObject(config)) {
            throw new TypeError('Config param should be a plain object.');
        }

        if (!_.isInteger(config.bufferMaxLengthInBytes) || config.bufferMaxLengthInBytes < 0) {
            throw new Errors.ConfigError('bufferMaxLengthInBytes param should be a positive integer.');
        }

        this._config         = config;
        this._chunkRemainder = '';
    }

    process(newChunk) {
        let frames = [];

        const data = this._chunkRemainder + newChunk;

        if (data.length > this._config.bufferMaxLengthInBytes) {
            const error = new Errors.InvalidFrameError(
                'Too long (probably infinite) frame.' +
                `The frame length is ${data.length}.` +
                `The max frame length must be ${this._config.bufferMaxLengthInBytes}`
            );

            return this.emit('error', error);
        }

        try {
            const res = FramesReducer.reduceFramesFromChunks(data);

            this._chunkRemainder = res.chunkRemainder;
            frames               = res.frames;
        } catch (error) {
            return this.emit('error', error);
        }

        for (const frame of frames) {
            this.emit('frame', FramesReducer.frameToJson(frame));
        }
    }

    reset() {
        this._chunkRemainder = '';
    }

    static reduceFramesFromChunks(data) {
        let chunkRemainder = '';
        let frames         = data.split(endFrameTag);

        if (frames[frames.length - 1]) {
            chunkRemainder = frames[frames.length - 1];
        }

        frames.splice(-1);

        for (const frame of frames) {
            if (
                frame.indexOf(startFrameTag) === -1
                || (frame.indexOf(startFrameTag) !== frame.lastIndexOf(startFrameTag))
            ) {
                throw new Errors.InvalidFrameError('Can not process frame with invalid structure.', {data, frame});
            }
        }

        frames = frames.map(frame => frame.replace(startFrameTag, ''));

        frames = frames.map(frame => frame.trim());

        return {chunkRemainder, frames};
    }

    static frameToJson(rawFrame) {
        const frame      = {};
        const frameLines = rawFrame.split('\n');

        frameLines.forEach(frameLine => {
            let [key, value] = frameLine.split('=').map(item => item.trim());

            if (key && value) {
                value      = Number(value) ? Number(value) : value;
                frame[key] = value;
            }
        });

        return frame;
    }
}

module.exports = FramesReducer;

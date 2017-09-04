'use strict';

const _            = require('lodash');
const EventEmitter = require('events');

const Errors = require('src/Errors');

const startFrameTag = '[FRAME]';
const endFrameTag   = '[/FRAME]';

function createFramesReducer(config) {
    let chunkRemainder = '';

    const ee = new EventEmitter();

    if (!_.isPlainObject(config)) {
        throw new TypeError('Config param should be a plain object.');
    }

    if (!_.isInteger(config.bufferMaxLengthInBytes) || config.bufferMaxLengthInBytes < 0) {
        throw new Errors.ConfigError('bufferMaxLengthInBytes param should be a positive integer.');
    }

    return Object.assign(Object.create(ee), {
        process(newChunk) {
            let frames = [];

            const data = chunkRemainder + newChunk;

            if (data.length > config.bufferMaxLengthInBytes) {
                const error = new Errors.InvalidFrameError(
                    'Too long (probably infinite) frame.' +
                    `The frame length is ${data.length}.` +
                    `The max frame length must be ${config.bufferMaxLengthInBytes}`
                );

                return process.nextTick(() => this.emit('error', error));
            }

            try {
                ({chunkRemainder, frames} = this._reduceFramesFromChunks(data));
            } catch (error) {
                return process.nextTick(() => this.emit('error', error));
            }

            for (const frame of frames) {
                setTimeout(() => {
                    this.emit('frame', this._frameToJson(frame));
                }, 0);
            }
        },
        reset() {
            chunkRemainder = '';
        },
        _reduceFramesFromChunks,
        _frameToJson
    });
}

module.exports = createFramesReducer;

function _reduceFramesFromChunks(data) {
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

function _frameToJson(rawFrame) {
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

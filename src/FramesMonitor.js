'use strict';

const _              = require('lodash');
const fs             = require('fs');
const {EventEmitter} = require('events');
const {spawn}        = require('child_process');

const Errors = require('./Errors/index');

const STDOUT = 'STDOUT';
const STDERR = 'STDERR';

const startFrameTag = '[FRAME]';
const endFrameTag   = '[/FRAME]';

class FramesMonitor extends EventEmitter {
    constructor(config, url) {
        super();

        if (!_.isPlainObject(config)) {
            throw new TypeError('Config param should be a plain object, bastard.');
        }

        if (!_.isString(url)) {
            throw new TypeError('You should provide a correct url, bastard.');
        }

        const {ffprobePath, timeoutInSec, bufferMaxLengthInBytes} = config;

        if (!_.isString(ffprobePath) || _.isEmpty(ffprobePath)) {
            throw new Errors.ConfigError('You should provide a correct path to ffprobe, bastard.');
        }

        if (!_.isInteger(timeoutInSec) || timeoutInSec <= 0) {
            throw new Errors.ConfigError('You should provide a correct timeout, bastard.');
        }

        if (!_.isInteger(bufferMaxLengthInBytes) || bufferMaxLengthInBytes <= 0) {
            throw new Errors.ConfigError('bufferMaxLengthInBytes param should be a positive integer.');
        }

        this._assertExecutable(ffprobePath);

        this._config = _.cloneDeep(config);
        this._url    = url;

        this._cp             = null;
        this._chunkRemainder = '';
    }

    listen() {
        if (this.isListening()) {
            throw new Errors.AlreadyListeningError('You are already listening.');
        }

        this._cp = this._runShowFramesProcess();

        this._cp.once('exit', this._onExit.bind(this));

        this._cp.on('error', this._onProcessError.bind(this));

        this._cp.stdout.on('error', this._onProcessStreamsError.bind(this, STDOUT));
        this._cp.stderr.on('error', this._onProcessStreamsError.bind(this, STDERR));

        this._cp.stderr.on('data', this._onStderrData.bind(this));

        this._cp.stdout.on('data', this._onStdoutChunk.bind(this));
    }

    isListening() {
        return !!this._cp;
    }

    stopListen() {
        if (!this.isListening()) {
            throw new Errors.AlreadyStoppedListenError('This service is already stopped.');
        }

        this._chunkRemainder = '';

        this._cp.kill();
        this._cp = null;
    }

    _assertExecutable(path) {
        try {
            fs.accessSync(path, fs.constants.X_OK);
        } catch (e) {
            throw new Errors.ExecutablePathError(e.message, {path});
        }
    }

    _onProcessError(err) {
        const {ffprobePath} = this._config;

        this.emit('error', new Errors.ProcessError(
            `${ffprobePath} process could not be spawned or just got an error.`, {
                url  : this._url,
                error: err
            })
        );
    }

    _onProcessStreamsError(streamType, err) {
        const {ffprobePath} = this._config;

        this.emit('error', new Errors.ProcessStreamError(
            `got an error from a ${ffprobePath} ${streamType} process stream.`, {
                url  : this._url,
                error: err
            })
        );
    }

    _onStderrData(data) {
        const {ffprobePath} = this._config;

        this.emit('stderr', new Errors.FramesMonitorError(
            `got stderr output from a ${ffprobePath} process`, {
                data: data.toString(),
                url : this._url
            })
        );
    }

    _onExit(code, signal) {
        this._cp = null;

        this.emit('exit', code, signal);
    }

    _runShowFramesProcess() {
        const {ffprobePath, timeoutInSec} = this._config;

        const exec = spawn(
            ffprobePath,
            [
                '-hide_banner',
                '-v',
                'error',
                '-select_streams',
                'v:0',
                '-show_frames',
                '-show_entries',
                'frame=pkt_size,pkt_pts_time,pkt_duration_time,media_type,pict_type,key_frame',
                '-i',
                `${this._url} timeout=${timeoutInSec}`
            ]
        );

        return exec;
    }

    _onStdoutChunk(newChunk) {
        setImmediate(() => {
            const data = this._chunkRemainder + newChunk;

            if (data.length > this._config.bufferMaxLengthInBytes) {
                const error = new Errors.InvalidFrameError(
                    'Too long (probably infinite) frame.' +
                    `The frame length is ${data.length}.` +
                    `The max frame length must be ${this._config.bufferMaxLengthInBytes}`
                );

                return this.emit('error', error);
            }

            let frames;

            try {
                const res = FramesMonitor.reduceFramesFromChunks(data);

                this._chunkRemainder = res.chunkRemainder;
                frames               = res.frames;
            } catch (error) {
                return this.emit('error', error);
            }

            for (const frame of frames) {
                this.emit('frame', FramesMonitor.frameToJson(frame));
            }
        });
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

module.exports = FramesMonitor;

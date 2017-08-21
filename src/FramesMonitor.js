'use strict';

const _              = require('lodash');
const fs             = require('fs');
const {EventEmitter} = require('events');
const {spawn}        = require('child_process');

const {
          ExecutablePathError,
          ConfigError,
          AlreadyListeningError,
          ProcessStreamError,
          AlreadyStoppedListenError,
          FramesMonitorError,
          ProcessError
      } = require('./Errors/index');

class FramesMonitor extends EventEmitter {
    constructor(config, url) {
        super();

        if (!config || !url) {
            throw new TypeError('You should provide both arguments.');
        }

        if (!_.isObject(config)) {
            throw new TypeError('Config param should be an object, bastard.');
        }

        if (!_.isString(url)) {
            throw new TypeError('You should provide a correct url, bastard.');
        }

        const {ffprobePath, timeoutInSec} = config;

        if (!_.isString(ffprobePath) || _.isEmpty(ffprobePath)) {
            throw new ConfigError('You should provide a correct path to ffprobePath, bastard.');
        }

        if (!_.isInteger(timeoutInSec) || timeoutInSec <= 0) {
            throw new ConfigError('You should provide a correct timeout, bastard.');
        }

        this._assertExecutable(ffprobePath);

        this._config = config;
        this._url    = url;

        this._cp             = null;
        this._chunkRemainder = '';
    }

    listen() {
        const {ffprobePath} = this._config;

        if (this.isListening()) {
            throw new AlreadyListeningError('You are already listening.');
        }

        this._cp = this._runShowFramesProcess();

        this._cp.once('exit', this._onExit.bind(this));

        this._cp.on('error', err => {
            this.emit('error', new ProcessError(`${ffprobePath} process could not be spawned or just got an error.`, {
                url:   this._url,
                error: err
            }))
        });

        this._cp.stdout.on('error', err => {
            this.emit('error', new ProcessStreamError(`got an error from a ${ffprobePath} STDOUT process stream.`, {
                url:   this._url,
                error: err
            }))
        });

        this._cp.stderr.on('error', err => {
            this.emit('error', new ProcessStreamError(`got an error from a ${ffprobePath} STDERR process stream.`, {
                url:   this._url,
                error: err
            }))
        });

        this._cp.stderr.on('data', data => this.emit('stderr', new FramesMonitorError(data, {url: this._url})));

        this._cp.stdout.on('data', this._onStdoutChunk.bind(this));
    }

    isListening() {
        return !!this._cp;
    }

    stopListen() {
        if (!this.isListening()) {
            throw new AlreadyStoppedListenError('This service is already stopped.');
        }

        this._cp.kill();
    }

    _assertExecutable(path) {
        try {
            fs.accessSync(path, fs.constants.X_OK);
        } catch (e) {
            throw new ExecutablePathError(e.message, {path});
        }
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
                '-show_entries',
                'frame=pkt_size,pkt_pts_time,pkt_duration_time,media_type,pict_type',
                '-show_frames',
                '-i',
                `${this._url} timeout=${timeoutInSec}`
            ]
        );

        return exec;
    }

    _onStdoutChunk(chunk) {
        for (let frame of this._reduceFramesFromStdoutBuffer(chunk.toString())) {
            setImmediate(() => {
                frame = this._frameToJSON(frame);

                this.emit('frame', frame);
            });
        }
    }

    _reduceFramesFromStdoutBuffer(chunk) {
        const data = this._chunkRemainder + chunk;

        const frames = data.split('[/FRAME]');

        if (frames[frames.length - 1]) {
            this._chunkRemainder = frames[frames.length - 1];
        }

        frames.splice(-1);

        return frames;
    }

    _frameToJSON(rawFrame) {
        if (!rawFrame) {
            return null;
        }

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

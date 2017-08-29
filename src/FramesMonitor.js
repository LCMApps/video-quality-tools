'use strict';

const _              = require('lodash');
const fs             = require('fs');
const {EventEmitter} = require('events');
const {spawn}        = require('child_process');

const Errors = require('./Errors/index');

const STDOUT = 'STDOUT';
const STDERR = 'STDERR';

class FramesMonitor extends EventEmitter {
    constructor(config, url, framesReducer) {
        super();

        if (!_.isPlainObject(config)) {
            throw new TypeError('Config param should be a plain object, bastard.');
        }

        if (!_.isString(url)) {
            throw new TypeError('You should provide a correct url, bastard.');
        }

        if (!(framesReducer instanceof EventEmitter)) {
            throw new TypeError('frames reducer should be an event emitter object, bastard.');
        }

        const {ffprobePath, timeoutInSec} = config;

        if (!_.isString(ffprobePath) || _.isEmpty(ffprobePath)) {
            throw new Errors.ConfigError('You should provide a correct path to ffprobe, bastard.');
        }

        if (!_.isInteger(timeoutInSec) || timeoutInSec <= 0) {
            throw new Errors.ConfigError('You should provide a correct timeout, bastard.');
        }

        this._assertExecutable(ffprobePath);

        this._config = _.cloneDeep(config);
        this._url    = url;

        this._cp = null;

        this._framesReducer = framesReducer;
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

        this._framesReducer.on('error', this._onFramesReducerError.bind(this));
        this._framesReducer.on('frame', this._onFramesReducerFrame.bind(this));
    }

    isListening() {
        return !!this._cp;
    }

    stopListen(signal) {
        if (!this.isListening()) {
            throw new Errors.AlreadyStoppedListenError('This service is already stopped.');
        }

        this._cp.kill(signal);
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
        setTimeout(() => {
            this._framesReducer.process(chunk.toString());
        }, 0);
    }

    _onFramesReducerError(error) {
        this.emit('error', error);
    }

    _onFramesReducerFrame(frame) {
        this.emit('frame', frame);
    }
}

module.exports = FramesMonitor;

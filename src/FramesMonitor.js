'use strict';

const _              = require('lodash');
const fs             = require('fs');
const {EventEmitter} = require('events');
const {spawn}        = require('child_process');

const Errors      = require('./Errors/');
const ExitReasons = require('./ExitReasons');

const STDOUT = 'STDOUT';
const STDERR = 'STDERR';

const startFrameTag = '[FRAME]';
const endFrameTag   = '[/FRAME]';

const validErrorLevels = [
    'trace',
    'debug',
    'verbose',
    'info',
    'warning',
    'error',
    'fatal',
    'panic',
    'quiet'
];

const STDERR_OBJECTS_LIMIT = 5;

class FramesMonitor extends EventEmitter {
    constructor(config, url) {
        super();

        if (!_.isPlainObject(config)) {
            throw new TypeError('Config param should be a plain object, bastard.');
        }

        if (!_.isString(url)) {
            throw new TypeError('You should provide a correct url, bastard.');
        }

        const {
                  ffprobePath,
                  timeoutInSec,
                  bufferMaxLengthInBytes,
                  errorLevel,
                  exitProcessGuardTimeoutInMs
              } = config;

        if (!_.isString(ffprobePath) || _.isEmpty(ffprobePath)) {
            throw new Errors.ConfigError('You should provide a correct path to ffprobe, bastard.');
        }

        if (!_.isSafeInteger(timeoutInSec) || timeoutInSec <= 0) {
            throw new Errors.ConfigError('You should provide a correct timeout, bastard.');
        }

        if (!_.isSafeInteger(bufferMaxLengthInBytes) || bufferMaxLengthInBytes <= 0) {
            throw new Errors.ConfigError('bufferMaxLengthInBytes param should be a positive integer.');
        }

        if (!_.isString(errorLevel) || !FramesMonitor._isValidErrorLevel(errorLevel)) {
            throw new Errors.ConfigError(
                'You should provide correct error level, bastard. Check ffprobe documentation.'
            );
        }

        if (!_.isSafeInteger(exitProcessGuardTimeoutInMs) || exitProcessGuardTimeoutInMs <= 0) {
            throw new Errors.ConfigError('exitProcessGuardTimeoutInMs param should be a positive integer.');
        }

        this._assertExecutable(ffprobePath);

        this._config = _.cloneDeep(config);
        this._url    = url;

        this._cp             = null;
        this._chunkRemainder = '';

        this._processingError = null;
        this._stderrOutputs   = [];

        this._exitProcessGuard = null;
    }

    listen() {
        if (this.isListening()) {
            throw new Errors.AlreadyListeningError('You are already listening.');
        }

        this._cp = this._runShowFramesProcess();

        this._cp.once('exit', this._onExit.bind(this));

        this._cp.on('error', this._onProcessStartError.bind(this));

        this._cp.stdout.on('error', this._onProcessStreamsError.bind(this, STDOUT));
        this._cp.stderr.on('error', this._onProcessStreamsError.bind(this, STDERR));

        this._cp.stderr.on('data', this._onStderrData.bind(this));

        this._cp.stdout.on('data', this._onStdoutChunk.bind(this));
    }

    isListening() {
        return !!this._cp;
    }

    stopListen() {
        let exitProcessGuard;

        return new Promise((resolve, reject) => {
            if (!this._cp) {
                return resolve();
            }

            this._cp.removeAllListeners();
            this._cp.stderr.removeAllListeners();
            this._cp.stdout.removeAllListeners();

            this._cp.once('exit', (code, signal) => {
                clearTimeout(exitProcessGuard);

                return resolve({code, signal});
            });

            this._cp.once('error', err => {
                const error = new Errors.ProcessExitError('process exit error', {
                    url  : this._url,
                    error: err
                });

                return reject(error);
            });

            try {
                // ChildProcess kill method for some corner cases can throw an exception
                this._cp.kill('SIGTERM');

                // if kill() call returns okay, it does not mean that the process will exit
                // it's just means that signal was received, but child process can ignore it, so we will set guard
                // and clean it in the exit event handler.
                exitProcessGuard = setTimeout(() => {
                    this._cp.kill('SIGKILL');
                }, this._config.exitProcessGuardTimeoutInMs);
            } catch (err) {
                // platform does not support SIGTERM (probably SIGKILL also)

                const error = new Errors.ProcessExitError('process exit error', {
                    url  : this._url,
                    error: err
                });

                return reject(error);
            }
        });
    }

    _innerStopListen() {
        // a little brother of stopListen
        // used for inner purposes in order to blindly shutdown child process

        return new Promise(resolve => {
            this._cp.once('error', () => {
                return resolve();
            });

            try {
                // ChildProcess kill method for some corner cases can throw an exception
                this._cp.kill('SIGTERM');

                // if kill() call returns okay, it does not mean that the process will exit
                // it's just means that signal was received, but child process can ignore it, so we will set guard
                // and clean it in the exit event handler.
                this._exitProcessGuard = setTimeout(() => {
                    this._cp.kill('SIGKILL');
                }, this._config.exitProcessGuardTimeoutInMs);
            } catch (err) {
                // platform does not support SIGTERM (probably SIGKILL also)

                return resolve();
            }
        });
    }

    _assertExecutable(path) {
        try {
            fs.accessSync(path, fs.constants.X_OK);
        } catch (e) {
            throw new Errors.ExecutablePathError(e.message, {path});
        }
    }

    _onProcessStartError(err) {
        const {ffprobePath} = this._config;

        if (this._cp) {
            this._cp.removeAllListeners();

            this._cp.stderr.removeAllListeners();
            this._cp.stdout.removeAllListeners();

            this._cp = null;
        }

        const reason = new ExitReasons.ProcessStartError(
            `${ffprobePath} process could not be started.`, {
                url  : this._url,
                error: err
            }
        );

        this.emit('exit', reason);
    }

    async _onProcessStreamsError(streamType, err) {
        const {ffprobePath} = this._config;

        const error = new Errors.ProcessStreamError(
            `got an error from a ${ffprobePath} ${streamType} process stream.`, {
                url  : this._url,
                error: err
            }
        );

        return await this._handleProcessingError(error);
    }

    _onStderrData(data) {
        const {ffprobePath} = this._config;

        const error = new Errors.FramesMonitorError(
            `got stderr output from a ${ffprobePath} process`, {
                data: data.toString(),
                url : this._url
            }
        );

        this._stderrOutputs.push(error);

        if (this._stderrOutputs.length > STDERR_OBJECTS_LIMIT) {
            this._stderrOutputs.shift();
        }
    }

    _onExit(code, signal) {
        this._cp = null;

        clearTimeout(this._exitProcessGuard);

        let reason;

        if (signal) {
            reason = new ExitReasons.ExternalSignal(signal);
        } else if (code === 0) {
            reason = new ExitReasons.NormalExit(code);
        } else if (code > 0) {
            reason = new ExitReasons.AbnormalExit(code);
        } else if (this._processingError) {
            reason = new ExitReasons.ProcessingError(this._processingError);
        }

        return this.emit('exit', reason);
    }

    _runShowFramesProcess() {
        const {ffprobePath, timeoutInSec, errorLevel} = this._config;

        try {
            const exec = spawn(
                ffprobePath,
                [
                    '-hide_banner',
                    '-v',
                    errorLevel,
                    '-select_streams',
                    'v:0',
                    '-show_frames',
                    '-show_entries',
                    'frame=pkt_size,pkt_pts_time,media_type,pict_type,key_frame',
                    '-i',
                    `${this._url} timeout=${timeoutInSec}`
                ]
            );

            return exec;
        } catch (err) {
            if (err instanceof TypeError) {
                // spawn method throws TypeError if some argument is invalid
                // we don't want to emit this type of errors
                throw err;
            } else {
                // at the same time spawn method can throw another type of error from libuv library
                // we prefer to emit this stuff
                this._onProcessStartError(err);
            }
        }
    }

    async _onStdoutChunk(newChunk) {
        if (this._processingError) {
            return;
        }

        setImmediate(async () => {
            const data = this._chunkRemainder + newChunk.toString();

            if (data.length > this._config.bufferMaxLengthInBytes) {
                const error = new Errors.InvalidFrameError(
                    'Too long (probably infinite) frame.' +
                    `The frame length is ${data.length}.` +
                    `The max frame length must be ${this._config.bufferMaxLengthInBytes}`, {
                        url: this._url
                    }
                );

                return await this._handleProcessingError(error);
            }

            let frames;

            try {
                const res = FramesMonitor._reduceFramesFromChunks(data);

                this._chunkRemainder = res.chunkRemainder;
                frames               = res.frames;
            } catch (error) {
                return await this._handleProcessingError(error);
            }

            for (const frame of frames) {
                this.emit('frame', FramesMonitor._frameToJson(frame));
            }
        });
    }

    async _handleProcessingError(error) {
        this._processingError = error;

        return await this._innerStopListen();
    }

    static _reduceFramesFromChunks(data) {
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

    static _frameToJson(rawFrame) {
        const frame      = {};
        const frameLines = rawFrame.split('\n');

        frameLines.forEach(frameLine => {
            let [key, value] = frameLine.split('=').map(item => item.trim());

            if (key && value) {
                value      = _.isNaN(Number(value)) ? value : Number(value);
                frame[key] = value;
            }
        });

        return frame;
    }

    static _isValidErrorLevel(level) {
        return _.includes(validErrorLevels, level);
    }
}

module.exports = FramesMonitor;

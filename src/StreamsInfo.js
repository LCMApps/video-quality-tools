'use strict';

const _           = require('lodash');
const fs          = require('fs');
const {exec}      = require('child_process');
const {promisify} = require('util');

const Errors = require('./Errors/');
const processFrames = require('./processFrames');

const DAR_OR_SAR_NA = 'N/A';
const DAR_OR_SAR_01 = '0:1';

class StreamsInfo {
    constructor(config, url) {
        if (!_.isObject(config) || _.isFunction(config)) {
            throw new TypeError('Config param should be an object.');
        }

        if (!_.isString(url)) {
            throw new TypeError('You should provide a correct url.');
        }

        const {ffprobePath, timeoutInMs, analyzeDurationInMs} = config;

        if (!_.isString(ffprobePath) || _.isEmpty(ffprobePath)) {
            throw new Errors.ConfigError('You should provide a correct path to ffprobe.');
        }

        if (!_.isInteger(timeoutInMs) || timeoutInMs <= 0) {
            throw new Errors.ConfigError('You should provide a correct timeout.');
        }

        if (analyzeDurationInMs !== undefined && (!_.isInteger(analyzeDurationInMs) || analyzeDurationInMs <= 0)) {
            throw new Errors.ConfigError('You should provide a correct analyze duration.');
        }

        this._assertExecutable(ffprobePath);

        this._config = {
            ffprobePath: config.ffprobePath,
            timeout: config.timeoutInMs * 1000,
            analyzeDuration: config.analyzeDurationInMs && config.analyzeDurationInMs * 1000 || 0
        };

        this._url = url;
    }

    async fetch() {
        let stdout;
        let stderr;

        try {
            ({stdout, stderr} = await this._runShowStreamsProcess());
        } catch (e) {
            throw new Errors.StreamsInfoError('Ffprobe failed to fetch streams data', {error: e, url: this._url});
        }

        if (stderr) {
            throw new Errors.StreamsInfoError(`Ffprobe wrote to stderr: ${stderr}`, {url: this._url});
        }

        if (!_.isString(stdout)) {
            throw new Errors.StreamsInfoError('Ffprobe stdout has invalid type. Must be a String.', {
                stdout: stdout,
                type  : Object.prototype.toString.call(stdout),
                url   : this._url
            });
        }

        if (_.isEmpty(stdout)) {
            throw new Errors.StreamsInfoError('Ffprobe stdout is empty', {url: this._url});
        }

        let {videos, audios} = this._parseStreamsInfo(stdout);

        videos = this._adjustAspectRatio(videos);

        return {videos, audios};
    }

    _assertExecutable(path) {
        try {
            fs.accessSync(path, fs.constants.X_OK);
        } catch (e) {
            throw new Errors.ExecutablePathError(e.message, {path});
        }
    }

    _runShowStreamsProcess() {
        const {ffprobePath, timeout, analyzeDuration} = this._config;

        const commandArgs = [ffprobePath, '-hide_banner', '-v error'];

        if (analyzeDuration) {
            commandArgs.push('-analyzeduration', analyzeDuration);
        }

        commandArgs.push('-rw_timeout', timeout, '-show_streams', '-print_format json', '-i', this._url);

        return promisify(exec)(commandArgs.join(' '));
    }

    _parseStreamsInfo(rawResult) {
        let jsonResult;

        try {
            jsonResult = JSON.parse(rawResult);
        } catch (e) {
            throw new Errors.StreamsInfoError('Failed to parse ffprobe data', {error: e, url: this._url});
        }

        if (Object.prototype.toString.call(jsonResult) !== '[object Object]') {
            throw new Errors.StreamsInfoError('Ffprobe streams data must be an object', {url: this._url});
        }

        if (!Array.isArray(jsonResult.streams)) {
            throw new Errors.StreamsInfoError(
                "'streams' field should be an Array. " +
                `Instead it has ${Object.prototype.toString.call(jsonResult.streams)} type.`,
                {url: this._url}
            );
        }

        const videos = jsonResult.streams.filter(stream => stream.codec_type === 'video');
        const audios = jsonResult.streams.filter(stream => stream.codec_type === 'audio');

        return {videos, audios};
    }

    _adjustAspectRatio(videoFrames) {
        const frames = videoFrames.slice();

        return frames.map(video => {
            if (video.sample_aspect_ratio === DAR_OR_SAR_01 ||
                video.display_aspect_ratio === DAR_OR_SAR_01 ||
                video.sample_aspect_ratio === DAR_OR_SAR_NA ||
                video.display_aspect_ratio === DAR_OR_SAR_NA
            ) {
                video.sample_aspect_ratio  = '1:1';
                try {
                    video.display_aspect_ratio = processFrames.calculateDisplayAspectRatio(video.width, video.height);
                } catch (err) {
                    throw new Errors.StreamsInfoError(
                        'Can not calculate aspect ratio due to invalid video resolution',
                        {width: video.width, height: video.height, url: this._url}
                    );
                }
            }

            return video;
        });
    }
}

module.exports = StreamsInfo;

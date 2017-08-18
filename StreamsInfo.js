'use strict';

const _           = require('lodash');
const fs          = require('fs');
const {exec}      = require('child_process');
const {promisify} = require('util');

const Errors = require('./Errors');

class StreamsInfo {
    constructor(config, url) {
        if (!_.isObject(config) || _.isFunction(config)) {
            throw new TypeError('Config param should be an object, bastard.');
        }

        if (!_.isString(url)) {
            throw new TypeError('You should provide a correct url, bastard.');
        }

        const {ffprobePath, timeoutInSec} = config;

        if (!_.isString(ffprobePath) || _.isEmpty(ffprobePath)) {
            throw new Errors.ConfigError('You should provide a correct path to ffprobe, bastard.');
        }

        if (!_.isInteger(timeoutInSec) || timeoutInSec <= 0) {
            throw new Errors.ConfigError('You should provide a correct timeout, bastard.');
        }

        this._assertExecutable(ffprobePath);

        this._config = config;
        this._url    = url;
    }

    async fetch() {
        let stdout;
        let stderr;

        try {
            ({stdout, stderr} = await this._runShowStreamsProcess());
        } catch (e) {
            throw new Errors.StreamsInfoError(e.message, {error: e, url: this._url});
        }

        if (stderr) {
            throw new Errors.StreamsInfoError(`StreamsInfo::fetch stderr: ${stderr}`, {url: this._url});
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
        const {ffprobePath, timeoutInSec} = this._config;

        const command = `
            ${ffprobePath}\
            -hide_banner\
            -v error\
            -show_streams\
            -print_format json\
            '${this._url} timeout=${timeoutInSec}'
        `;

        return promisify(exec)(command);
    }

    _parseStreamsInfo(rawResult) {
        let jsonResult;

        try {
            jsonResult = JSON.parse(rawResult);
        } catch(e) {
            throw new Errors.StreamsInfoError(e.message, {error: e, url: this._url});
        }

        if (_.isNull(jsonResult)) {
            throw new Errors.StreamsInfoError('Cannot read property \'streams\' of null', {url: this._url});
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
            if (video.sample_aspect_ratio === '0:1' || video.display_aspect_ratio === '0:1') {
                video.sample_aspect_ratio  = '1:1';
                video.display_aspect_ratio = this._calculateDisplayAspectRatio(video.width, video.height);
            }

            return video;
        });
    }

    _calculateDisplayAspectRatio(width, height) {
        if (!_.isInteger(width) || !_.isInteger(height) || width <= 0 || height <= 0) {
            throw new Errors.StreamsInfoError(
                'Can not calculate aspect rate due to invalid video resolution',
                {width, height, url: this._url}
            );
        }

        const gcd = this._findGcd(width, height);

        return `${width / gcd}:${height / gcd}`;
    }

    _findGcd(a, b) {
        if (a === 0 && b === 0) {
            return 0;
        }

        if (b === 0) {
            return a;
        }
        return this._findGcd(b, a % b);
    }
}

module.exports = StreamsInfo;

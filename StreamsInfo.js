'use strict';

const _           = require('lodash');
const fs          = require('fs');
const {exec}      = require('child_process');
const {promisify} = require('util');

const {
          ConfigError,
          StreamsInfoError,
          ExecutablePathError
      } = require('./Errors');

class StreamsInfo {
    constructor(config, url) {

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
    }

    async fetch() {
        let stdout, stderr;

        try {
            ({stdout, stderr} = await this._runShowStreamsProcess());
        } catch (e) {
            throw new StreamsInfoError(e.message, {error: e, url: this._url});
        }

        if (stderr) {
            throw new StreamsInfoError(`StreamsInfo::fetch stderr: ${stderr}`, {url: this._url});
        }

        let {videos, audios} = this._parseStreamsInfo(stdout);

        videos = this._adjustAspectRatio(videos);

        return {videos, audios};
    }

    _assertExecutable(path) {
        try {
            fs.accessSync(path, fs.constants.X_OK);
        } catch (e) {
            throw new ExecutablePathError(e.message, {path});
        }
    }

    _runShowStreamsProcess() {
        const {ffprobePath, timeoutInSec} = this._config;

        const command = `${ffprobePath} -hide_banner -v error -show_streams -print_format json '${this._url} timeout=${timeoutInSec}'`;

        return promisify(exec)(command);
    }

    _parseStreamsInfo(rawResult) {
        let jsonResult = JSON.parse(rawResult);

        if (!Array.isArray(jsonResult.streams)) {
            throw new StreamsInfoError(
                `'streams' field should be an Array. Instead it has ${Object.prototype.toString.call(jsonResult.streams)} type.`,
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
        if (!_.isInteger(width) || width <= 0) {
            throw new StreamsInfoError(`width field has invalid value.`, {width, url: this._url});
        }

        if (!_.isInteger(height) || height <= 0) {
            throw new StreamsInfoError(`height field has invalid value.`, {height, url: this._url});
        }

        const GCD = this._findGCD(width, height);

        return `${width / GCD}:${height / GCD}`;
    }

    _findGCD(a, b) {
        if (b === 0) {
            return a;
        }
        return this._findGCD(b, a % b);
    }
}

module.exports = StreamsInfo;
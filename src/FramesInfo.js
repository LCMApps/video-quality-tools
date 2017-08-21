'use strict';

const _ = require('lodash');

const findLongestRepeatedPattern = require('longest-repeating-and-non-overlapping-pattern');

const {
          InputTypeError,
          CannotFindGopPatternError,
          GopPatternUnstableError,
          BadGopDataError
      } = require('./Errors/index');

class FramesInfo {
    constructor(url) {
        this._url                = url;
        this._prevUserGopPattern = null;
    }

    process(frames) {
        if (!Array.isArray(frames)) {
            throw new InputTypeError('process method is supposed to accept an array of frames.', {
                typeOfFrames: Object.prototype.toString.call(frames),
                url         : this._url
            });
        }

        const videoFrames          = this._filterVideoFrames(frames);
        const videoFramesPictTypes = this._pulloutPictTypes(videoFrames);

        const currentGopPattern = findLongestRepeatedPattern(videoFramesPictTypes);

        if (!currentGopPattern) {
            throw new CannotFindGopPatternError('Can not find GOP pattern for these frames.', {
                videoFramesPictTypes,
                url: this._url
            });
        }

        if (this._prevUserGopPattern) {
            if (!_.isEqual(this._prevUserGopPattern, currentGopPattern)) {
                throw new GopPatternUnstableError('Somehow gop pattern for particular url has been changed.', {
                    prevUserGopPattern: this._prevUserGopPattern,
                    currentGopPattern : currentGopPattern,
                    url               : this._url
                });
            }
        } else {
            this._prevUserGopPattern = currentGopPattern.slice();
        }

        const gops    = this._splitInputByGopPattern(videoFrames, videoFramesPictTypes, currentGopPattern);
        const bitrate = this._calculateBitrate(gops);
        const fps     = this._calculateFps(gops);

        return {
            currentGopPattern,
            bitrate,
            fps
        };
    }

    _splitInputByGopPattern(frames, pictTypes, gopPattern) {
        let gopChunks = [];

        pictTypes  = pictTypes.join('');
        gopPattern = gopPattern.join('');

        let foundIndex = pictTypes.indexOf(gopPattern);
        while (foundIndex !== -1) {
            gopChunks.push(frames.slice(foundIndex, foundIndex + gopPattern.length));

            foundIndex = pictTypes.indexOf(gopPattern, foundIndex + gopPattern.length);
        }

        return gopChunks;
    }

    _calculateBitrate(gops) {
        let bitrates = [];

        gops.forEach(gop => {
            const gopBitrate = this._gopBitrate(gop);

            if (_.isNaN(gopBitrate)) {
                throw new BadGopDataError('Bitrate for this gop is NaN.', {gop});
            }

            bitrates.push(gopBitrate);
        });

        return {
            mean: _.mean(bitrates),
            min : Math.min.apply(null, bitrates),
            max : Math.max.apply(null, bitrates)
        };
    }

    _calculateFps(gops) {
        let fps = [];

        gops.forEach(gop => {
            const gopFps = this._gopFps(gop);

            if (_.isNaN(gopFps)) {
                throw new BadGopDataError('FPS for this gop is NaN.', {gop});
            }

            fps.push(gopFps);
        });

        return {
            mean: _.mean(fps),
            min : Math.min.apply(null, fps),
            max : Math.max.apply(null, fps)
        };
    }

    _gopBitrate(gop) {
        const accumulatedPktSize = gop.reduce((accumulator, frame) => {
            const pkt_size = _.isNumber(frame.pkt_size) ? frame.pkt_size : 0;

            return accumulator + pkt_size;
        }, 0);

        const accumulatedPktDuration = gop.reduce((accumulator, frame) => {
            const pkt_duration_time = _.isNumber(frame.pkt_duration_time) ? frame.pkt_duration_time : 0;

            return accumulator + pkt_duration_time;
        }, 0);

        return accumulatedPktDuration ? accumulatedPktSize / accumulatedPktDuration : NaN;
    }

    _gopFps(gop) {
        const accumulatedPktDuration = gop.reduce((accumulator, frame) => {
            const pkt_duration_time = _.isNumber(frame.pkt_duration_time) ? frame.pkt_duration_time : 0;

            return accumulator + pkt_duration_time;
        }, 0);

        return accumulatedPktDuration ? gop.length / accumulatedPktDuration : NaN;
    }

    _filterVideoFrames(frames) {
        return frames.filter(frame => frame.media_type === 'video');
    }

    _pulloutPictTypes(frames) {
        return frames.map(frame => frame.pict_type);
    }
}

module.exports = FramesInfo;

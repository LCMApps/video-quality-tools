'use strict';

const _ = require('lodash');

const Errors = require('src/Errors');

function processFrames(frames) {
    if (!Array.isArray(frames)) {
        throw new TypeError('process method is supposed to accept an array of frames.');
    }

    if (!_.every(frames, _.isPlainObject)) {
        throw new TypeError('process method is supposed to accept an array of plain object(frames).');
    }

    const videoFrames = processFrames.filterVideoFrames(frames);
    const gops        = processFrames.identifyGops(videoFrames);

    if (_.isEmpty(gops)) {
        return null;
    }

    const bitrate = processFrames.calculateBitrate(gops);
    const fps     = processFrames.calculateFps(gops);

    return {
        bitrate,
        fps
    };
}

processFrames.identifyGops           = identifyGops;
processFrames.splitInputByGopPattern = splitInputByGopPattern;
processFrames.calculateBitrate       = calculateBitrate;
processFrames.gopBitrate             = gopBitrate;
processFrames.calculateFps           = calculateFps;
processFrames.gopFps                 = gopFps;
processFrames.filterVideoFrames      = filterVideoFrames;

module.exports = processFrames;

function identifyGops(frames) {
    const setOfGops = [];
    let gop         = [];

    for (let i = 0; i < frames.length; i++) {
        if (frames[i].key_frame) {
            if (gop.length === 0) {
                gop.push(frames[i]);
            } else {
                setOfGops.push(gop);
                gop = [];
                i -= 1;
            }
        } else {
            if (gop.length > 0) {
                gop.push(frames[i]);
            }
        }
    }

    return setOfGops;
}

function splitInputByGopPattern(frames, pictTypes, gopPattern) {
    let gopChunks = [];

    const sPictTypes  = pictTypes.join('');
    const sGopPattern = gopPattern.join('');

    let foundIndex = sPictTypes.indexOf(sGopPattern);
    while (foundIndex !== -1) {
        gopChunks.push(frames.slice(foundIndex, foundIndex + sGopPattern.length));

        foundIndex = sPictTypes.indexOf(sGopPattern, foundIndex + sGopPattern.length);
    }

    return gopChunks;
}

function calculateBitrate(gops) {
    let bitrates = [];

    gops.forEach(gop => {
        const gopBitrate = processFrames.gopBitrate(gop);

        bitrates.push(gopBitrate);
    });

    return {
        mean: _.mean(bitrates),
        min : Math.min.apply(null, bitrates),
        max : Math.max.apply(null, bitrates)
    };
}

function gopBitrate(gop) {
    const accumulatedPktSize = gop.reduce((accumulator, frame) => {
        if (!_.isNumber(frame.pkt_size)) {
            throw new Errors.FrameInvalidData(
                `frame's pkt_size field has invalid type ${Object.prototype.toString.call(frame.pkt_size)}`,
                {frame}
            );
        }

        return accumulator + frame.pkt_size;
    }, 0);

    const accumulatedPktDuration = gop.reduce((accumulator, frame) => {
        if (!_.isNumber(frame.pkt_duration_time)) {
            throw new Errors.FrameInvalidData(
                `frame's pkt_duration_time field has invalid type ${Object.prototype.toString.call(frame.pkt_duration_time)}`, // eslint-disable-line
                {frame}
            );
        }

        return accumulator + frame.pkt_duration_time;
    }, 0);

    if (accumulatedPktDuration === 0) {
        throw new Errors.FrameInvalidData(
            "the sum of pkt_ducation_time fields === 0, so we can't devide by 0, thus can't calculate gop bitrate",
            {gop}
        );
    }

    return accumulatedPktSize / accumulatedPktDuration;
}

function calculateFps(gops) {
    let fps = [];

    gops.forEach(gop => {
        const gopFps = processFrames.gopFps(gop);

        fps.push(gopFps);
    });

    return {
        mean: _.mean(fps),
        min : Math.min.apply(null, fps),
        max : Math.max.apply(null, fps)
    };
}

function gopFps(gop) {
    const accumulatedPktDuration = gop.reduce((accumulator, frame) => {
        if (!_.isNumber(frame.pkt_duration_time)) {
            throw new Errors.FrameInvalidData(
                `frame's pkt_duration_time field has invalid type ${Object.prototype.toString.call(frame.pkt_duration_time)}`, // eslint-disable-line
                {frame}
            );
        }

        return accumulator + frame.pkt_duration_time;
    }, 0);

    if (accumulatedPktDuration === 0) {
        throw new Errors.FrameInvalidData(
            "the sum of pkt_ducation_time fields === 0, so we can't devide by 0, thus can't calculate gop bitrate",
            {gop}
        );
    }

    return gop.length / accumulatedPktDuration;
}

function filterVideoFrames(frames) {
    return frames.filter(frame => frame.media_type === 'video');
}

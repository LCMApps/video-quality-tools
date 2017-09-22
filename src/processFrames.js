'use strict';

const _ = require('lodash');

const Errors = require('./Errors');

function processFrames(frames) {
    if (!Array.isArray(frames)) {
        throw new TypeError('process method is supposed to accept an array of frames.');
    }

    const videoFrames            = processFrames.filterVideoFrames(frames);
    const {gops, remainedFrames} = processFrames.identifyGops(videoFrames);

    if (_.isEmpty(gops)) {
        throw new Errors.GopNotFoundError('Can not find any gop for these frames', {frames});
    }

    const areAllGopsIdentical = processFrames.areAllGopsIdentical(gops);
    const bitrate             = processFrames.calculateBitrate(gops);
    const fps                 = processFrames.calculateFps(gops);

    return {
        payload       : {
            areAllGopsIdentical,
            bitrate,
            fps
        },
        remainedFrames: remainedFrames
    };
}

processFrames.identifyGops        = identifyGops;
processFrames.calculateBitrate    = calculateBitrate;
processFrames.calculateFps        = calculateFps;
processFrames.filterVideoFrames   = filterVideoFrames;
processFrames.gopDurationInSec    = gopDurationInSec;
processFrames.toKbs               = toKbs;
processFrames.accumulatePktSize   = accumulatePktSize;
processFrames.areAllGopsIdentical = areAllGopsIdentical;

module.exports = processFrames;

function identifyGops(frames) {
    const GOP_TEMPLATE = {
        frames: []
    };

    const setOfGops = [];
    let newGop      = _.cloneDeep(GOP_TEMPLATE);

    for (let i = 0; i < frames.length; i++) {
        const currentFrame = frames[i];

        if (!_.isNumber(currentFrame.key_frame)) {
            throw new Errors.FrameInvalidData(
                `frame's key_frame field has invalid type: ${Object.prototype.toString.call(currentFrame.key_frame)}`,
                {frame: currentFrame}
            );
        }

        if (currentFrame.key_frame === 1) {
            if ('startTime' in newGop) {
                newGop.endTime = currentFrame.pkt_pts_time;
                setOfGops.push(newGop);
                newGop = _.cloneDeep(GOP_TEMPLATE);
                i -= 1;
            } else {
                newGop.frames.push(_.cloneDeep(currentFrame));

                newGop.startTime = currentFrame.pkt_pts_time;
            }
        } else if (currentFrame.key_frame === 0) {
            if (newGop.frames.length > 0) {
                newGop.frames.push(_.cloneDeep(frames[i]));
            }
        } else {
            throw new Errors.FrameInvalidData(
                `frame's key_frame field has invalid value: ${currentFrame.key_frame}. Must be 1 or 0.`,
                {frame: currentFrame}
            );
        }
    }

    // remainedFrames is a set of frames for which we didn't find gop
    // for example for this array of frames [1 0 0 0 1 0 0] the remainedFrames should be last three frames [1 0 0]
    // this is done in order not to lost part of the next gop and as a direct consequence - entire gop
    return {
        gops          : setOfGops,
        remainedFrames: newGop.frames
    };
}

function calculateBitrate(gops) {
    let bitrates = [];

    gops.forEach(gop => {
        const accumulatedPktSize = processFrames.accumulatePktSize(gop);
        const gopDurationInSec   = processFrames.gopDurationInSec(gop);

        const gopBitrate = processFrames.toKbs(accumulatedPktSize / gopDurationInSec);

        bitrates.push(gopBitrate);
    });

    return {
        mean: _.mean(bitrates),
        min : Math.min.apply(null, bitrates),
        max : Math.max.apply(null, bitrates)
    };
}

function accumulatePktSize(gop) {
    const accumulatedPktSize = gop.frames.reduce((accumulator, frame) => {
        if (!_.isNumber(frame.pkt_size)) {
            throw new Errors.FrameInvalidData(
                `frame's pkt_size field has invalid type ${Object.prototype.toString.call(frame.pkt_size)}`,
                {frame}
            );
        }

        return accumulator + frame.pkt_size;
    }, 0);

    return accumulatedPktSize;
}

function gopDurationInSec(gop) {
    if (!_.isNumber(gop.startTime)) {
        throw new Errors.GopInvalidData(
            `gops's start time has invalid type ${Object.prototype.toString.call(gop.startTime)}`,
            {gop}
        );
    }

    if (!_.isNumber(gop.endTime)) {
        throw new Errors.GopInvalidData(
            `gops's end time has invalid type ${Object.prototype.toString.call(gop.endTime)}`,
            {gop}
        );
    }

    // start time may be 0
    if (gop.startTime < 0) {
        throw new Errors.GopInvalidData(
            `gop's start time has invalid value ${gop.startTime}`,
            {gop}
        );
    }

    // end time must be positive
    if (gop.endTime <= 0) {
        throw new Errors.GopInvalidData(
            `gop's end time has invalid value ${gop.endTime}`,
            {gop}
        );
    }

    const diff = gop.endTime - gop.startTime;

    if (diff <= 0) {
        throw new Errors.GopInvalidData(
            `invalid difference between gop start and end time: ${diff}`,
            {gop}
        );
    }

    return diff;
}

function calculateFps(gops) {
    let fps = [];

    gops.forEach(gop => {
        const gopDurationInSec = processFrames.gopDurationInSec(gop);
        const gopFps           = gop.frames.length / gopDurationInSec;

        fps.push(gopFps);
    });

    return {
        mean: _.mean(fps),
        min : Math.min.apply(null, fps),
        max : Math.max.apply(null, fps)
    };
}

function areAllGopsIdentical(gops) {
    return gops.every(gop => _.isEqual(gops[0].frames.length, gop.frames.length));
}

function filterVideoFrames(frames) {
    return frames.filter(frame => frame.media_type === 'video');
}

function toKbs(val) {
    return val * 8 / 1024;
}

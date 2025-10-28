'use strict';

const _ = require('lodash');

const BaseFrame = require('./Frame/BaseFrame');
const Errors = require('./Errors');

const MSECS_IN_SEC = 1000;

const AR_CALCULATION_PRECISION = 0.01;

const SQUARE_AR_COEFFICIENT = 1;
const SQUARE_AR = '1:1';

const TRADITIONAL_TV_AR_COEFFICIENT = 1.333;
const TRADITIONAL_TV_AR = '4:3';

const HD_VIDEO_AR_COEFFICIENT = 1.777;
const HD_VIDEO_AR = '16:9';

const UNIVISIUM_AR_COEFFICIENT = 2;
const UNIVISIUM_AR = '18:9';

const WIDESCREEN_AR_COEFFICIENT = 2.33;
const WIDESCREEN_AR = '21:9';

/**
 * @typedef {import('./Frame/VideoFrameSchema1').VideoFrameSchema1} VideoFrameSchema1
 * @typedef {import('./Frame/VideoFrameSchema2').VideoFrameSchema2} VideoFrameSchema2
 */

function encoderStats(frames) {
    if (!Array.isArray(frames)) {
        throw new TypeError('Method accepts only an array of frames');
    }

    const videoFrames            = filterVideoFrames(frames);
    const {gops, remainedFrames} = identifyGops(videoFrames);

    if (_.isEmpty(gops)) {
        throw new Errors.GopNotFoundError('Can not find any gop for these frames', {frames});
    }

    let areAllGopsIdentical = true;
    const hasAudioStream = hasAudioFrames(frames);
    const baseGopSize = gops[0].frames.length;
    const bitrates = [];
    const fpsList = [];
    const gopDurations = [];

    gops.forEach(gop => {
        areAllGopsIdentical     = areAllGopsIdentical && baseGopSize === gop.frames.length;
        const calculatedPktSize = calculatePktSize(gop.frames);
        const gopDuration       = gopDurationInSec(gop);

        const gopBitrate = toKbs(calculatedPktSize / gopDuration);
        bitrates.push(gopBitrate);

        const gopFps = gop.frames.length / gopDuration;
        fpsList.push(gopFps);

        gopDurations.push(gopDuration);
    });

    const bitrate = {
        mean: _.mean(bitrates),
        min : Math.min(...bitrates),
        max : Math.max(...bitrates)
    };

    const fps = {
        mean: _.mean(fpsList),
        min : Math.min(...fpsList),
        max : Math.max(...fpsList)
    };

    const gopDuration = {
        mean: _.mean(gopDurations),
        min: Math.min(...gopDurations),
        max: Math.max(...gopDurations)
    };

    let width;
    let height;
    const firstFrameInGop = gops[0].frames[0];
    if (isValueObjectFrame(firstFrameInGop)) {
        width = firstFrameInGop.getWidth();
        height = firstFrameInGop.getHeight();
    } else {
        width = firstFrameInGop.width;
        height = firstFrameInGop.height;
    }

    const displayAspectRatio = calculateDisplayAspectRatio(width, height);

    return {
        payload       : {
            areAllGopsIdentical,
            bitrate,
            fps,
            gopDuration,
            displayAspectRatio,
            width,
            height,
            hasAudioStream
        },
        remainedFrames: remainedFrames
    };
}

function networkStats(frames, durationInMsec) {
    if (!Array.isArray(frames)) {
        throw new TypeError('Method accepts only an array of frames');
    }

    if (!_.isInteger(durationInMsec) || durationInMsec <= 0) {
        throw new TypeError('Method accepts only a positive integer as duration');
    }

    const videoFrames = filterVideoFrames(frames);
    const audioFrames = filterAudioFrames(frames);

    const durationInSec = durationInMsec / MSECS_IN_SEC;

    return {
        videoFrameRate:  videoFrames.length / durationInSec,
        audioFrameRate:  audioFrames.length / durationInSec,
        videoBitrate: toKbs(calculatePktSize(videoFrames) / durationInSec),
        audioBitrate: toKbs(calculatePktSize(audioFrames) / durationInSec),
    };
}

function identifyGops(frames) {
    const GOP_TEMPLATE = {
        frames: []
    };

    const setOfGops = [];
    let newGop      = _.cloneDeep(GOP_TEMPLATE);

    for (let i = 0; i < frames.length; i++) {
        const currentFrame = frames[i];
        const isVOFrame = isValueObjectFrame(currentFrame);

        const keyFrame = getKeyFrameOrThrowOnNull(currentFrame, isVOFrame);
        const ptsTime = getPtsTimeOrThrowOnNull(currentFrame, isVOFrame);

        if (keyFrame === 1) {
            if ('startTime' in newGop) {
                newGop.endTime = ptsTime;
                setOfGops.push(newGop);
                newGop = _.cloneDeep(GOP_TEMPLATE);
                i -= 1;
            } else {
                if (isVOFrame) {
                    newGop.frames.push(currentFrame);
                } else {
                    newGop.frames.push(_.cloneDeep(currentFrame));
                }

                newGop.startTime = ptsTime;
            }
        } else if (keyFrame === 0) {
            if (newGop.frames.length > 0) {
                if (isVOFrame) {
                    newGop.frames.push(frames[i]);
                } else {
                    newGop.frames.push(_.cloneDeep(frames[i]));
                }
            }
        } else {
            throw new Errors.FrameInvalidData(
                `frame's key_frame field has invalid value: ${keyFrame}. Must be 1 or 0.`,
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
        const calculatedPktSize = calculatePktSize(gop.frames);
        const durationInSec     = gopDurationInSec(gop);

        const gopBitrate = toKbs(calculatedPktSize / durationInSec);

        bitrates.push(gopBitrate);
    });

    return {
        mean: _.mean(bitrates),
        min : Math.min.apply(null, bitrates),
        max : Math.max.apply(null, bitrates)
    };
}

function calculatePktSize(frames) {
    const accumulatedPktSize = frames.reduce((accumulator, frame) => {
        return accumulator + getPktSizeOrThrowOnNull(frame, isValueObjectFrame(frame));
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
        const durationInSec    = gopDurationInSec(gop);
        const gopFps           = gop.frames.length / durationInSec;

        fps.push(gopFps);
    });

    return {
        mean: _.mean(fps),
        min : Math.min.apply(null, fps),
        max : Math.max.apply(null, fps)
    };
}

function calculateGopDuration(gops) {
    const gopsDurations = [];

    gops.forEach(gop => {
        const durationInSec = gopDurationInSec(gop);

        gopsDurations.push(durationInSec);
    });

    return {
        mean: _.mean(gopsDurations),
        min: Math.min(...gopsDurations),
        max: Math.max(...gopsDurations)
    };
}

function calculateDisplayAspectRatio(width, height) {
    if (!_.isInteger(width) || width <= 0) {
        throw new TypeError('"width" must be a positive integer');
    }

    if (!_.isInteger(height) || height <= 0) {
        throw new TypeError('"height" must be a positive integer');
    }

    const arCoefficient = width / height;

    if (Math.abs(arCoefficient - SQUARE_AR_COEFFICIENT) <= AR_CALCULATION_PRECISION) {
        return SQUARE_AR;
    }

    if (Math.abs(arCoefficient - TRADITIONAL_TV_AR_COEFFICIENT) <= AR_CALCULATION_PRECISION) {
        return TRADITIONAL_TV_AR;
    }

    if (Math.abs(arCoefficient - HD_VIDEO_AR_COEFFICIENT) <= AR_CALCULATION_PRECISION) {
        return HD_VIDEO_AR;
    }

    if (Math.abs(arCoefficient - UNIVISIUM_AR_COEFFICIENT) <= AR_CALCULATION_PRECISION) {
        return UNIVISIUM_AR;
    }

    if (Math.abs(arCoefficient - WIDESCREEN_AR_COEFFICIENT) <= AR_CALCULATION_PRECISION) {
        return WIDESCREEN_AR;
    }

    const gcd = findGcd(width, height);

    return `${width / gcd}:${height / gcd}`;
}

function areAllGopsIdentical(gops) {
    return gops.every(gop => _.isEqual(gops[0].frames.length, gop.frames.length));
}

function filterVideoFrames(frames) {
    return frames.filter(frame => {
        return isValueObjectFrame(frame) ? frame.getMediaType() === 'video' : frame.media_type === 'video';
    });
}

function filterAudioFrames(frames) {
    return frames.filter(frame => {
        return isValueObjectFrame(frame) ? frame.getMediaType() === 'audio' : frame.media_type === 'audio';
    });
}

function hasAudioFrames(frames) {
    return frames.some(frame => {
        return isValueObjectFrame(frame) ? frame.getMediaType() === 'audio' : frame.media_type === 'audio';
    });
}

function toKbs(val) {
    return val * 8 / 1024;
}

function findGcd(a, b) {
    if (a === 0 && b === 0) {
        return 0;
    }

    if (b === 0) {
        return a;
    }

    return findGcd(b, a % b);
}

function isValueObjectFrame(frame) {
    return (frame instanceof BaseFrame);
}

function getKeyFrameOrThrowOnNull(currentFrame, isVOFrame) {
    if (isVOFrame) {
        const keyFrame = currentFrame.getKeyFrame();
        if (keyFrame === null) {
            throw new Errors.FrameInvalidData(
                'frame.getKeyFrame() is null, probably the value was absent during construction',
                {frame: currentFrame}
            );
        }

        return keyFrame;
    } else {
        const keyFrame = currentFrame.key_frame;
        if (!_.isNumber(keyFrame)) {
            throw new Errors.FrameInvalidData(
                "frame's key_frame field has invalid type: "
                + `${Object.prototype.toString.call(currentFrame.key_frame)}`,
                {frame: currentFrame}
            );
        }

        return keyFrame;
    }
}

function getPtsTimeOrThrowOnNull(currentFrame, isVOFrame) {
    if (isVOFrame) {
        let ptsTime;

        const schemaVersion = currentFrame.getSchemaVersion();
        if (schemaVersion === 1) {
            ptsTime = (/** @type {VideoFrameSchema1} */ (currentFrame)).getPktPtsTime();
        } else if (schemaVersion > 1) {
            // all schemas after VideoFrameSchema2 support getPtsTime()
            ptsTime = (/** @type {VideoFrameSchema2} */ (currentFrame)).getPtsTime();
        } else {
            throw new Errors.FrameInvalidData('Unknown schema for frame', {frame: currentFrame});
        }

        if (ptsTime === null) {
            throw new Errors.FrameInvalidData(
                'frame.getPtsTime() or frame.getPktPtsTime() is null, probably the value was absent during '
                + 'construction',
                {frame: currentFrame}
            );
        }

        return ptsTime;
    } else {
        const ptsTime = currentFrame.pkt_pts_time;
        if (!_.isNumber(ptsTime)) {
            throw new Errors.FrameInvalidData(
                "frame's pkt_pts_time field has invalid type: "
                + `${Object.prototype.toString.call(currentFrame.pkt_pts_time)}`,
                {frame: currentFrame}
            );
        }

        return ptsTime;
    }
}

function getPktSizeOrThrowOnNull(currentFrame, isVOFrame) {
    if (isVOFrame) {
        const pktSize = currentFrame.getPktSize();
        if (pktSize === null) {
            throw new Errors.FrameInvalidData(
                'frame.getPktSize() is null, probably the value was absent during construction',
                {frame: currentFrame}
            );
        }

        return pktSize;
    } else {
        if (!_.isNumber(currentFrame.pkt_size)) {
            throw new Errors.FrameInvalidData(
                `frame's pkt_size field has invalid type ${Object.prototype.toString.call(currentFrame.pkt_size)}`,
                {frame: currentFrame}
            );
        }

        return currentFrame.pkt_size;
    }
}

module.exports = {
    encoderStats,
    networkStats,
    identifyGops,
    calculateBitrate,
    calculateFps,
    calculateGopDuration,
    filterAudioFrames,
    filterVideoFrames,
    hasAudioFrames,
    gopDurationInSec,
    toKbs,
    calculatePktSize,
    areAllGopsIdentical,
    findGcd,
    calculateDisplayAspectRatio
};

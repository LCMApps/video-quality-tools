'use strict';

const FramesMonitor = require('./src/FramesMonitor');
const StreamsInfo = require('./src/StreamsInfo');
const RawFrameTransformer = require('./src/RawFrameTransformer');
const FftoolsLibVersions = require('./src/FftoolsLibVersions');
const buildFftoolLibVersionsObject = require('./src/buildFftoolLibVersionsObject');
const processFrames = require('./src/processFrames');
const ExitReasons = require('./src/ExitReasons');

const Errors = require('./src/Errors');

module.exports = {
    FramesMonitor,
    StreamsInfo,
    RawFrameTransformer,
    FftoolsLibVersions,
    processFrames,
    buildFftoolLibVersionsObject,
    ExitReasons,
    Errors
};

'use strict';

const DriftStatsProcessor = require('src/Processor/DriftStatsProcessor');
const FrameEnvelope = require('src/FrameEnvelope');

const VideoFrameSchema1 = require('src/Frame/VideoFrameSchema1');
const VideoFrameSchema2 = require('src/Frame/VideoFrameSchema2');
const VideoFrameSchema3 = require('src/Frame/VideoFrameSchema3');
const VideoFrameSchema4 = require('src/Frame/VideoFrameSchema4');

const AudioFrameSchema1 = require('src/Frame/AudioFrameSchema1');
const AudioFrameSchema2 = require('src/Frame/AudioFrameSchema2');
const AudioFrameSchema3 = require('src/Frame/AudioFrameSchema3');
const AudioFrameSchema4 = require('src/Frame/AudioFrameSchema4');

const durationInMs = 1000;

function createVideoFrameSchema1(streamIndex, pktPtsTime, pktDtsTime) {
    return new VideoFrameSchema1({
        media_type: 'video',
        stream_index: streamIndex,
        pkt_pts_time: pktPtsTime,
        pkt_dts_time: pktDtsTime,
        width: 1920,
        height: 1080
    });
}

function createVideoFrameSchema2(streamIndex, ptsTime, pktDtsTime) {
    return new VideoFrameSchema2({
        media_type: 'video',
        stream_index: streamIndex,
        pts_time: ptsTime,
        pkt_dts_time: pktDtsTime,
        width: 1920,
        height: 1080
    });
}

function createVideoFrameSchema3(streamIndex, ptsTime, pktDtsTime) {
    return new VideoFrameSchema3({
        media_type: 'video',
        stream_index: streamIndex,
        pts_time: ptsTime,
        pkt_dts_time: pktDtsTime,
        width: 1920,
        height: 1080
    });
}

function createVideoFrameSchema4(streamIndex, ptsTime, pktDtsTime) {
    return new VideoFrameSchema4({
        media_type: 'video',
        stream_index: streamIndex,
        pts_time: ptsTime,
        pkt_dts_time: pktDtsTime,
        width: 1920,
        height: 1080
    });
}

function createAudioFrameSchema1(streamIndex, pktPtsTime, pktDtsTime) {
    return new AudioFrameSchema1({
        media_type: 'audio',
        stream_index: streamIndex,
        pkt_pts_time: pktPtsTime,
        pkt_dts_time: pktDtsTime
    });
}

function createAudioFrameSchema2(streamIndex, ptsTime, pktDtsTime) {
    return new AudioFrameSchema2({
        media_type: 'audio',
        stream_index: streamIndex,
        pts_time: ptsTime,
        pkt_dts_time: pktDtsTime
    });
}

function createAudioFrameSchema3(streamIndex, ptsTime, pktDtsTime) {
    return new AudioFrameSchema3({
        media_type: 'audio',
        stream_index: streamIndex,
        pts_time: ptsTime,
        pkt_dts_time: pktDtsTime
    });
}

function createAudioFrameSchema4(streamIndex, ptsTime, pktDtsTime) {
    return new AudioFrameSchema4({
        media_type: 'audio',
        stream_index: streamIndex,
        pts_time: ptsTime,
        pkt_dts_time: pktDtsTime
    });
}

function createFrameEnvelope(frame, receivedAt) {
    return new FrameEnvelope(frame, receivedAt);
}

module.exports = {
    DriftStatsProcessor,
    FrameEnvelope,
    durationInMs,
    createVideoFrameSchema1,
    createVideoFrameSchema2,
    createVideoFrameSchema3,
    createVideoFrameSchema4,
    createAudioFrameSchema1,
    createAudioFrameSchema2,
    createAudioFrameSchema3,
    createAudioFrameSchema4,
    createFrameEnvelope
};


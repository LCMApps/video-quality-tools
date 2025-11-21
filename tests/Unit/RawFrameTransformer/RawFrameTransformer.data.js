'use strict';

const VideoFrameSchema1 = require('src/Frame/VideoFrameSchema1');
const VideoFrameSchema2 = require('src/Frame/VideoFrameSchema2');
const VideoFrameSchema3 = require('src/Frame/VideoFrameSchema3');
const VideoFrameSchema4 = require('src/Frame/VideoFrameSchema4');

const AudioFrameSchema1 = require('src/Frame/AudioFrameSchema1');
const AudioFrameSchema2 = require('src/Frame/AudioFrameSchema2');
const AudioFrameSchema3 = require('src/Frame/AudioFrameSchema3');
const AudioFrameSchema4 = require('src/Frame/AudioFrameSchema4');

const invalidFftoolLibVersionsTypes = [
    undefined,
    null,
    false,
    1,
    '1',
    {},
    [],
    Symbol(),
    () => {},
    Buffer.alloc(0)
];

const invalidMediaTypeScenarios = [
    {
        description: 'media_type is missing',
        rawFrame: {
            key_frame: 1,
            pkt_pts_time: 1.5,
            pkt_size: 1024
        },
        expectedError: 'rawFrame object must contain the field "media_type"'
    },
    {
        description: 'media_type is undefined',
        rawFrame: {
            media_type: undefined,
            key_frame: 1,
            pkt_pts_time: 1.5,
            pkt_size: 1024
        },
        expectedError: 'rawFrame object must contain the field "media_type"'
    },
    {
        description: 'media_type is invalid (subtitle)',
        rawFrame: {
            media_type: 'subtitle',
            key_frame: 1,
            pkt_pts_time: 1.5,
            pkt_size: 1024
        },
        expectedError: 'The value of "media_type" field of rawFrame must be either "audio" or "video"'
    },
    {
        description: 'media_type is empty string',
        rawFrame: {
            media_type: '',
            key_frame: 1,
            pkt_pts_time: 1.5,
            pkt_size: 1024
        },
        expectedError: 'The value of "media_type" field of rawFrame must be either "audio" or "video"'
    },
    {
        description: 'media_type is null',
        rawFrame: {
            media_type: null,
            key_frame: 1,
            pkt_pts_time: 1.5,
            pkt_size: 1024
        },
        expectedError: 'The value of "media_type" field of rawFrame must be either "audio" or "video"'
    },
    {
        description: 'media_type is number',
        rawFrame: {
            media_type: 123,
            key_frame: 1,
            pkt_pts_time: 1.5,
            pkt_size: 1024
        },
        expectedError: 'The value of "media_type" field of rawFrame must be either "audio" or "video"'
    }
];

const schemaVersionScenarios = [
    {
        description: 'libavutil < 57',
        libavutilVersion: '56.0.0',
        expectedVideoSchema: VideoFrameSchema1,
        expectedAudioSchema: AudioFrameSchema1
    },
    {
        description: 'libavutil >= 57 and < 58',
        libavutilVersion: '57.0.0',
        expectedVideoSchema: VideoFrameSchema2,
        expectedAudioSchema: AudioFrameSchema2
    },
    {
        description: 'libavutil >= 58 and < 59',
        libavutilVersion: '58.0.0',
        expectedVideoSchema: VideoFrameSchema3,
        expectedAudioSchema: AudioFrameSchema3
    },
    {
        description: 'libavutil >= 59 and < 61',
        libavutilVersion: '59.0.0',
        expectedVideoSchema: VideoFrameSchema4,
        expectedAudioSchema: AudioFrameSchema4
    },
    {
        description: 'libavutil = 60',
        libavutilVersion: '60.0.0',
        expectedVideoSchema: VideoFrameSchema4,
        expectedAudioSchema: AudioFrameSchema4
    }
];

module.exports = {
    invalidFftoolLibVersionsTypes,
    invalidMediaTypeScenarios,
    schemaVersionScenarios
};


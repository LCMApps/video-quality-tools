'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

const AudioFrameSchema1 = require('src/Frame/AudioFrameSchema1');
const VideoFrameSchema1 = require('src/Frame/VideoFrameSchema1');

describe('processFrames.filterAudioFrames - raw frame object', () => {

    it('must correct filter audio frames', () => {
        const expectedResult = [
            {media_type: 'audio', pkt_size: 1},
            {media_type: 'audio', pkt_size: 2}
        ];

        let frames = [
            {media_type: 'video', width: 1},
            {media_type: 'audio', pkt_size: 1},
            {media_type: 'video', width: 2},
            {media_type: 'audio', pkt_size: 2},
        ];

        const audioFrames = processFrames.filterAudioFrames(frames);

        assert.deepEqual(audioFrames, expectedResult);
    });

    it('must correct filter empty array of frames', () => {
        const expectedResult = [];

        const audioFrames = processFrames.filterAudioFrames([]);

        assert.deepEqual(audioFrames, expectedResult);
    });

});

describe('processFrames.filterAudioFrames - frame value objects', () => {

    it('must correct filter audio frames', () => {
        const expectedResult = [
            new AudioFrameSchema1({media_type: 'audio', pkt_size: 1}),
            new AudioFrameSchema1({media_type: 'audio', pkt_size: 2}),
        ];

        let frames = [
            new VideoFrameSchema1({media_type: 'video', width: 1}),
            new AudioFrameSchema1({media_type: 'audio', pkt_size: 1}),
            new AudioFrameSchema1({media_type: 'audio', pkt_size: 2}),
            new VideoFrameSchema1({media_type: 'video', width: 2}),
        ];

        const audioFrames = processFrames.filterAudioFrames(frames);

        assert.deepEqual(audioFrames, expectedResult);
    });

    it('must correct filter empty array of frames', () => {
        const expectedResult = [];

        const audioFrames = processFrames.filterAudioFrames([]);

        assert.deepEqual(audioFrames, expectedResult);
    });

});

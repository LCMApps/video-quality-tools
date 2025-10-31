'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

const AudioFrameSchema1 = require('src/Frame/AudioFrameSchema1');
const VideoFrameSchema1 = require('src/Frame/VideoFrameSchema1');

describe('processFrames.hasAudioFrames - raw frame object', () => {

    it('must detect the audio frames existence', () => {
        const expectedResult = true;

        const frames = [
            {media_type: 'video', width: 1},
            {media_type: 'audio'},
            {media_type: 'data'},
            {media_type: 'video', width: 2}
        ];

        const hasAudioFrames = processFrames.hasAudioFrames(frames);

        assert.deepEqual(hasAudioFrames, expectedResult);
    });

    it('must detect the audio frames absence', () => {
        const expectedResult = false;

        const frames = [
            {media_type: 'video', width: 1},
            {media_type: 'data'},
            {media_type: 'video', width: 2}
        ];

        const hasAudioFrames = processFrames.hasAudioFrames(frames);

        assert.deepEqual(hasAudioFrames, expectedResult);
    });

});

describe('processFrames.hasAudioFrames - frame value objects', () => {

    it('must detect the audio frames existence', () => {
        const expectedResult = true;

        let frames = [
            new VideoFrameSchema1({media_type: 'video', width: 1}),
            new AudioFrameSchema1({media_type: 'audio', pkt_size: 1}),
            new AudioFrameSchema1({media_type: 'audio', pkt_size: 2}),
            new VideoFrameSchema1({media_type: 'video', width: 2}),
        ];


        const hasAudioFrames = processFrames.hasAudioFrames(frames);

        assert.deepEqual(hasAudioFrames, expectedResult);
    });

    it('must detect the audio frames absence', () => {
        const expectedResult = false;

        let frames = [
            new VideoFrameSchema1({media_type: 'video', width: 1}),
            new VideoFrameSchema1({media_type: 'video', width: 2}),
        ];

        const hasAudioFrames = processFrames.hasAudioFrames(frames);

        assert.deepEqual(hasAudioFrames, expectedResult);
    });

});

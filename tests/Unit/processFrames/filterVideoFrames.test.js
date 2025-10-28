'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

const AudioFrameSchema1 = require('src/Frame/AudioFrameSchema1');
const VideoFrameSchema1 = require('src/Frame/VideoFrameSchema1');

describe('processFrames.filterVideoFrames - raw frame object', () => {

    it('must correct filter video frames', () => {
        const expectedResult = [
            {media_type: 'video', width: 1},
            {media_type: 'video', width: 2}
        ];

        let frames = [
            {media_type: 'video', width: 1},
            {media_type: 'audio'},
            {media_type: 'data'},
            {media_type: 'video', width: 2}
        ];

        const videoFrames = processFrames.filterVideoFrames(frames);

        assert.deepEqual(videoFrames, expectedResult);
    });

    it('must correct filter empty array of frames', () => {
        const expectedResult = [];

        const videoFrames = processFrames.filterVideoFrames([]);

        assert.deepEqual(videoFrames, expectedResult);
    });

});

describe('processFrames.filterVideoFrames - frame value objects', () => {

    it('must correct filter video frames', () => {
        const expectedResult = [
            new VideoFrameSchema1({media_type: 'video', width: 1}),
            new VideoFrameSchema1({media_type: 'video', width: 2}),
        ];

        let frames = [
            new VideoFrameSchema1({media_type: 'video', width: 1}),
            new AudioFrameSchema1({media_type: 'audio'}),
            new AudioFrameSchema1({media_type: 'audio'}),
            new VideoFrameSchema1({media_type: 'video', width: 2}),
        ];

        const videoFrames = processFrames.filterVideoFrames(frames);

        assert.deepEqual(videoFrames, expectedResult);
    });

    it('must correct filter empty array of frames', () => {
        const expectedResult = [];

        const videoFrames = processFrames.filterVideoFrames([]);

        assert.deepEqual(videoFrames, expectedResult);
    });

});

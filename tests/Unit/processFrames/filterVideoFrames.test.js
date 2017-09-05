'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

describe('processFrames.filterVideoFrames', () => {

    it('must corret filter video frames', () => {
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

    it('must corret filter empty array of frames', () => {
        const expectedResult = [];

        const videoFrames = processFrames.filterVideoFrames([]);

        assert.deepEqual(videoFrames, expectedResult);
    });

});

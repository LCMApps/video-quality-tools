'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

describe('processFrames.filterAudioFrames', () => {

    it('must corret filter audio frames', () => {
        const expectedResult = [
            {media_type: 'audio'}
        ];

        let frames = [
            {media_type: 'video', width: 1},
            {media_type: 'audio'},
            {media_type: 'data'},
            {media_type: 'video', width: 2}
        ];

        const videoFrames = processFrames.filterAudioFrames(frames);

        assert.deepEqual(videoFrames, expectedResult);
    });

    it('must corret filter empty array of frames', () => {
        const expectedResult = [];

        const videoFrames = processFrames.filterAudioFrames([]);

        assert.deepEqual(videoFrames, expectedResult);
    });

});

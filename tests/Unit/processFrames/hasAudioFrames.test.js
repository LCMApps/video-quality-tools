'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

describe('processFrames.hasAudioFrames', () => {

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

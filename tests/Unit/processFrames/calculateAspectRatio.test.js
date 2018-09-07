'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

describe('processFrames.calculateAspectRatio', () => {

    it('must correct calculate min, max and average aspectRatio for frame 640x480', () => {
        const expectedAspectRatio = '4:3';

        const width = 640;
        const height = 480;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.deepEqual(aspectRatio, expectedAspectRatio);
    });
    it('must correct calculate min, max and average aspectRatio for frame 854x480', () => {
        const expectedAspectRatio = '16:9';

        const width = 854;
        const height = 480;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.deepEqual(aspectRatio, expectedAspectRatio);
    });
    it('must correct calculate min, max and average aspectRatio for frame 1280x720', () => {
        const expectedAspectRatio = '16:9';

        const width = 1280;
        const height = 720;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.deepEqual(aspectRatio, expectedAspectRatio);
    });

});

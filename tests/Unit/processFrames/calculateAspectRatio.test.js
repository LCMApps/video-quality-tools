'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

describe('processFrames.calculateAspectRatio', () => {

    it('must correct calculate aspectRatio for frame 640x640', () => {
        const expectedAspectRatio = '1:1';

        const width = 640;
        const height = 640;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.strictEqual(aspectRatio, expectedAspectRatio);
    });

    it('must correct calculate aspectRatio for frame 640x480', () => {
        const expectedAspectRatio = '4:3';

        const width = 640;
        const height = 480;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.strictEqual(aspectRatio, expectedAspectRatio);
    });

    it('must correct calculate aspectRatio for frame 854x480', () => {
        const expectedAspectRatio = '16:9';

        const width = 854;
        const height = 480;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.strictEqual(aspectRatio, expectedAspectRatio);
    });

    it('must correct calculate aspectRatio for frame 1280x720', () => {
        const expectedAspectRatio = '16:9';

        const width = 1280;
        const height = 720;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.strictEqual(aspectRatio, expectedAspectRatio);
    });

    it('must correct calculate aspectRatio for frame 1440x720', () => {
        const expectedAspectRatio = '18:9';

        const width = 1440;
        const height = 720;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.strictEqual(aspectRatio, expectedAspectRatio);
    });

    it('must correct calculate aspectRatio for frame 1680x720', () => {
        const expectedAspectRatio = '21:9';

        const width = 1680;
        const height = 720;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.strictEqual(aspectRatio, expectedAspectRatio);
    });

    it('aspectRatio for frame with not default correlation', () => {
        const expectedAspectRatio = '1000:720';

        const width = 1000;
        const height = 720;

        const aspectRatio = processFrames.calculateAspectRatio(width, height);

        assert.strictEqual(aspectRatio, expectedAspectRatio);
    });
});

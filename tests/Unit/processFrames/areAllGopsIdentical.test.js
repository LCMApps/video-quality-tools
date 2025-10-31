'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

const VideoFrameSchema1 = require('src/Frame/VideoFrameSchema1');

describe('processFrames.areAllGopsIdentical - raw frame object', () => {

    it('must determine that all gops identical', () => {
        const gops = [
            {
                frames: [
                    {key_frame: 1, pict_type: 'I'},
                    {key_frame: 0, pict_type: 'I'}
                ]
            },
            {
                frames: [
                    {key_frame: 1, pict_type: 'I'},
                    {key_frame: 0, pict_type: 'P'}
                ]
            }
        ];

        const expectedAnswer = true;

        const res = processFrames.areAllGopsIdentical(gops);

        assert.strictEqual(res, expectedAnswer);
    });

    it('must determine that not all gops identical', () => {
        const gops = [
            {
                frames: [
                    {key_frame: 1, pict_type: 'I'},
                    {key_frame: 0, pict_type: 'I'},
                    {key_frame: 0, pict_type: 'P'}
                ]
            },
            {
                frames: [
                    {key_frame: 1, pict_type: 'I'},
                    {key_frame: 0, pict_type: 'P'}
                ]
            }
        ];

        const expectedAnswer = false;

        const res = processFrames.areAllGopsIdentical(gops);

        assert.strictEqual(res, expectedAnswer);
    });

});

describe('processFrames.areAllGopsIdentical - frame value objects', () => {

    it('must determine that all gops identical', () => {
        const gops = [
            {
                frames: [
                    new VideoFrameSchema1({media_type: 'video', key_frame: 1, pict_type: 'I'}),
                    new VideoFrameSchema1({media_type: 'video', key_frame: 0, pict_type: 'B'}),
                ]
            },
            {
                frames: [
                    new VideoFrameSchema1({media_type: 'video', key_frame: 1, pict_type: 'I'}),
                    new VideoFrameSchema1({media_type: 'video', key_frame: 0, pict_type: 'P'}),
                ]
            }
        ];

        const expectedAnswer = true;

        const res = processFrames.areAllGopsIdentical(gops);

        assert.strictEqual(res, expectedAnswer);
    });

    it('must determine that not all gops identical', () => {
        const gops = [
            {
                frames: [
                    new VideoFrameSchema1({media_type: 'video', key_frame: 1, pict_type: 'I'}),
                    new VideoFrameSchema1({media_type: 'video', key_frame: 0, pict_type: 'I'}),
                    new VideoFrameSchema1({media_type: 'video', key_frame: 0, pict_type: 'P'}),
                ]
            },
            {
                frames: [
                    new VideoFrameSchema1({media_type: 'video', key_frame: 1, pict_type: 'I'}),
                    new VideoFrameSchema1({media_type: 'video', key_frame: 0, pict_type: 'P'}),
                ]
            }
        ];

        const expectedAnswer = false;

        const res = processFrames.areAllGopsIdentical(gops);

        assert.strictEqual(res, expectedAnswer);
    });

});

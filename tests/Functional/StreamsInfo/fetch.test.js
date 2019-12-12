'use strict';

const path = require('path');

const {assert} = require('chai');
const getPort  = require('get-port');

const StreamsInfo        = require('src/StreamsInfo');
const {StreamsInfoError} = require('src/Errors');

const {startStream, stopStream} = require('../Helpers');

const testFile = path.join(__dirname, '../../inputs/test_IPPPP.mp4');

describe('StreamsInfo::fetch, fetch streams info from inactive stream', () => {

    let streamUrl;
    let streamsInfo;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        streamsInfo = new StreamsInfo({
            ffprobePath : process.env.FFPROBE,
            timeoutInMs: 1,
        }, streamUrl);
    });

    it('fetch streams info from inactive stream', async () => {
        try {
            await streamsInfo.fetch();

            assert.fail('fetch method must throw an error, why are you still here ?');
        } catch (err) {
            assert.instanceOf(err, StreamsInfoError);

            assert(err.message);
        }
    });

});

describe('StreamsInfo::fetch, fetch streams info from active stream', () => {

    let stream;
    let streamUrl;
    let streamsInfo;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        streamsInfo = new StreamsInfo({
            ffprobePath : process.env.FFPROBE,
            timeoutInMs: 1,
        }, streamUrl);

        stream = await startStream(testFile, streamUrl);
    });

    afterEach(async () => {
        await stopStream(stream);
    });

    it('fetch streams info from active stream', async () => {
        const info = await streamsInfo.fetch();

        assert.isObject(info);

        const {videos, audios} = info;

        assert.lengthOf(videos, 1);
        assert.lengthOf(audios, 1);

        assert.deepInclude(videos[0], {
            codec_name          : 'h264',
            codec_long_name     : 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
            profile             : 'Main',
            codec_type          : 'video',
            width               : 854,
            height              : 480,
            sample_aspect_ratio : '1280:1281',
            display_aspect_ratio: '16:9'
        });

        assert.deepInclude(audios[0], {
            codec_name     : 'aac',
            codec_long_name: 'AAC (Advanced Audio Coding)',
            profile        : 'LC',
            channels       : 6,
            channel_layout : '5.1',
            sample_rate    : '44100'
        });

        return Promise.resolve();
    });

});

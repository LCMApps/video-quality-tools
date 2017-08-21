'use strict';

const path    = require('path');
const {spawn} = require('child_process');

const {assert} = require('chai');

const getPort = require('get-port');

const StreamsInfo = require('src/StreamsInfo');

const {StreamsInfoError} = require('src/Errors');

assert(process.env.FFPROBE, 'Specify path for ffprobe via FFPROBE env var');
assert(process.env.FFMPEG, 'Specify path for ffmpeg via FFMPEG env var');

const {FFPROBE, FFMPEG} = process.env;
const testFile          = path.join(__dirname, '../../inputs/test_IPPPP.mp4');

describe('StreamsInfo::fetch, fetch streams info from inactive stream', () => {

    let streamUrl;
    let streamsInfo;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        streamsInfo = new StreamsInfo({
            ffprobePath : FFPROBE,
            timeoutInSec: 1,
        }, streamUrl);
    });

    it('fetch streams info from inactive stream', async function () {
        this.timeout(5 * 1000);

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

    let streamUrl;
    let streamsInfo;
    let ffmpeg;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        streamsInfo = new StreamsInfo({
            ffprobePath : FFPROBE,
            timeoutInSec: 1,
        }, streamUrl);

        let command = `${FFMPEG} -re -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamUrl}`.split(' ');

        ffmpeg = spawn(command[0], command.slice(1));
    });

    after(() => {
        ffmpeg.kill('SIGKILL');
    });

    it('fetch streams info from active stream', function (done) {
        this.timeout(5 * 1000);

        // we listen stderr cuz we rely on stderr banner output
        ffmpeg.stderr.once('data', async () => {
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
                bit_rate       : '64775'
            });

            done();
        });
    });

});

'use strict';

const path    = require('path');
const {spawn} = require('child_process');

const {assert} = require('chai');
const getPort  = require('get-port');

const FramesMonitor = require('src/FramesMonitor');
const FramesReducer = require('src/FramesReducer');
const processFrames = require('src/processFrames');

assert(process.env.FFPROBE, 'Specify path for ffprobe via FFPROBE env var');
assert(process.env.FFMPEG, 'Specify path for ffmpeg via FFMPEG env var');

const {FFPROBE, FFMPEG} = process.env;
const testFile          = path.join(__dirname, '../inputs/test_IPPPP.mp4');

const config = {
    ffprobePath : FFPROBE,
    timeoutInSec: 1
};

const bufferMaxLengthInBytes = 2 ** 20;

describe('processFrames functional tests', () => {

    let ffmpeg;
    let framesReducer;
    let framesMonitor;
    let streamUrl;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        let command = `${FFMPEG} -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamUrl}`.split(' ');

        ffmpeg        = spawn(command[0], command.slice(1));
        framesReducer = new FramesReducer({bufferMaxLengthInBytes});
        framesMonitor = new FramesMonitor(config, streamUrl, framesReducer);
    });

    after(() => {
        // at this stage ffmpeg process already finished
        // but for sure let's kill it
        ffmpeg.kill('SIGKILL');
    });

    it('must return correct frames info', done => {
        const frames = [];
        const delta  = 0.001;

        framesMonitor.on('stderr', chunk => {
            assert.isFalse(true, chunk);
        });

        framesMonitor.on('error', error => {
            assert.ifError(error);
        });

        framesMonitor.on('frame', frame => {
            frames.push(frame);
        });

        framesMonitor.on('exit', (code, signal) => {
            const expectedExitCode = 0;
            const expectedSignal   = null;

            const expectedMinFps  = 30.3030303030303;
            const expectedMaxFps  = 30.3030303030303;
            const expectedMeanFps = 30.303030303030187;

            const expectedMinBitrate  = 62.452651515151516;
            const expectedMaxBitrate  = 3713.5416666666665;
            const expectedMeanBitrate = 1028.3657550077044;

            assert.strictEqual(code, expectedExitCode);
            assert.strictEqual(signal, expectedSignal);

            const info = processFrames(frames);

            assert.approximately(info.fps.mean, expectedMeanFps, delta);
            assert.approximately(info.fps.min, expectedMinFps, delta);
            assert.approximately(info.fps.max, expectedMaxFps, delta);

            assert.approximately(info.bitrate.mean, expectedMeanBitrate, delta);
            assert.approximately(info.bitrate.min, expectedMinBitrate, delta);
            assert.approximately(info.bitrate.max, expectedMaxBitrate, delta);

            done();
        });

        // rely on ffmpeg stderr output after the start
        ffmpeg.stderr.once('data', data => {
            framesMonitor.listen();
        });
    });

});

'use strict';

const path    = require('path');
const {spawn} = require('child_process');

const {assert} = require('chai');
const getPort  = require('get-port');

const FramesMonitor = require('src/FramesMonitor');
const processFrames = require('src/processFrames');

assert(process.env.FFPROBE, 'Specify path for ffprobe via FFPROBE env var');
assert(process.env.FFMPEG, 'Specify path for ffmpeg via FFMPEG env var');

const {FFPROBE, FFMPEG} = process.env;

const testFileWithFixedGop = path.join(__dirname, '../inputs/test_IPPPP.mp4');
const testFileWithOpenGop  = path.join(__dirname, '../inputs/test_open_gop.mp4');

const bufferMaxLengthInBytes = 2 ** 20;

const config = {
    ffprobePath           : FFPROBE,
    timeoutInSec          : 1,
    bufferMaxLengthInBytes: bufferMaxLengthInBytes
};

describe('processFrames functional tests', () => {

    let ffmpeg;
    let framesMonitor;
    let streamUrl;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor(config, streamUrl);
    });

    afterEach(() => {
        // at this stage ffmpeg process already finished
        // but for sure let's kill it
        ffmpeg.kill('SIGKILL');
    });

    it('must return correct frames info for the stream with fixed gop', done => {
        let command = buildFfmpegCommand(testFileWithFixedGop, streamUrl);

        ffmpeg = spawn(command[0], command.slice(1));

        const frames = [];

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

            const expectedMinFps  = 29.940119760479035;
            const expectedMaxFps  = 30.120481927710856;
            const expectedMeanFps = 30.001259478184732;

            const expectedMinBitrate  = 61.70471556886227;
            const expectedMaxBitrate  = 3691.1709337349394;
            const expectedMeanBitrate = 1018.2511085012945;

            assert.strictEqual(code, expectedExitCode);
            assert.strictEqual(signal, expectedSignal);

            const info = processFrames(frames);

            assert.isTrue(info.areAllGopsIdentical);

            assert.strictEqual(info.fps.mean, expectedMeanFps);
            assert.strictEqual(info.fps.min, expectedMinFps);
            assert.strictEqual(info.fps.max, expectedMaxFps);

            assert.strictEqual(info.bitrate.mean, expectedMeanBitrate);
            assert.strictEqual(info.bitrate.min, expectedMinBitrate);
            assert.strictEqual(info.bitrate.max, expectedMaxBitrate);

            done();
        });

        // rely on ffmpeg stderr output after the start
        ffmpeg.stderr.once('data', () => {
            framesMonitor.listen();
        });
    });

    it('must return correct frames info for the stream with open gop', done => {
        let command = buildFfmpegCommand(testFileWithOpenGop, streamUrl);

        ffmpeg = spawn(command[0], command.slice(1));

        const frames = [];

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

            const expectedMinFps  = 29.98696219035202;
            const expectedMaxFps  = 30.000000000000004;
            const expectedMeanFps = 29.995654063450672;

            const expectedMinBitrate  = 824.3019153225807;
            const expectedMaxBitrate  = 1435.5312499999998;
            const expectedMeanBitrate = 1066.2038272718032;

            assert.strictEqual(code, expectedExitCode);
            assert.strictEqual(signal, expectedSignal);

            const info = processFrames(frames);

            assert.isFalse(info.areAllGopsIdentical);

            assert.strictEqual(info.fps.mean, expectedMeanFps);
            assert.strictEqual(info.fps.min, expectedMinFps);
            assert.strictEqual(info.fps.max, expectedMaxFps);

            assert.strictEqual(info.bitrate.mean, expectedMeanBitrate);
            assert.strictEqual(info.bitrate.min, expectedMinBitrate);
            assert.strictEqual(info.bitrate.max, expectedMaxBitrate);

            done();
        });

        // rely on ffmpeg stderr output after the start
        ffmpeg.stderr.once('data', () => {
            framesMonitor.listen();
        });
    });

});

function buildFfmpegCommand(testFile, streamUrl) {
    return `${FFMPEG} -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamUrl}`.split(' ');
}

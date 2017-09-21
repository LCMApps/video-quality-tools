'use strict';

const _       = require('lodash');
const path    = require('path');

const {assert} = require('chai');
const getPort  = require('get-port');

const FramesMonitor = require('src/FramesMonitor');
const processFrames = require('src/processFrames');

const {startStream} = require('./Helpers');

const testFileWithFixedGop = path.join(__dirname, '../inputs/test_IPPPP.mp4');
const testFileWithOpenGop  = path.join(__dirname, '../inputs/test_open_gop.mp4');

const bufferMaxLengthInBytes = 2 ** 20;

const config = {
    ffprobePath           : process.env.FFPROBE,
    timeoutInSec          : 1,
    bufferMaxLengthInBytes: bufferMaxLengthInBytes
};

describe('processFrames functional tests', () => {

    let framesMonitor;
    let streamUrl;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor(config, streamUrl);
    });

    it('must return correct frames info for the stream with fixed gop', async () => {
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

        await startStream(testFileWithFixedGop, streamUrl);

        framesMonitor.listen();

        return new Promise(resolve => {
            framesMonitor.on('exit', (code, signal) => {
                const expectedExitCode = 0;
                const expectedSignal   = null;

                const expectedMinFps  = 29.940119760479035;
                const expectedMaxFps  = 30.120481927710856;
                const expectedMeanFps = 30.001259478184732;

                const expectedMinBitrate  = 61.70471556886227;
                const expectedMaxBitrate  = 3691.1709337349394;
                const expectedMeanBitrate = 1018.2511085012945;

                const expectedRemainedFrames = [
                    {key_frame: 1, pict_type: 'I'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'}
                ];

                assert.strictEqual(code, expectedExitCode);
                assert.strictEqual(signal, expectedSignal);

                const {payload, remainedFrames} = processFrames(frames);

                assert.deepEqual(payload, {
                    areAllGopsIdentical: true,
                    fps                : {mean: expectedMeanFps, min: expectedMinFps, max: expectedMaxFps},
                    bitrate            : {mean: expectedMeanBitrate, min: expectedMinBitrate, max: expectedMaxBitrate}
                });

                assert.deepEqual(
                    remainedFrames.map(frame => _.pick(frame, ['key_frame', 'pict_type'])),
                    expectedRemainedFrames
                );

                resolve();
            });
        });
    });

    it('must return correct frames info for the stream with open gop', async () => {
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

        await startStream(testFileWithOpenGop, streamUrl);

        framesMonitor.listen();

        return new Promise(resolve => {
            framesMonitor.on('exit', (code, signal) => {
                const expectedExitCode = 0;
                const expectedSignal   = null;

                const expectedMinFps  = 29.98696219035202;
                const expectedMaxFps  = 30.000000000000004;
                const expectedMeanFps = 29.995654063450672;

                const expectedMinBitrate  = 824.3019153225807;
                const expectedMaxBitrate  = 1435.5312499999998;
                const expectedMeanBitrate = 1066.2038272718032;

                const expectedRemainedFrames = [
                    {key_frame: 1, pict_type: 'I'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'}
                ];

                assert.strictEqual(code, expectedExitCode);
                assert.strictEqual(signal, expectedSignal);

                const {payload, remainedFrames} = processFrames(frames);

                assert.deepEqual(payload, {
                    areAllGopsIdentical: false,
                    fps                : {mean: expectedMeanFps, min: expectedMinFps, max: expectedMaxFps},
                    bitrate            : {mean: expectedMeanBitrate, min: expectedMinBitrate, max: expectedMaxBitrate}
                });

                assert.deepEqual(
                    remainedFrames.map(frame => _.pick(frame, ['key_frame', 'pict_type'])),
                    expectedRemainedFrames
                );

                resolve();
            });
        });
    });

});

'use strict';

const _    = require('lodash');
const path = require('path');

const {assert} = require('chai');
const getPort  = require('get-port');

const FramesMonitor = require('src/FramesMonitor');
const processFrames = require('src/processFrames');
const ExitReasons   = require('src/ExitReasons');

const {startStream} = require('./Helpers');

const testFileWithFixedGop = path.join(__dirname, '../inputs/test_IPPPP.mp4');
const testFileWithOpenGop  = path.join(__dirname, '../inputs/test_open_gop.mp4');

const bufferMaxLengthInBytes      = 2 ** 20;
const errorLevel                  = 'fatal';
const exitProcessGuardTimeoutInMs = 2000;

const config = {
    ffprobePath                : process.env.FFPROBE,
    timeoutInSec               : 1,
    bufferMaxLengthInBytes     : bufferMaxLengthInBytes,
    errorLevel                 : errorLevel,
    exitProcessGuardTimeoutInMs: exitProcessGuardTimeoutInMs
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
        const expectedReturnCode = 0;
        const expectedWidth = 854;
        const expectedHeight = 480;
        const expectedAspectRatio = '16:9';
        const expectAudio = true;

        const frames = [];

        framesMonitor.on('error', error => {
            assert.ifError(error);
        });

        framesMonitor.on('frame', frame => {
            frames.push(frame);
        });

        await startStream(testFileWithFixedGop, streamUrl);

        framesMonitor.listen();

        return new Promise(resolve => {
            framesMonitor.on('exit', reason => {
                assert.instanceOf(reason, ExitReasons.NormalExit);
                assert.strictEqual(reason.payload.code, expectedReturnCode);

                const expectedMinFps  = 29.940119760479035;
                const expectedMaxFps  = 30.120481927710856;
                const expectedMeanFps = 30.001259478184732;

                const expectedMinBitrate  = 61.70471556886227;
                const expectedMaxBitrate  = 3691.1709337349394;
                const expectedMeanBitrate = 1018.2511085012945;

                const expectedMinGop  = 0.16599999999999993;
                const expectedMaxGop  = 0.16700000000000004;
                const expectedMeanGop = 0.16666101694915256;

                const expectedRemainedFrames = [
                    {key_frame: 1, pict_type: 'I'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'},
                    {key_frame: 0, pict_type: 'P'}
                ];

                const {payload, remainedFrames} = processFrames.encoderStats(frames);

                assert.deepEqual(payload, {
                    areAllGopsIdentical: true,
                    fps: {mean: expectedMeanFps, min: expectedMinFps, max: expectedMaxFps},
                    bitrate: {mean: expectedMeanBitrate, min: expectedMinBitrate, max: expectedMaxBitrate},
                    gopDuration: {mean: expectedMeanGop, min: expectedMinGop, max: expectedMaxGop},
                    displayAspectRatio: expectedAspectRatio,
                    height: expectedHeight,
                    width: expectedWidth,
                    hasAudioStream: expectAudio
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
        const expectedReturnCode = 0;
        const expectedWidth = 854;
        const expectedHeight = 480;
        const expectedAspectRatio = '16:9';
        const expectAudio = true;

        const frames = [];

        framesMonitor.on('error', error => {
            assert.ifError(error);
        });

        framesMonitor.on('frame', frame => {
            frames.push(frame);
        });

        await startStream(testFileWithOpenGop, streamUrl);

        framesMonitor.listen();

        return new Promise(resolve => {
            framesMonitor.on('exit', reason => {
                assert.instanceOf(reason, ExitReasons.NormalExit);
                assert.strictEqual(reason.payload.code, expectedReturnCode);

                const expectedMinFps  = 29.98696219035202;
                const expectedMaxFps  = 30.000000000000004;
                const expectedMeanFps = 29.995654063450672;

                const expectedMinBitrate  = 824.3019153225807;
                const expectedMaxBitrate  = 1435.5312499999998;
                const expectedMeanBitrate = 1066.2038272718032;

                const expectedMinGop  = 1.534;
                const expectedMaxGop  = 5.000000000000001;
                const expectedMeanGop = 3.2113333333333336;

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

                const {payload, remainedFrames} = processFrames.encoderStats(frames);

                assert.deepEqual(payload, {
                    areAllGopsIdentical: false,
                    fps: {mean: expectedMeanFps, min: expectedMinFps, max: expectedMaxFps},
                    bitrate: {mean: expectedMeanBitrate, min: expectedMinBitrate, max: expectedMaxBitrate},
                    gopDuration: {mean: expectedMeanGop, min: expectedMinGop, max: expectedMaxGop},
                    displayAspectRatio: expectedAspectRatio,
                    width: expectedWidth,
                    height: expectedHeight,
                    hasAudioStream: expectAudio
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

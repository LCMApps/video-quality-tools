'use strict';

const path = require('path');

const {assert} = require('chai');
const sinon    = require('sinon');
const getPort  = require('get-port');

const FramesMonitor = require('src/FramesMonitor');
const ExitReasons   = require('src/ExitReasons');

const {startStream, stopStream} = require('../Helpers');

const testFile = path.join(__dirname, '../../inputs/test_IPPPP.mp4');

const bufferMaxLengthInBytes      = 2 ** 20;
const errorLevel                  = 'error';
const exitProcessGuardTimeoutInMs = 2000;

describe('FramesMonitor::listen, fetch frames from inactive stream', () => {
    let streamUrl;
    let framesMonitor;

    let spyOnFrame;
    let spyOnStderr;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath                : process.env.FFPROBE,
            timeoutInMs               : 1,
            bufferMaxLengthInBytes     : bufferMaxLengthInBytes,
            errorLevel                 : errorLevel,
            exitProcessGuardTimeoutInMs: exitProcessGuardTimeoutInMs
        }, streamUrl);

        spyOnFrame  = sinon.spy();
        spyOnStderr = sinon.spy();
    });

    afterEach(() => {
        spyOnFrame.resetHistory();
        spyOnStderr.resetHistory();
    });

    it('must receive error cuz stream is inactive', done => {
        const expectedReturnCode = 1;

        framesMonitor.listen();

        framesMonitor.on('frame', spyOnFrame);

        framesMonitor.on('exit', reason => {
            assert.instanceOf(reason, ExitReasons.AbnormalExit);
            assert.strictEqual(reason.payload.code, expectedReturnCode);

            assert.isString(reason.payload.stderrOutput);
            assert.isNotEmpty(reason.payload.stderrOutput);

            assert.isTrue(spyOnFrame.notCalled);

            done();
        });
    });
});

describe('FramesMonitor::listen, fetch frames from active stream', () => {
    let streamUrl;
    let framesMonitor;

    let spyOnIFrame;
    let spyOnPFrame;
    let spyOnAudioFrame;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath                : process.env.FFPROBE,
            timeoutInMs               : 1,
            bufferMaxLengthInBytes     : bufferMaxLengthInBytes,
            errorLevel                 : errorLevel,
            exitProcessGuardTimeoutInMs: exitProcessGuardTimeoutInMs
        }, streamUrl);

        spyOnIFrame     = sinon.spy();
        spyOnPFrame     = sinon.spy();
        spyOnAudioFrame = sinon.spy();

        await startStream(testFile, streamUrl);
    });

    afterEach(() => {
        spyOnPFrame.resetHistory();
        spyOnIFrame.resetHistory();
        spyOnAudioFrame.resetHistory();
    });

    it('must receive all stream frames', done => {
        const expectedReturnCode = 0;

        const onFrame = {I: spyOnIFrame, P: spyOnPFrame};

        framesMonitor.listen();

        framesMonitor.on('frame', frame => {
            if (frame.media_type === 'audio') {
                spyOnAudioFrame();
            } else {
                onFrame[frame.pict_type]();
            }
        });

        framesMonitor.on('exit', reason => {
            try {
                assert.instanceOf(reason, ExitReasons.NormalExit);
                assert.strictEqual(reason.payload.code, expectedReturnCode);

                assert.isTrue(spyOnAudioFrame.called);

                assert.isTrue(spyOnIFrame.called);
                assert.isTrue(spyOnPFrame.called);

                done();
            } catch (err) {
                done(err);
            }
        });
    });
});

describe('FramesMonitor::listen, stop ffprobe process', () => {
    let stream;
    let streamUrl;
    let framesMonitor;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath                : process.env.FFPROBE,
            timeoutInMs               : 1,
            bufferMaxLengthInBytes     : bufferMaxLengthInBytes,
            errorLevel                 : errorLevel,
            exitProcessGuardTimeoutInMs: exitProcessGuardTimeoutInMs
        }, streamUrl);

        stream = await startStream(testFile, streamUrl);
    });

    afterEach(async () => {
        await stopStream(stream);
    });

    it('must exit with correct signal after kill', done => {
        const expectedReturnCode = null;
        const expectedSignal     = 'SIGTERM';

        framesMonitor.listen();

        framesMonitor.once('frame', async () => {
            const {code, signal} = await framesMonitor.stopListen();

            assert.strictEqual(code, expectedReturnCode);
            assert.strictEqual(signal, expectedSignal);

            done();
        });
    });
});

describe('FramesMonitor::listen, exit with correct code after stream has been finished', () => {
    let stream;
    let streamUrl;
    let framesMonitor;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath                : process.env.FFPROBE,
            timeoutInMs               : 1,
            bufferMaxLengthInBytes     : bufferMaxLengthInBytes,
            errorLevel                 : errorLevel,
            exitProcessGuardTimeoutInMs: exitProcessGuardTimeoutInMs
        }, streamUrl);

        stream = await startStream(testFile, streamUrl);
    });

    it('must exit with correct zero code after stream has been finished', done => {
        const expectedReturnCode = 0;

        framesMonitor.listen();

        framesMonitor.once('frame', () => {
            setTimeout(async () => {
                await stopStream(stream);
            }, 1000);
        });

        framesMonitor.on('exit', reason => {
            assert.instanceOf(reason, ExitReasons.NormalExit);
            assert.strictEqual(reason.payload.code, expectedReturnCode);

            done();
        });
    });
});

'use strict';

const path = require('path');

const {assert} = require('chai');
const sinon    = require('sinon');
const getPort  = require('get-port');

const FramesMonitor = require('src/FramesMonitor');

const {startStream, stopStream} = require('../Helpers');

const testFile = path.join(__dirname, '../../inputs/test_IPPPP.mp4');

const bufferMaxLengthInBytes = 2 ** 20;
const errorLevel             = 'error';

describe('FramesMonitor::listen, fetch frames from inactive stream', () => {
    let streamUrl;
    let framesMonitor;

    let spyOnFrame;
    let spyOnStderr;

    beforeEach(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath           : process.env.FFPROBE,
            timeoutInSec          : 1,
            bufferMaxLengthInBytes: bufferMaxLengthInBytes,
            errorLevel            : errorLevel
        }, streamUrl);

        spyOnFrame  = sinon.spy();
        spyOnStderr = sinon.spy();
    });

    afterEach(() => {
        spyOnFrame.reset();
        spyOnStderr.reset();
    });

    it('must receive error cuz stream is inactive', done => {
        const expectedReturnCode = 1;
        const expectedSignal     = null;

        framesMonitor.listen();

        framesMonitor.on('frame', spyOnFrame);
        framesMonitor.on('stderr', spyOnStderr);

        framesMonitor.on('exit', (code, signal) => {
            assert.strictEqual(code, expectedReturnCode);
            assert.strictEqual(signal, expectedSignal);

            assert.isTrue(spyOnFrame.notCalled);
            assert.isTrue(spyOnStderr.calledOnce);
            assert.isTrue(spyOnStderr.calledWithMatch({name: 'FramesMonitorError', extra: {url: streamUrl}}));

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
            ffprobePath           : process.env.FFPROBE,
            timeoutInSec          : 1,
            bufferMaxLengthInBytes: bufferMaxLengthInBytes,
            errorLevel            : errorLevel
        }, streamUrl);

        spyOnIFrame     = sinon.spy();
        spyOnPFrame     = sinon.spy();
        spyOnAudioFrame = sinon.spy();

        await startStream(testFile, streamUrl);
    });

    afterEach(() => {
        spyOnPFrame.reset();
        spyOnIFrame.reset();
        spyOnAudioFrame.reset();
    });

    it('must receive all stream frames', done => {
        const expectedReturnCode       = 0;
        const expectedSignal           = null;
        const expectedIFramesCount     = 60;
        const expectedPFramesCount     = 240;
        const expectedAudioFramesCount = 0;

        const onFrame = {I: spyOnIFrame, P: spyOnPFrame};

        framesMonitor.listen();

        framesMonitor.on('frame', frame => {
            if (frame.media_type === 'audio') {
                spyOnAudioFrame();
            } else {
                onFrame[frame.pict_type]();
            }
        });

        framesMonitor.on('exit', (code, signal) => {
            assert.strictEqual(code, expectedReturnCode);
            assert.strictEqual(signal, expectedSignal);

            assert.strictEqual(spyOnAudioFrame.callCount, expectedAudioFramesCount);

            assert.strictEqual(spyOnIFrame.callCount, expectedIFramesCount);
            assert.strictEqual(spyOnPFrame.callCount, expectedPFramesCount);

            done();
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
            ffprobePath           : process.env.FFPROBE,
            timeoutInSec          : 1,
            bufferMaxLengthInBytes: bufferMaxLengthInBytes,
            errorLevel            : errorLevel
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

        framesMonitor.once('frame', () => {
            framesMonitor.stopListen();
        });

        framesMonitor.on('exit', (code, signal) => {
            assert.strictEqual(code, expectedReturnCode);
            assert.strictEqual(signal, expectedSignal);

            done();
        });
    });

    it('must exit with correct specified signal', done => {
        const expectedReturnCode = null;
        const expectedSignal     = 'SIGKILL';

        framesMonitor.listen();

        framesMonitor.once('frame', () => {
            framesMonitor.stopListen(expectedSignal);
        });

        framesMonitor.on('exit', (code, signal) => {
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
            ffprobePath           : process.env.FFPROBE,
            timeoutInSec          : 1,
            bufferMaxLengthInBytes: bufferMaxLengthInBytes,
            errorLevel            : errorLevel
        }, streamUrl);

        stream = await startStream(testFile, streamUrl);
    });

    it('must exit with correct zero code after stream has been finished', done => {
        const expectedReturnCode = 0;
        const expectedSignal     = null;

        framesMonitor.listen();

        framesMonitor.once('frame', () => {
            setTimeout(async () => {
                await stopStream(stream);
            }, 1000);
        });

        framesMonitor.on('exit', (code, signal) => {
            assert.strictEqual(code, expectedReturnCode);
            assert.strictEqual(signal, expectedSignal);

            done();
        });
    });
});

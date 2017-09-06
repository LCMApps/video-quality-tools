'use strict';

const path    = require('path');
const {spawn} = require('child_process');

const {assert} = require('chai');
const sinon    = require('sinon');

const getPort = require('get-port');

const FramesMonitor = require('src/FramesMonitor');

assert(process.env.FFPROBE, 'Specify path for ffprobe via FFPROBE env var');
assert(process.env.FFMPEG, 'Specify path for ffmpeg via FFMPEG env var');

const {FFPROBE, FFMPEG} = process.env;
const testFile          = path.join(__dirname, '../../inputs/test_IPPPP.mp4');

describe('FramesMonitor::listen, fetch frames from inactive stream', () => {
    let streamUrl;
    let framesMonitor;

    let spyOnFrame;
    let spyOnStderr;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath : FFPROBE,
            timeoutInSec: 1,
        }, streamUrl);

        spyOnFrame  = sinon.spy();
        spyOnStderr = sinon.spy();
    });

    after(() => {
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
    let ffmpeg;
    let streamUrl;
    let framesMonitor;

    let spyOnIFrame;
    let spyOnPFrame;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath : FFPROBE,
            timeoutInSec: 1,
        }, streamUrl);

        spyOnIFrame = sinon.spy();
        spyOnPFrame = sinon.spy();

        let command = `${FFMPEG} -re -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamUrl}`.split(' ');

        ffmpeg = spawn(command[0], command.slice(1));
    });

    after(() => {
        spyOnPFrame.reset();
        spyOnIFrame.reset();

        // at this stage ffmpeg process should be stopped
        // but for sure let's kill it
        ffmpeg.kill('SIGKILL');
    });

    it('must receive all stream frames', function (done) {
        this.timeout(20 * 1000);

        const expectedReturnCode   = 0;
        const expectedSignal       = null;
        const expectedIFramesCount = 60;
        const expectedPFramesCount = 240;

        const onFrame = {I: spyOnIFrame, P: spyOnPFrame};

        ffmpeg.stderr.once('data', () => {

            framesMonitor.listen();

            framesMonitor.on('frame', frame => {
                onFrame[frame.pict_type]();
            });

            framesMonitor.on('exit', (code, signal) => {
                assert.strictEqual(code, expectedReturnCode);
                assert.strictEqual(signal, expectedSignal);

                assert.strictEqual(spyOnIFrame.callCount, expectedIFramesCount);
                assert.strictEqual(spyOnPFrame.callCount, expectedPFramesCount);

                done();
            });
        });
    });
});

describe('FramesMonitor::listen, stop ffprobe process', () => {
    let ffmpeg;
    let streamUrl;
    let framesMonitor;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath : FFPROBE,
            timeoutInSec: 1,
        }, streamUrl);

        let command = `${FFMPEG} -re -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamUrl}`.split(' ');

        ffmpeg = spawn(command[0], command.slice(1));
    });

    after(() => {
        // kill with SIGKILL for sure
        ffmpeg.kill('SIGKILL');
    });

    it('must exit with correct signal after kill', function (done) {
        const expectedReturnCode = null;
        const expectedSignal     = 'SIGTERM';

        ffmpeg.stderr.once('data', () => {

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

    });
});

describe('FramesMonitor::listen, exit with correct code after stream has been finished', () => {
    let ffmpeg;
    let streamUrl;
    let framesMonitor;

    before(async () => {
        const port = await getPort();

        streamUrl = `http://localhost:${port}`;

        framesMonitor = new FramesMonitor({
            ffprobePath : FFPROBE,
            timeoutInSec: 1,
        }, streamUrl);

        let command = `${FFMPEG} -re -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamUrl}`.split(' ');

        ffmpeg = spawn(command[0], command.slice(1));
    });

    after(() => {
        // at this stage ffmpeg process should be stopped
        // but for sure let's kill it
        ffmpeg.kill('SIGKILL');
    });

    it('must exit with correct zero code after stream has been finished', function (done) {
        this.timeout(5 * 1000);

        const expectedReturnCode = 0;
        const expectedSignal     = null;

        ffmpeg.stderr.once('data', () => {

            framesMonitor.listen();

            framesMonitor.once('frame', () => {
                setTimeout(() => {
                    ffmpeg.kill();
                }, 1000);
            });

            framesMonitor.on('exit', (code, signal) => {
                assert.strictEqual(code, expectedReturnCode);
                assert.strictEqual(signal, expectedSignal);

                done();
            });
        });

    });
});

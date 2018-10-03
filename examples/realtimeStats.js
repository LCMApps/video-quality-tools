const {FramesMonitor, processFrames} = require('../index');
// or
// const {processFrames} = require('video-quality-tools');
// if you use it outside this repo

const INTERVAL_TO_ANALYZE_FRAMES = 5000; // in milliseconds
const STREAM_URI = 'rtmp://host:port/path';

const framesMonitorOptions = {
    ffprobePath: '/usr/local/bin/ffprobe',
    timeoutInSec: 5,
    bufferMaxLengthInBytes: 100000,
    errorLevel: 'error',
    exitProcessGuardTimeoutInMs: 1000
};

const framesMonitor = new FramesMonitor(framesMonitorOptions, STREAM_URI);

let frames = [];

function firstVideoFrameListener(frame) {
    if (frame.media_type === 'video') {
        framesMonitor.removeListener('frame', firstVideoFrameListener);
        framesMonitor.on('frame', frameListener);
        startAnalysis();
    }
}

function frameListener(frame) {
    frames.push(frame);
}

function startAnalysis() {
    setInterval(() => {
        try {
            const info = processFrames.networkStats(frames, INTERVAL_TO_ANALYZE_FRAMES);

            console.log(info);

            frames = [];
        } catch (err) {
            // only if arguments are invalid
            console.log(err);
            process.exit(1);
        }
    }, INTERVAL_TO_ANALYZE_FRAMES);
}

// We listens first video frame to start processing. We do such thing to avoid incorrect stats for the first
// run of networkStats function after the first interval.
framesMonitor.on('frame', firstVideoFrameListener);

framesMonitor.on('exit', reason => {
    console.log('EXIT', reason);
    process.exit();
});

framesMonitor.listen();

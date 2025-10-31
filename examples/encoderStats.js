const {
    FramesMonitor,
    RawFrameTransformer,
    FftoolsLibVersions,
    processFrames,
    buildFftoolLibVersionsObject,
} = require('../index');
// or if you use it outside this repo
// const {
//     FramesMonitor,
//     RawFrameTransformer,
//     FftoolsLibVersions,
//     processFrames,
//     buildFftoolLibVersionsObject,
// } = require('video-quality-tools');

const os = require('os');

const AMOUNT_OF_FRAMES_TO_GATHER = 600;
const STREAM_URI = process.env.STREAM_URI ? process.env.STREAM_URI : 'rtmp://host:port/path';

const framesMonitorOptions = {
    ffprobePath: process.env.FFPROBE_PATH ? process.env.FFPROBE_PATH : '/usr/local/bin/ffprobe',
    timeoutInMs: 2000,
    bufferMaxLengthInBytes: 100000,
    errorLevel: 'error',
    exitProcessGuardTimeoutInMs: 1000,
    fullFrameInfo: true,
};

async function main() {
    console.log(`Detecting FFprobe lib versions of the binary ${framesMonitorOptions.ffprobePath}`);

    const fftoolLibVersions = await buildFftoolLibVersionsObject(framesMonitorOptions.ffprobePath);
    const libavutilVersion = fftoolLibVersions.getVersion(FftoolsLibVersions.LIBAVUTIL);
    console.log(`Detected libavutil version: ${libavutilVersion}`);

    const rawFrameTransformer = new RawFrameTransformer(fftoolLibVersions);

    const framesMonitor = new FramesMonitor(framesMonitorOptions, STREAM_URI);

    let frames = [];

    function firstVideoFrameListener(frame) {
        if (frame.media_type === 'video') {
            framesMonitor.removeListener('frame', firstVideoFrameListener);
            framesMonitor.on('frame', frameListener);
        }
    }

    function frameListener(frame) {
        const transformedFrame = rawFrameTransformer.transform(frame);
        frames.push(transformedFrame);

        if (AMOUNT_OF_FRAMES_TO_GATHER > frames.length) {
            return;
        }

        try {
            const info = processFrames.encoderStats(frames);
            frames = info.remainedFrames;
            console.log(info.payload);
        } catch (err) {
            // only if arguments are invalid
            console.log(err);
            process.exit(1);
        }
    }

    // We listens first video frame to start processing. We do such thing to avoid incorrect stats for the first
    // run of networkStats function after the first interval.
    framesMonitor.on('frame', firstVideoFrameListener);

    framesMonitor.on('exit', reason => {
        console.log('EXIT', reason);
        process.exit();
    });

    console.log(`Starting to monitor stream: ${STREAM_URI}`);
    console.log('Press Ctrl+C to stop...\n');
    framesMonitor.listen();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log(`${os.EOL}Stopping monitor...`);

        try {
            await framesMonitor.stopListen();
            console.log('Monitor stopped successfully');
        } catch (err) {
            console.error('Error stopping monitor:', err.message);
            process.exit(1);
        }
    });
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

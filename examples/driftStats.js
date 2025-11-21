const {
    FramesMonitor,
    RawFrameTransformer,
    FrameEnvelope,
    DriftStatsProcessor,
    FftoolsLibVersions,
    processFrames,
    buildFftoolLibVersionsObject,
} = require('../index');
// or if you use it outside this repo
// const {
//     FramesMonitor,
//     RawFrameTransformer,
//     FrameEnvelope,
//     DriftStatsProcessor,
//     FftoolsLibVersions,
//     processFrames,
//     buildFftoolLibVersionsObject,
// } = require('video-quality-tools');

const os = require('os');

const INTERVAL_TO_ANALYZE_FRAMES = 1000; // in milliseconds
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

    const driftStatsProcessor = new DriftStatsProcessor(INTERVAL_TO_ANALYZE_FRAMES);

    let frames = [];
    let intervalId;

    function firstVideoOrAudioFrameListener(frame) {
        if (frame.media_type === 'video' || frame.media_type === 'audio') {
            framesMonitor.removeListener('frame', firstVideoOrAudioFrameListener);
            framesMonitor.on('frame', frameListener);
            driftStatsProcessor.start();
            frameListener(frame);
            startAnalysis();
        }
    }

    function frameListener(frame) {
        const curDate = new Date();
        const transformedFrame = rawFrameTransformer.transform(frame);
        const frameEnvelope = new FrameEnvelope(transformedFrame, curDate);
        
        try {
            driftStatsProcessor.addFrameEnvelope(frameEnvelope);
        } catch (error) {
            console.error('Error adding frame envelope:', error);
        }
    }

    function printDriftStats(stats) {
        const timestamp = new Date().toISOString();
        
        for (const [mediaType, streams] of Object.entries(stats)) {
            for (const [streamIndex, drift] of Object.entries(streams)) {
                const formatValue = (val) => val !== null ? val.toFixed(6) : 'null';
                
                console.log(
                    `${timestamp} | ${mediaType} | stream=${streamIndex} | ` +
                    `pts: min=${formatValue(drift.pts.min)}s max=${formatValue(drift.pts.max)}s avg=${formatValue(drift.pts.avg)}s | ` +
                    `dts: min=${formatValue(drift.dts.min)}s max=${formatValue(drift.dts.max)}s avg=${formatValue(drift.dts.avg)}s | ` +
                    `frames=${drift.framesCount}`
                );
            }
        }
    }

    function startAnalysis() {
        driftStatsProcessor.on('stats', stats => {
            printDriftStats(stats);
        });

        driftStatsProcessor.on('error', error => {
            console.error('Error:', error);
        });
    }

    // We listens first video frame to start processing. We do such thing to avoid incorrect stats for the first
    // run of networkStats function after the first interval.
    framesMonitor.on('frame', firstVideoOrAudioFrameListener);

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
            driftStatsProcessor.stop();
            await framesMonitor.stopListen();
            console.log('Monitor stopped successfully');
        } catch (err) {
            console.error('Error stopping drift stats processor or monitor:', err.message);
            process.exit(1);
        }
    });
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

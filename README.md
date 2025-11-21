# Video Quality Tools module - helps to measure live stream characteristics by RTMP/HLS/DASH streams

Features:
* fetching live video stream on demand, displaying info on video/audio characteristics;
* monitoring live video streams in real time, running quality checks: fps and bitrate drops, GOP
structure changes and more.

`video-quality-tools` requires `ffmpeg` and `ffprobe`. 

[![NPM version](https://img.shields.io/npm/v/video-quality-tools.svg)](https://www.npmjs.com/package/video-quality-tools)
[![Release Status](https://github.com/LCMApps/video-quality-tools/workflows/NPM%20Release/badge.svg)](https://github.com/LCMApps/video-quality-tools/releases)
[![Build Status](https://travis-ci.org/LCMApps/video-quality-tools.svg?branch=master)](https://travis-ci.org/LCMApps/video-quality-tools)
[![Coverage Status](https://coveralls.io/repos/github/LCMApps/video-quality-tools/badge.svg?branch=master)](https://coveralls.io/github/LCMApps/video-quality-tools?branch=master)

# <a name="installation"></a>Installation

Using npm:
```shell
$ npm install --save video-quality-tools
```

Using yarn:
```shell
$ yarn add video-quality-tools
```

# <a name="basic-concepts">Basic Concepts

## Error Handling

There are a lot of methods in module that may throw an error. All errors are subclasses of a basic javascript `Error`
object and may be distinguished by prototype. To do this, just import the `Error` object from the module.

```javascript
const {Errors} = require('video-quality-tools');
```

`Errors` object contains a set of error classes that may be thrown.

For example: `StreamInfo` constructor throws `Errors.ConfigError` for incorrect options.

```javascript
const {StreamsInfo, Errors} = require('video-quality-tools');

try {
    const streamsInfo = new StreamsInfo(null, 'rtmp://host:port/appInstance/name');
} catch (err) {
    if (err instanceof Errors.ConfigError) {
        console.error('Invalid options:', err);
    }
}
```

## Exit Reasons

`StreamsInfo` and `FramesMonitor` use `ffprobe` to fetch the data. The underlying ffprobe process may be killed
by someone, it may fail due to `spawn` issues, it may exit normally or with error code or it may be killed by the module
itself if frames have invalid format.

To distinguish exit reasons you may import `ExitReasons` object.

```javascript
const {ExitReasons} = require('video-quality-tools');
```

There are such available classes:

* `ExitReasons.StartError`
* `ExitReasons.ExternalSignal`
* `ExitReasons.NormalExit`
* `ExitReasons.AbnormalExit`
* `ExitReasons.ProcessingError`

Description of a specific reason class may be found in further chapters.

# <a name="one-time-info"></a>One-time Live Stream Info

To fetch one-time info you need to create `StreamsInfo` class instance

```javascript
const {StreamsInfo} = require('video-quality-tools');

const streamsInfoOptions = {
    ffprobePath: '/usr/local/bin/ffprobe',
    timeoutInMs: 2000
};
const streamsInfo = new StreamsInfo(streamsInfoOptions, 'rtmp://host:port/appInstance/name');
```

Constructor throws:
* `Errors.ConfigError` if options have invalid type or value;
* `Errors.ExecutablePathError` if `options.ffprobePath` is not found or it's not an executable.

After that you may run `fetch` method to retrieve video and audio info. Method can be called as many times as you want.

```javascript
// async-await style
const streamInfo = await streamsInfo.fetch();

// or using old-school promise style

streamsInfo.fetch()
    .then(info => {
        console.log('Video info:');
        console.log(info.videos);
        console.log('Audio info:');
        console.log(info.audios);
    })
    .catch(err => console.error(err));
```

Method may throw the `Errors.StreamsInfoError` if it can't receive stream, stream is invalid, `ffprobe` exits
with error or returns unexpected output.

The `videos` and `audios` fields of the returned `info` object are arrays. Usually there is only one
video or audio stream for RTMP streams. Each element of the `videos` or `audios` array has almost the same
structure as the `ffprobe -show_streams` output has. You may find a typical output of `fetch` command below.

`videos` and `audios` may be an empty array if there are no appropriate streams in the live stream. 

```
{ videos:
   [ { index: 1,
       codec_name: 'h264',
       codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
       profile: 'Main',
       codec_type: 'video',
       codec_time_base: '33/2000',
       codec_tag_string: '[0][0][0][0]',
       codec_tag: '0x0000',
       width: 854,
       height: 480,
       coded_width: 854,
       coded_height: 480,
       has_b_frames: 0,
       sample_aspect_ratio: '1280:1281',
       display_aspect_ratio: '16:9',
       pix_fmt: 'yuv420p',
       level: 31,
       chroma_location: 'left',
       field_order: 'progressive',
       refs: 1,
       is_avc: 'true',
       nal_length_size: '4',
       r_frame_rate: '30/1',
       avg_frame_rate: '1000/33',
       time_base: '1/1000',
       start_pts: 2062046,
       start_time: '2062.046000',
       bits_per_raw_sample: '8',
       disposition: [Object] } ],
  audios:
   [ { index: 0,
       codec_name: 'aac',
       codec_long_name: 'AAC (Advanced Audio Coding)',
       profile: 'LC',
       codec_type: 'audio',
       codec_time_base: '1/44100',
       codec_tag_string: '[0][0][0][0]',
       codec_tag: '0x0000',
       sample_fmt: 'fltp',
       sample_rate: '44100',
       channels: 2,
       channel_layout: 'stereo',
       bits_per_sample: 0,
       r_frame_rate: '0/0',
       avg_frame_rate: '0/0',
       time_base: '1/1000',
       start_pts: 2061964,
       start_time: '2061.964000',
       disposition: [Object] } ] }
```

# <a name="ffmpeg-compatibility"></a>FFmpeg Version Compatibility

## Raw Frames (Default Behavior)

By default, `FramesMonitor` emits raw frame objects directly from ffprobe output. This approach works seamlessly with **FFmpeg <= 4.x** (`libavutil` <= 56).

Starting from **FFmpeg 5.x** (`libavutil` 57+), ffprobe changed some field names in frame output. If you're using FFmpeg 5.x or newer, you should use the `RawFrameTransformer` approach described below to ensure compatibility.

## Using `RawFrameTransformer` for FFmpeg 5.x+

For FFmpeg 5.x and newer versions, use `RawFrameTransformer` to automatically handle field name differences across FFmpeg versions.

### Basic Usage

```javascript
const {
    FramesMonitor,
    buildFftoolLibVersionsObject,
    RawFrameTransformer
} = require('video-quality-tools');

// Detect FFprobe version
const fftoolLibVersions = await buildFftoolLibVersionsObject('/usr/local/bin/ffprobe');

// Create transformer with detected version
const transformer = new RawFrameTransformer(fftoolLibVersions);

const framesMonitor = new FramesMonitor(options, 'rtmp://host:port/appInstance/name', {
    // other options, plus...
    fullFrameInfo: true  // Required for RawFrameTransformer
});

framesMonitor.on('frame', rawFrame => {
    // Transform raw frame to value object
    const frame = transformer.transform(rawFrame);
    
    // Use consistent API regardless of FFmpeg version
    console.log(frame.getMediaType());    // 'video' or 'audio'
    console.log(frame.getKeyFrame());     // 1 or 0
    console.log(frame.getPtsTime());      // presentation timestamp
    console.log(frame.getPktSize());      // packet size
    
    if (frame.getMediaType() === 'video') {
        console.log(frame.getWidth());    // frame width
        console.log(frame.getHeight());   // frame height
        console.log(frame.getPictType()); // 'I', 'P', or 'B'
    }
});

framesMonitor.listen();
```

### Detecting FFmpeg Version

The `buildFftoolLibVersionsObject` function automatically detects your FFmpeg/ffprobe version:

```javascript
const {buildFftoolLibVersionsObject, FftoolsLibVersions} = require('video-quality-tools');

// Detect version
const fftoolLibVersions = await buildFftoolLibVersionsObject('/usr/local/bin/ffprobe');

// Check specific library versions
const libavutilVersion = fftoolLibVersions.getVersion(FftoolsLibVersions.LIBAVUTIL);
console.log(`libavutil version: ${libavutilVersion}`);

// Compare versions
if (fftoolLibVersions.gte(FftoolsLibVersions.LIBAVUTIL, '58.0.0')) {
    console.log('FFmpeg 5.x or newer detected');
}
```

### Supported Versions

| FFmpeg Version | libavutil Version | Schema | Status |
|----------------|-------------------|--------|---------|
| FFmpeg 4.x | < 57 | Schema1 | ✅ Supported |
| FFmpeg 5.x | 57.x | Schema2 | ✅ Supported |
| FFmpeg 6.x | 58.x | Schema3 | ✅ Supported |
| FFmpeg 7.x-8.x | 59.x-60.x | Schema4 | ✅ Supported |

For detailed information about frame schema methods and API, see [Frame Schema API Reference](doc/FrameSchemaAPI.md).

### Working with processFrames Functions

The `processFrames` functions (like `encoderStats` and `networkStats`) support both raw frames and frame value objects.

> But raw frames are supported for `libavutil` <= 56, so value objects and RawFrameTransformer is only one recommended
option starting `video-quality-tools` version 4.0.0.

```javascript
const {processFrames, RawFrameTransformer, buildFftoolLibVersionsObject} = require('video-quality-tools');

const fftoolLibVersions = await buildFftoolLibVersionsObject('/usr/local/bin/ffprobe');
const transformer = new RawFrameTransformer(fftoolLibVersions);

let frames = [];

framesMonitor.on('frame', rawFrame => {
    // Transform to value object
    const frame = transformer.transform(rawFrame);
    frames.push(frame);
});

setInterval(() => {
    // processFrames works with both raw frames and value objects
    const stats = processFrames.networkStats(frames, 5000);
    console.log(stats);
    frames = [];
}, 5000);
```

For a complete working example, see [examples/rawFrameTransformer.js](examples/rawFrameTransformer.js).

# <a name="one-time-info"></a>Live Frames Monitor

To measure live stream info you need to create instance of `FramesMonitor` class

```javascript
const {FramesMonitor} = require('video-quality-tools');

const framesMonitorOptions = {
    ffprobePath: '/usr/local/bin/ffprobe',
    timeoutInMs: 2000,
    bufferMaxLengthInBytes: 100000,
    errorLevel: 'error',
    exitProcessGuardTimeoutInMs: 1000,
    analyzeDurationInMs: 9000
};

const framesMonitor = new FramesMonitor(framesMonitorOptions, 'rtmp://host:port/appInstance/name');
```

Constructor throws:
* `Errors.ConfigError` or `TypeError` if options have invalid type or value;
* `Errors.ExecutablePathError` if `options.ffprobePath` is not found or it's not an executable.

## Frames Monitor Config

The first argument of `FramesMonitor` must be an `options` object. All `options` object's fields are mandatory except `fullFrameInfo`:

* `ffprobePath` - string, path to ffprobe executable;
* `timeoutInMs` - integer, greater than 0, specifies the maximum time to wait for (network) read/write operations 
to complete;
* `bufferMaxLengthInBytes` - integer, greater than 0, specifies the buffer length for ffprobe frames. This setting
prevents from hanging and receiving incorrect data from the stream, usually 1-2 KB is enough;
* `errorLevel` - specifies log level for debugging purposes, must be equal to ffprobe's
[`-loglevel` option](https://www.ffmpeg.org/ffprobe.html#toc-Generic-options). May be one of the following
values: `trace`, `debug`, `verbose`, `info`, `warning`, `error`, `fatal`, `panic`, `quiet`. For most cases
`error` level is enough;
* `exitProcessGuardTimeoutInMs` - integer, greater than 0, specifies the amount of time after which the monitoring
process will be hard killed if the attempt of soft stop fails. When you try to stop a monitor with `stopListen()`
method the `FramesMonitor` sends `SIGTERM` signal to ffprobe process. ffprobe may ignore this signal (some versions
do it pretty often). If ffprobe doesn't exit after `exitProcessGuardTimeoutInMs` milliseconds, `FramesMonitor` sends
`SIGKILL` signal and forces underlying ffprobe process to exit.
* `analyzeDurationInMs` - integer, greater than 0, specifies the maximum analyzing time of the input.
* `fullFrameInfo` - (added in 4.0.0, **optional**) boolean, default: `false`. When set to `true`, retrieves all available frame fields 
from ffprobe. This is **required when using `RawFrameTransformer`** for FFmpeg 5.x+ compatibility. When `false`, only
retrieves a subset of fields (`pkt_size`, `pkt_pts_time`, `media_type`, `pict_type`, `key_frame`, `width`, `height`).

## Listening of Frames

After creation of the `FramesMonitor` instance, you may start listening live stream data. To do so, just
run `framesMonitor.listen()` method. After that `framesMonitor` starts emitting `frame` event as soon as ffprobe
decodes frame from the stream. It emits video and audio frames.

```javascript
const {FramesMonitor, processFrames, ExitReasons} = require('video-quality-tools');

const framesMonitor = new FramesMonitor(options, 'rtmp://host:port/appInstance/name');

framesMonitor.on('frame', frameInfo => {
    console.log(frameInfo);
});

framesMonitor.listen();
```

`listen()` method doesn't return anything but may throw `Errors.AlreadyListeningError`.

## Stop Listening of Frames

To stop listening, call `framesMonitor.stopListen()` method. It returns promise. Rejection of that promise means
that the underlying ffprobe process can't be killed with a signal. Method tries to send `SIGTERM` signal first
and wait for `exitProcessGuardTimeoutInMs` milliseconds (ref. Frames Monitor Config section). If the
process doesn't exit after that timeout, method sends `SIGKILL` and forces it to exit. Resolved promise means that
the process was successfully killed.

```javascript
try {
    const {code, signal} = await framesMonitor.stopListen();
    console.log(`Monitor was stopped successfully, code=${code}, signal=${signal}`);
} catch (err) {
    // instance of Errors.ProcessExitError
    console.log(`Error listening url "${err.payload.url}": ${err.payload.error.message}`);
}
```

## `frame` event

This event is generated on each video and audio frame decoded by ffprobe.

When the option `fullFrameInfo` is not specified or set to `false`, data with a `frame`event will have the following
structure:

```
{ media_type: 'video',
  key_frame: 0,
  pkt_pts_time: 3530.279,
  pkt_size: 3332,
  width: 640,
  height: 480,
  pict_type: 'P' }
```
or
```
{ media_type: 'audio',
  key_frame: 1,
  pkt_pts_time: 'N/A',
  pkt_size: 20 }
```

With `fullFrameInfo` set to `true` all the fields provided by the `ffprobe` will be present.

Prior version 4.0.0 there wasn't `fullFrameInfo` option, and subset of fields was enough to calculate stats, but
starting from ffmpeg 5.0 (actually, from `libavutil 57`) `ffprobe` and `ffmpeg` started to rename fields, remove
deprecated. `video-quality-tools` stats calculation relies on frame field names, and package stopped working.

It's recommended to switch to version 4.0.0 and use `RawFrameTransfermer` with `fullFrameInfo` set to `true` to
make sure package works as expected. You may read details below.


## `exit` event

Underlying process may not start at all, it may fail after some time or it may be killed with signal. In such situations
`FramesMonitor` class instance emits `exit` event and passes one of the `ExitReasons` instances. Each instance has its
own reason-specific `payload` field. There is a list of reasons:

* `ExitReasons.StartError` - ffprobe can't be spawned, the error object is stored in `payload.error` field;
* `ExitReasons.NormalExit` - ffprobe has exited with code = 0, `payload.code` is provided;
* `ExitReasons.AbnormalExit` - ffprobe has exited with non-zero exit code, `payload.code` contains the exit code of
 the ffprobe process and `payload.stderrOutput` contains the last 5 lines from ffprobe's stderr output;
* `ExitReasons.ProcessingError` - monitor has detected a logical issue and forces ffprobe to exit, this exit reason
contains error object in `payload.error` field that may be either `Errors.ProcessStreamError` or `Errors.InvalidFrameError`;
* `ExitReasons.ExternalSignal` - ffprobe process was killed by someone or by another process with the signal, the
signal name can be found in `payload.signal` field;

```javascript
framesMonitor.on('exit', reason => {
    switch(reason.constructor) {
        case ExitReasons.AbnormalExit:
            assert(reason.payload.code);
            assert(reason.payload.stderrOutput); // stderrOutput may be empty
            break;
        case ExitReasons.NormalExit:
            assert(reason.payload.code);
            break;
        case ExitReasons.ExternalSignal:
            assert(reason.payload.signal);
            break;
        case ExitReasons.StartError:
            assert.instanceOf(reason.payload.error, Error);
            break;
        case ExitReasons.ProcessingError:
            assert.instanceOf(reason.payload.error, Error);
            break;
    }
});
```

## `error` event

May be emitted only once and only in case the `framesMonitor.stopListen()` method receives `error` event on
killing of an underlying ffprobe process. 

```javascript
framesMonitor.on('error', err => {
    // indicates error during the kill process
    // when ProcessingError occurs we may encounter that can not kill process
    // in this case this error event would be emitted
    
    assert.instanceOf(err, Error);
});
```

# Video Quality Info

`video-quality-tools` ships with functions that help determining live stream info based on the set of frames
collected from `FramesMonitor`:
- `processFrames.networkStats`
- `processFrames.encoderStats`
- `DriftStatsProcessor` - for monitoring PTS/DTS drift in real-time


## `processFrames.networkStats(frames, durationInMsec)`

Receives an array of `frames` collected for a given time interval `durationInMsec`.

This method doesn't analyze GOP structure and isn't dependant on fullness of GOP between runs. Method shows only
frame rate of audio and video streams received, bitrate of audio and video. Instead of `processFrames.networkStats`
this method allows to control quality of network link between sender and receiver (like RTMP server).

> Remember that this module must be located not far away from receiver server (that is under analysis). If link
between receiver and module affects delivery of RTMP packages this module indicates incorrect values. It's better
to run this module near the receiver.

```javascript
const {processFrames, RawFrameTransformer, buildFftoolLibVersionsObject} = require('video-quality-tools');

const INTERVAL_TO_ANALYZE_FRAMES = 5000; // in milliseconds

const fftoolLibVersions = await buildFftoolLibVersionsObject('/usr/local/bin/ffprobe');
const transformer = new RawFrameTransformer(fftoolLibVersions);

let frames = [];

framesMonitor.on('frame', frame => {
    // Transform to value object
    const frame = transformer.transform(rawFrame);
    frames.push(frame);
});

setInterval(() => {
    try {
        const info = processFrames.networkStats(frames, INTERVAL_TO_ANALYZE_FRAMES);
    
        console.log(info);

        frames = [];
    } catch(err) {
        // only if arguments are invalid
        console.log(err);
        process.exit(1);
    }
}, INTERVAL_TO_ANALYZE_FRAMES);
```

There is an output for the example above:

```
{
  videoFrameRate: 29,
  audioFrameRate: 50,
  videoBitrate: 1403.5421875,
  audioBitrate: 39.846875
}
```

Check [examples/networkStats.js](examples/networkStats.js) to see an example code.


## `processFrames.encoderStats(frames)`

It relies on [GOP structure](https://en.wikipedia.org/wiki/Group_of_pictures) of the stream.

The following example shows how to gather frames and pass them to the function that analyzes encoder statistic.

```javascript
const {processFrames} = require('video-quality-tools');

const AMOUNT_OF_FRAMES_TO_GATHER = 300;

let frames = [];

framesMonitor.on('frame', frame => {
    frames.push(frame);

    if (AMOUNT_OF_FRAMES_TO_GATHER > frames.length) {
        return;
    }

    try {
        const info = processFrames.encoderStats(frames);
        frames = info.remainedFrames;
    
        console.log(info.payload);
    } catch(err) {
        // processing error
        console.log(err);
        process.exit(1);
    }
});
```

There is an output for the example above:

```
{ areAllGopsIdentical: true,
  bitrate:
   { mean: 1494.9075520833333,
     min: 1440.27734375,
     max: 1525.95703125 },
  fps: { 
     mean: 30,
     min: 30, 
     max: 30 },
  gopDuration: {
     mean: 2,
     min: 1.9, 
     max: 2.1 },
  displayAspectRatio: '16:9',
  width: 1280,
  height: 720,
  hasAudioStream: true
}
```

In given example the frames are collected in `frames` array and than use `processFrames.encoderStats` function for
sets of 300 frames (`AMOUNT_OF_FRAMES_TO_GATHER`). The function searches the
[key frames](https://en.wikipedia.org/wiki/Video_compression_picture_types#Intra-coded_(I)_frames/slices_(key_frames))
and measures the distance between them.

It's impossible to detect GOP structure for a set of frames with only one key frame, so `processFrames.encoderStats`
returns back all passed frames as an array in `remainedFrames` field.

If there are more than 2 key frames, `processFrames.encoderStats` uses full GOPs to track fps and bitrate and returns
all frames back in the last GOP that was not finished. It's important to remember the `remainedFrames` output
and push a new frame to the `remainedFrames` array when it arrives.

For the full GOPs `processFrames.encoderStats` calculates min/max/mean values of bitrates (in kbit/s), framerates
and GOP duration (in seconds) and returns them in `payload` field. The result of the check for the similarity
of GOP structures for the collected GOPs is returned in `areAllGopsIdentical` field. Fields `width`, `height`
and `displayAspectRatio` are taken from data from first frame of the first collected GOP. Value of `hasAudioStream`
reflects presence of audio frames.

To calculate display aspect ratio method `processFrames::calculateDisplayAspectRatio` uses list of 
[video aspect ratio standards](https://en.wikipedia.org/wiki/Aspect_ratio_(image)) 
with approximation of frames width and height ratio. If ratio can't be found in list of known standards, even in delta
neighbourhood, then 
[GCD algorithm](https://en.wikipedia.org/wiki/Greatest_common_divisor) is used to simplify returned value.

`processFrames.encoderStats` may throw `Errors.GopNotFoundError`.

Also, you may extend the metrics. Check `src/processFrames.js` to find common functions.

## `DriftStatsProcessor` class

`DriftStatsProcessor` is a real-time processor that monitors PTS (Presentation Time Stamp) and DTS (Decoding Time Stamp) 
drift for video and audio streams. It helps detect timing issues in live streams by comparing the actual reception time 
of frames against their expected timestamps.

### How It Works

The processor calculates drift by measuring the difference between expected frame timing (based on PTS/DTS timestamps) 
and actual frame arrival times. This helps identify issues such as:

- Network jitter and congestion
- Encoder timing problems
- Stream interruptions and packet loss
- Clock synchronization issues between encoder and receiver

### Basic Usage

```javascript
const {DriftStatsProcessor, FrameEnvelope} = require('video-quality-tools');

// Create processor that emits stats every 1 second
const processor = new DriftStatsProcessor(1000);

processor.on('stats', stats => {
    // Process drift statistics for video and audio streams
    console.log(stats);
});

processor.start();

// Add frames wrapped in FrameEnvelope
framesMonitor.on('frame', rawFrame => {
    const frame = transformer.transform(rawFrame);
    const frameEnvelope = new FrameEnvelope(frame, new Date());
    processor.addFrameEnvelope(frameEnvelope);
});
```

For detailed API documentation, usage examples, and interpretation guide, see [DriftStatsProcessor API Reference](doc/DriftStatsProcessorAPI.md).

Check [examples/driftStats.js](examples/driftStats.js) for a complete working example.

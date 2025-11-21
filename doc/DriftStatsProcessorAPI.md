# DriftStatsProcessor API Reference

## Overview

`DriftStatsProcessor` is a real-time processor that monitors PTS (Presentation Time Stamp) and DTS (Decoding Time Stamp) 
drift for video and audio streams. It helps detect timing issues in live streams by comparing the actual reception time 
of frames against their expected timestamps.

## Understanding PTS/DTS Drift

In a perfectly stable stream, the time between receiving frames should match the difference between their PTS/DTS values. 
However, in real-world scenarios, several factors can cause drift:

- **Network jitter**: Variable network delays cause frames to arrive at inconsistent intervals
- **Encoder timing issues**: Problems with the encoder's clock or frame pacing
- **Stream interruptions**: Buffer underruns or packet loss can cause gaps in frame delivery
- **Clock skew**: Differences between the encoder's clock and the receiver's clock

The `DriftStatsProcessor` calculates drift by comparing two time deltas for each frame:
1. **Expected delta**: The difference between the frame's PTS/DTS and the first frame's PTS/DTS
2. **Actual delta**: The time elapsed between receiving the current frame and the first frame

**Drift = Actual delta - Expected delta**

- **Positive drift**: Frames are arriving slower than expected (network congestion, encoder slowdown)
- **Negative drift**: Frames are arriving faster than expected (unusual, may indicate timestamp issues)
- **Stable drift near zero**: Stream timing is healthy

## Constructor

```javascript
new DriftStatsProcessor(durationInMs)
```

**Parameters:**
- `durationInMs` (number): Interval duration in milliseconds for calculating and emitting stats. Must be a positive integer greater than 0.

**Throws:**
- `Errors.ConfigError` - If `durationInMs` is not a positive integer greater than 0.

**Example:**
```javascript
const {DriftStatsProcessor} = require('video-quality-tools');

// Calculate and emit stats every 1 second
const driftStatsProcessor = new DriftStatsProcessor(1000);
```

## Methods

### `start()`

Starts the processor and begins the periodic stats calculation cycle. Clears any internal state from previous sessions.

**Throws:**
- `ProcessorAlreadyStartedError` - If the processor is already started.

**Example:**
```javascript
driftStatsProcessor.start();
```

### `stop()`

Stops the processor and clears the interval timer. Multiple calls are safe and will not throw errors.

**Example:**
```javascript
driftStatsProcessor.stop();
```

### `addFrameEnvelope(frameEnvelope)`

Adds a frame envelope for processing. The processor must be started before frames can be added.

**Parameters:**
- `frameEnvelope` (FrameEnvelope): A `FrameEnvelope` instance containing a frame value object and its reception timestamp.

**Throws:**
- `ProcessorNotStartedError` - If the processor is not started.
- `TypeError` - If `frameEnvelope` is not an instance of `FrameEnvelope`.

**Note:** Frames with missing critical data (null `stream_index`, `pts_time`, or `dts_time`) will trigger an error event 
and the stream will be automatically ignored for future processing.

**Example:**
```javascript
const {FrameEnvelope} = require('video-quality-tools');

framesMonitor.on('frame', rawFrame => {
    const frame = transformer.transform(rawFrame);
    const frameEnvelope = new FrameEnvelope(frame, new Date());
    
    driftStatsProcessor.addFrameEnvelope(frameEnvelope);
});
```

### `isStarted()`

Returns whether the processor is currently started.

**Returns:** `boolean` - True if started, false otherwise.

**Example:**
```javascript
if (driftStatsProcessor.isStarted()) {
    console.log('Processor is running');
}
```

## Events

### `stats` event

Emitted at regular intervals (based on `durationInMs`) with drift statistics for all active streams.

**Event data structure:**

```javascript
{
  video: {
    0: {
      pts: { min: -0.001234, max: 0.002456, avg: 0.000456 },
      dts: { min: -0.001123, max: 0.002345, avg: 0.000345 },
      framesCount: 30
    },
    1: {
      pts: { min: -0.000123, max: 0.001234, avg: 0.000234 },
      dts: { min: -0.000112, max: 0.001123, avg: 0.000123 },
      framesCount: 30
    }
  },
  audio: {
    2: {
      pts: { min: -0.000567, max: 0.001789, avg: 0.000567 },
      dts: { min: -0.000556, max: 0.001678, avg: 0.000456 },
      framesCount: 50
    }
  }
}
```

**Fields:**
- `video`/`audio`: Media type object containing stream statistics
  - `[streamIndex]`: Statistics for a specific stream (indexed by stream number)
    - `pts`: PTS drift statistics in seconds
      - `min`: Minimum drift observed in the interval
      - `max`: Maximum drift observed in the interval
      - `avg`: Average drift in the interval
    - `dts`: DTS drift statistics in seconds (same structure as `pts`)
    - `framesCount`: Number of frames processed in this interval

**Note:** Values are in seconds. If no frames were received for a stream in the interval, all values will be `null` 
and `framesCount` will be 0.

**Example:**
```javascript
driftStatsProcessor.on('stats', stats => {
    console.log('Drift Statistics:');
    console.log(JSON.stringify(stats, null, 2));
    
    // Process video stream statistics
    if (stats.video) {
        for (const [streamIndex, drift] of Object.entries(stats.video)) {
            console.log(`Video stream ${streamIndex}:`);
            console.log(`  PTS drift: min=${drift.pts.min}s, max=${drift.pts.max}s, avg=${drift.pts.avg}s`);
            console.log(`  DTS drift: min=${drift.dts.min}s, max=${drift.dts.max}s, avg=${drift.dts.avg}s`);
            console.log(`  Frames processed: ${drift.framesCount}`);
        }
    }
});
```

### `error` event

Emitted when a frame with incomplete data is encountered. The stream will be automatically ignored going forward.

**Event data:**
- `error` (IncompleteFrameDataError): Error instance with details about the incomplete frame.
  - `error.payload.mediaType`: The media type ('video' or 'audio')
  - `error.payload.streamIndex`: The stream index (may be null)
  - `error.payload.missingField`: The name of the missing field ('stream_index', 'pts_time', or 'dts_time')

**Example:**
```javascript
driftStatsProcessor.on('error', error => {
    console.error('Stream error:', error.message);
    console.error('Media type:', error.payload.mediaType);
    console.error('Stream index:', error.payload.streamIndex);
    console.error('Missing field:', error.payload.missingField);
});
```

## Usage Example

```javascript
const {
    FramesMonitor,
    RawFrameTransformer,
    FrameEnvelope,
    DriftStatsProcessor,
    buildFftoolLibVersionsObject
} = require('video-quality-tools');

const INTERVAL_TO_ANALYZE_FRAMES = 1000; // Calculate stats every 1 second

async function main() {
    // Detect FFprobe version and create transformer
    const fftoolLibVersions = await buildFftoolLibVersionsObject('/usr/local/bin/ffprobe');
    const transformer = new RawFrameTransformer(fftoolLibVersions);

    // Create frames monitor
    const framesMonitor = new FramesMonitor({
        ffprobePath: '/usr/local/bin/ffprobe',
        timeoutInMs: 2000,
        bufferMaxLengthInBytes: 100000,
        errorLevel: 'error',
        exitProcessGuardTimeoutInMs: 1000,
        fullFrameInfo: true  // Required for DriftStatsProcessor
    }, 'rtmp://host:port/appInstance/name');

    // Create drift stats processor
    const driftStatsProcessor = new DriftStatsProcessor(INTERVAL_TO_ANALYZE_FRAMES);

    // Start the processor
    driftStatsProcessor.start();

    // Listen for frames and add them to the processor
    framesMonitor.on('frame', rawFrame => {
        // Transform raw frame to value object
        const frame = transformer.transform(rawFrame);
        
        // Wrap in FrameEnvelope with reception timestamp
        const frameEnvelope = new FrameEnvelope(frame, new Date());
        
        // Add to processor
        driftStatsProcessor.addFrameEnvelope(frameEnvelope);
    });

    // Listen for stats events
    driftStatsProcessor.on('stats', stats => {
        console.log('Drift Statistics:');
        console.log(JSON.stringify(stats, null, 2));
    });

    // Listen for error events
    driftStatsProcessor.on('error', error => {
        console.error('Stream error:', error.message);
        // This indicates frames with missing data (null stream_index, pts_time, or dts_time)
        // The processor will automatically ignore such streams going forward
    });

    // Start monitoring
    framesMonitor.listen();

    // When done, stop the processor
    // driftStatsProcessor.stop();
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
```

## Interpreting Results

### Healthy Stream

```javascript
{
  video: {
    0: {
      pts: { min: -0.001, max: 0.002, avg: 0.0001 },
      dts: { min: -0.001, max: 0.002, avg: 0.0001 },
      framesCount: 30
    }
  }
}
```
Small drift values (< 0.01s) with average near zero indicate a stable stream.

### Network Congestion

```javascript
{
  video: {
    0: {
      pts: { min: 0.050, max: 0.500, avg: 0.200 },
      dts: { min: 0.050, max: 0.500, avg: 0.200 },
      framesCount: 20
    }
  }
}
```
Consistently positive drift and increasing average indicate frames are arriving late due to network issues.

### Stream Interruption

```javascript
{
  video: {
    0: {
      pts: { min: 1.500, max: 3.000, avg: 2.100 },
      dts: { min: 1.500, max: 3.000, avg: 2.100 },
      framesCount: 15
    }
  }
}
```
Very large positive drift values indicate significant gaps in frame delivery.

## Using with `FrameEnvelope`

`FrameEnvelope` is a wrapper class that associates a frame value object with its reception timestamp:

```javascript
const {FrameEnvelope} = require('video-quality-tools');

// Create a frame envelope
const frameEnvelope = new FrameEnvelope(frameValueObject, new Date());

// Access the frame and timestamp
const frame = frameEnvelope.getFrame();
const receivedAt = frameEnvelope.getReceivedAt();
```

The reception timestamp is critical for drift calculations as it represents the exact moment when the frame was 
received by your application. This timestamp is compared against the frame's PTS/DTS values to detect timing drift.

## Complete Working Example

For a complete working example that demonstrates all features of `DriftStatsProcessor`, see [examples/driftStats.js](../examples/driftStats.js).

The example shows:
- Setting up the `FramesMonitor` with FFmpeg version detection
- Creating and configuring the `DriftStatsProcessor`
- Processing frames and handling events
- Formatting and displaying drift statistics
- Graceful shutdown handling


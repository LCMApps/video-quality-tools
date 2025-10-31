# Frame Schema API Reference

## Overview

Starting from FFmpeg 4.0, field names in ffprobe's frame output have changed across different versions. To handle these differences, `video-quality-tools` provides frame value object classes that adapt to different FFmpeg/libavutil versions.

## Supported FFmpeg Versions

| Schema Version | libavutil Version | Typical FFmpeg Version | Status |
|----------------|-------------------|------------------------|---------|
| Schema1 | < 57 | FFmpeg 4.x | Supported |
| Schema2 | 57.x | FFmpeg 5.x | Supported |
| Schema3 | 58.x | FFmpeg 6.x | Supported |
| Schema4 | 59.x - 60.x | FFmpeg 7.x - 8.x | Supported |

## Frame Classes

### Video Frame Classes

- `VideoFrameSchema1` - For FFmpeg 4.x (libavutil < 57)
- `VideoFrameSchema2` - For FFmpeg 5.x (libavutil 57.x)
- `VideoFrameSchema3` - For FFmpeg 6.x (libavutil 58.x)
- `VideoFrameSchema4` - For FFmpeg 7.x-8.x (libavutil 59.x-60.x)

### Audio Frame Classes

- `AudioFrameSchema1` - For FFmpeg 4.x (libavutil < 57)
- `AudioFrameSchema2` - For FFmpeg 5.x (libavutil 57.x)
- `AudioFrameSchema3` - For FFmpeg 6.x (libavutil 58.x)
- `AudioFrameSchema4` - For FFmpeg 7.x-8.x (libavutil 59.x-60.x)

## Common Methods (All Frame Classes)

All frame classes inherit from `BaseFrame` and provide these common methods:

### getSchemaVersion()
Returns the schema version number.
- **Returns**: `{number}` Schema version (1, 2, 3, or 4)

### getMediaType()
Returns the media type of the frame.
- **Returns**: `{string|null}` - `'video'` or `'audio'`, or `null` if not available

### getStreamIndex()
Returns the stream index.
- **Returns**: `{number|null}` - Stream index or `null`

### getKeyFrame()
Returns whether this is a key frame.
- **Returns**: `{number|null}` - `1` for key frame, `0` for non-key frame, or `null`

### getPktDts()
Returns packet DTS in timebase units.
- **Returns**: `{number|null}` - Packet DTS or `null`

### getPktDtsTime()
Returns packet DTS in seconds.
- **Returns**: `{number|null}` - Packet DTS time or `null`

### getBestEffortTimestamp()
Returns presentation timestamp in timebase units.
- **Returns**: `{number|null}` - Best effort timestamp or `null`

### getBestEffortTimestampTime()
Returns presentation timestamp in seconds.
- **Returns**: `{number|null}` - Best effort timestamp time or `null`

### getPktPos()
Returns byte position of the packet in the stream.
- **Returns**: `{number|null}` - Packet position or `null`

### getPktSize()
Returns packet size in bytes.
- **Returns**: `{number|null}` - Packet size or `null`


## Video Frame Specific Methods

All video frame classes inherit from `BaseVideoFrame` and provide these methods in addition to common methods:

### getWidth()
Returns frame width in pixels.
- **Returns**: `{number|null}` - Frame width or `null`

### getHeight()
Returns frame height in pixels.
- **Returns**: `{number|null}` - Frame height or `null`

### getPixFmt()
Returns pixel format.
- **Returns**: `{string|null}` - Pixel format (e.g., `'yuv420p'`, `'nv12'`) or `null`

### getSampleAspectRatio()
Returns sample aspect ratio.
- **Returns**: `{string|null}` - Sample aspect ratio (e.g., `'1:1'`, `'4:3'`) or `null`

### getPictType()
Returns picture type.
- **Returns**: `{string|null}` - Picture type (`'I'`, `'P'`, `'B'`) or `null`

### getInterlacedFrame()
Returns interlaced frame flag.
- **Returns**: `{number|null}` - `1` for interlaced, `0` for progressive, or `null`

### getTopFieldFirst()
Returns top-field-first flag.
- **Returns**: `{number|null}` - `1` for top-field-first, `0` otherwise, or `null`

### getRepeatPict()
Returns number of extra fields to display.
- **Returns**: `{number|null}` - Repeat picture count or `null`


## Audio Frame Specific Methods

All audio frame classes inherit from `BaseAudioFrame` and provide these methods in addition to common methods:

### getSampleFmt()
Returns sample format.
- **Returns**: `{string|null}` - Sample format (e.g., `'fltp'`, `'s16'`) or `null`

### getNbSamples()
Returns number of audio samples in the frame.
- **Returns**: `{number|null}` - Number of samples or `null`

### getChannels()
Returns number of audio channels.
- **Returns**: `{number|null}` - Channel count or `null`

### getChannelLayout()
Returns channel layout string.
- **Returns**: `{string|null}` - Channel layout (e.g., `'stereo'`, `'5.1'`, `'mono'`) or `null`


## Schema-Specific Timestamp Methods

Different schemas have different methods for accessing presentation timestamps due to FFmpeg/FFProbe field name changes:

### VideoFrameSchema1 / AudioFrameSchema1 (`libavutil 56.x`)

#### getPktPts()
Returns packet PTS in timebase units.
- **Returns**: `{number|null}` - Packet PTS or `null`

#### getPktPtsTime()
Returns packet PTS in seconds.
- **Returns**: `{number|null}` - Packet PTS time or `null`

#### getPktDuration()
Returns packet duration in timebase units.
- **Returns**: `{number|null}` - Packet duration or `null`

#### getPktDurationTime()
Returns packet duration in seconds.
- **Returns**: `{number|null}` - Packet duration time or `null`


### VideoFrameSchema1, additionally to mentioned above (`libavutil 56.x`)

### getCodedPictureNumber()
Returns coded picture number.
- **Returns**: `{number|null}` - Coded picture number or `null`

### getDisplayPictureNumber()
Returns display picture number.
- **Returns**: `{number|null}` - Display picture number or `null`


### VideoFrameSchema2 / AudioFrameSchema2 (`libavutil 57.x`)

#### getPts()
Returns PTS in timebase units.
- **Returns**: `{number|null}` - PTS or `null`

#### getPtsTime()
Returns PTS in seconds.
- **Returns**: `{number|null}` - PTS time or `null`

#### getPktDuration()
Returns packet duration in timebase units.
- **Returns**: `{number|null}` - Packet duration or `null`

#### getPktDurationTime()
Returns packet duration in seconds.
- **Returns**: `{number|null}` - Packet duration time or `null`

### VideoFrameSchema2, additionally to mentioned above (`libavutil 57.x`)

### getCodedPictureNumber()
Returns coded picture number.
- **Returns**: `{number|null}` - Coded picture number or `null`

### getDisplayPictureNumber()
Returns display picture number.
- **Returns**: `{number|null}` - Display picture number or `null`

**Note**: Schema2 (and higher) does not have `getPktPts()` and `getPktPtsTime()` methods as these fields were removed from `libavutil 57.x`.

### VideoFrameSchema3 / AudioFrameSchema3 (`libavutil 58.x`)

#### getPts()
Returns PTS in timebase units.
- **Returns**: `{number|null}` - PTS or `null`

#### getPtsTime()
Returns PTS in seconds.
- **Returns**: `{number|null}` - PTS time or `null`

#### getPktDuration()
Returns packet duration in timebase units.
- **Returns**: `{number|null}` - Packet duration or `null`

#### getPktDurationTime()
Returns packet duration in seconds.
- **Returns**: `{number|null}` - Packet duration time or `null`

#### getDuration()
Returns duration in timebase units.
- **Returns**: `{number|null}` - Duration or `null`

#### getDurationTime()
Returns duration in seconds.
- **Returns**: `{number|null}` - Duration time or `null`

### VideoFrameSchema3, additionally to mentioned above (`libavutil 58.x`)

### getCodedPictureNumber()
Returns coded picture number.
- **Returns**: `{number|null}` - Coded picture number or `null`

### getDisplayPictureNumber()
Returns display picture number.
- **Returns**: `{number|null}` - Display picture number or `null`

### VideoFrameSchema4 / AudioFrameSchema4 (`libavutil 59.x` and `libavutil 60.x`)

#### getPts()
Returns PTS in timebase units.
- **Returns**: `{number|null}` - PTS or `null`

#### getPtsTime()
Returns PTS in seconds.
- **Returns**: `{number|null}` - PTS time or `null`

#### getDuration()
Returns duration in timebase units.
- **Returns**: `{number|null}` - Duration or `null`

#### getDurationTime()
Returns duration in seconds.
- **Returns**: `{number|null}` - Duration time or `null`

**Note**: Schema4 does not have `getPktDuration()`, `getPktDurationTime()`, `getDurationTime()`
and `getDisplayPictureNumber()` methods as these fields were removed from `libavutil 59`.


## Usage Example

```javascript
const frame = new VideoFrameSchema2(rawFrameData);

// Common methods (available in all schemas)
console.log(frame.getMediaType());        // 'video'
console.log(frame.getKeyFrame());         // 1 or 0
console.log(frame.getPktSize());          // packet size in bytes

// Video-specific methods
console.log(frame.getWidth());            // 1920
console.log(frame.getHeight());           // 1080
console.log(frame.getPictType());         // 'I', 'P', or 'B'

// Schema-specific timestamp methods
console.log(frame.getPtsTime());          // presentation timestamp in seconds
console.log(frame.getPktDurationTime());  // packet duration in seconds
```

## See Also

- [README.md](../README.md) - Main documentation
- [RawFrameTransformer Usage](../README.md#raw-frame-transformer) - Automatic schema selection


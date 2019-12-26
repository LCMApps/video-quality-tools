# Changelog
### 3.0.0

- `timeoutInSec` option was changed to `timeoutInMs` in the `FrameMonitor` and in the `StreamInfo` class.

IMPROVEMENTS:

- Added new option `analyzeDurationInMs` that specifies the maximum analyzing time of the input 
[[GH-97](https://github.com/LCMApps/video-quality-tools/issues/97)]

BUG FIXES:

- Fixed lack of support of the `timeout` for a `non-librtmp` builds of `ffmpeg` 
[[GH-92](https://github.com/LCMApps/video-quality-tools/issues/92)]

### 2.0.0

IMPROVEMENTS:

- Function `processFrames` from the module with the same name actually does calculations of encoder statistic. To
improve naming it was renamed to `processFrames.encoderStats`
[[GH-10](https://github.com/LCMApps/video-quality-tools/issues/10)]
- `processFrames.accumulatePktSize` was renamed to `processFrames.calculatePktSize`
[[GH-17](https://github.com/LCMApps/video-quality-tools/issues/17)]
- New function `processFrames.networkStats` for analyzing network link quality and losses in realtime. Check the
README for more details.
[[GH-17](https://github.com/LCMApps/video-quality-tools/issues/17)]
- Example for the `processFrames.networkStats` at [examples/networkStats.js](examples/networkStats.js)
[[GH-17](https://github.com/LCMApps/video-quality-tools/issues/17)]
- Dependencies was bumped

BUG FIXES:

- Fix of functional tests (aspectRatio -> displayAspectRatio)
[[GH-12](https://github.com/LCMApps/video-quality-tools/pull/12)]
- ffprobe ran without `-fflags nobuffer` so `FramesMonitor` receives incorrect info at the time of first analysis.
Check [[GH-18](https://github.com/LCMApps/video-quality-tools/pull/18)] for more details.

### 1.1.0

- Added new fields `gopDuration`, `displayAspectRatio`, `width`, `height`, `hasAudioStream` to the result of
_processFrames_ execution
- Added new methods to _processFrames_: `calculateGopDuration`, `calculateDisplayAspectRatio`, `hasAudioFrames`
- `FramesMonitor` fetches video and audio frames from the stream now.
- Added `width` and `height` info to video frames.
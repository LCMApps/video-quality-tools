## video-quality-tools v1.1.0

* **processFrames**:
    
    Added new fields `gopDuration`, `aspectRatio`, `width`, `height`, `hasAudioStream` to the result of 
    _processFrames_ execution .
    
    Add new methods to _processFrames_: `calculateGopDuration`, `calculateAspectRatio`, `filterAudioFrames`.
    
* **FramesMonitor**

    FramesMonitor fetches video and audio frames from the stream now.
    
    Added `width` and `height` info to video frames.
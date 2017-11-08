# Video Quality Tools

## Installation

Execute ``yarn install``.

## Example

```javascript
const {FramesMonitor, StreamsInfo, processFrames, ExitReasons} = require('video-quality-tools');

const framesMonitor = new FramesMonitor(config, url);
const streamsInfo = new StreamsInfo(config, url);

framesMonitor.once('frame', async () => {
    try {
        const streams = await streamsInfo.fetch();
        this.emit('streams', streams);
    } catch (e) {
        // proccess error
    }
});

let frames = [];

framesMonitor.on('frame', frame => {
    this._frames.push(frame);

    if (amountOfFramesToProcess > frames.length) {
        return;
    }

    try {
        const info = processFrames(frames);
    
        this.emit('statistic', info);
    } catch(e) {
        // process error
    }

    frames = [];
});

framesMonitor.on('error', err => {
    // indicates error during the kill process
    // when ProcessingError occurs we may encounter that can not kill process
    // in this case this error event would be emitted
    
    assert.instanceOf(err, Error);
});

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

framesMonitor.listen();
framesMonitor.stopListen()
    .then(res => {
         // res {code, signal}
    })
    .catch(err => {
    });
```

## Tests

Execute ``yarn run tests`` or ``yarn run unit-tests`` or ``yarn run func-tests``.

## Other

See other usefull ``yarn run ...`` commands in ``package.json``.

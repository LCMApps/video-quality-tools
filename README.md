# Video Quality Tools

## Installation

Execute ``yarn run build`` and ``yarn run start``.

See other useful ``yarn run ...`` commands in ``package.json``.

## Example

```javascript
const framesMonitor = new FramesMonitor(config, url);
const streamsInfo = new StreamsInfo(config, url);
const framesInfo = new FramesInfo(url);
```

```javascript
framesMonitor.once('frame', async () => {
    try {
        const streams = await streamsInfo.fetch();
        this.emit('streams', streams);
    } catch (e) {
        // proccess error
    }
});
```

```javascript
let frames = [];

framesMonitor.on('frame', frame => {
    this._frames.push(frame);

    if (amountOfFramesToProcess > frames.length) {
        return;
    }

    try {
        const info = framesInfo.process(frames);
    
        this.emit('framesInfo', info);
    } catch(e) {
        // process error
    }

    frames = [];
});

framesMonitor.on('error', err => {
  // process error
  framesMonitor.stopListen();
});

framesMonitor.on('exit', (code, signal) => {
   // check return code or signal 
});

framesMonitor.listen();
```

## Tests

Execute ``yarn run tests`` or ``yarn run unit-tests`` or ``yarn run func-tests``.
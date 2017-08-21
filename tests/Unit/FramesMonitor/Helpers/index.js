const proxyquire = require('proxyquire');

const correctPath = '/correct/path';

const FramesMonitor = proxyquire('src/FramesMonitor', {
    fs: {
        accessSync(filePath) {
            if (filePath !== correctPath) {
                throw new Error('no such file or directory');
            }
        }
    }
});

const correctUrl = 'rtmp://localhost:1935/myapp/mystream';

module.exports = {
    correctPath,
    correctUrl,
    FramesMonitor
};

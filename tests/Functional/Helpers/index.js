'use strict';

const {assert} = require('chai');
const {spawn}  = require('child_process');

assert(process.env.FFPROBE, 'Specify path for ffprobe via FFPROBE env var');
assert(process.env.FFMPEG, 'Specify path for ffmpeg via FFMPEG env var');

function startStream(testFile, streamUrl) {
    let command = `${process.env.FFMPEG} -re -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamUrl}`.split(' '); // eslint-disable-line

    const ffmpeg = spawn(command[0], command.slice(1));

    return new Promise((resolve, reject) => {
        // we listen stderr cuz we rely on stderr banner output
        ffmpeg.stderr.once('data', () => {
            resolve(ffmpeg);
        });

        setTimeout(() => {
            reject('Can not run ffmpeg process');
        }, 5 * 1000);
    });
}

function stopStream(stream) {
    return new Promise((resolve, reject) => {
        stream.kill();

        stream.on('exit', (code, signal) => {
            if (signal === null || signal === 'SIGTERM') {
                return resolve({code, signal});
            }
            return reject(`cannot stop stream in correct way - code: ${code}, signal: ${signal}`);
        });

        setTimeout(() => {
            stream.kill('SIGKILL');
        }, 5 * 1000);
    });
}

module.exports = {
    startStream,
    stopStream
};

'use strict';

const _       = require('lodash');
const path    = require('path');
const {spawn} = require('child_process');

const {assert} = require('chai');

const StreamsInfo = require('StreamsInfo');

const {StreamsInfoError} = require('Errors');

describe('StreamsInfo::fetch functional', () => {

    const testFile  = path.join(__dirname, '../../inputs/test_IPPPP.mp4');
    const streamURL = 'http://localhost:8888';

    let streamsInfo = new StreamsInfo({
        ffprobePath:  process.env.FFPROBE_PATH,
        timeoutInSec: 1,
    }, streamURL);

    it('fetch streams info from inactive stream', function() {
        this.timeout(5 * 1000);

        return streamsInfo.fetch()
            .then(assert.isNotDefined)
            .catch(err => {
                assert.instanceOf(err, StreamsInfoError);

                assert(err.message);
            });
    });

    it('fetch streams info from active stream', function(done) {
        this.timeout(5 * 1000);

        let command  = `ffmpeg -re -i ${testFile} -vcodec copy -acodec copy -listen 1 -f flv ${streamURL}`.split(' ');
        const ffmpeg = spawn(command[0], command.slice(1));

        // we listen stderr cuz we rely on stderr banner output
        ffmpeg.stderr.once('data', async () => {
            const info = await streamsInfo.fetch();

            assert.isNotEmpty(info.videos);
            assert.isNotEmpty(info.audios);

            ffmpeg.kill();

            done();
        });
    });
});

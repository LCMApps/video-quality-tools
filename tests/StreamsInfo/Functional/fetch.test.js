'use strict';

const _       = require('lodash');
const path    = require('path');
const {spawn} = require('child_process');

const {assert} = require('chai');

const StreamsInfo = require('../../../StreamsInfo');

const {StreamsInfoError} = require('../../../Errors');

describe('StreamsInfo::fetch functional', () => {

    const testFile  = path.join(__dirname, '../../inputs/test_IPPPP.mp4');
    const streamURL = 'rtmp://localhost:1935/myapp/mystream';

    let streamsInfo = new StreamsInfo({
        ffprobePath:  process.env.FFPROBE_PATH,
        timeoutInSec: 1,
    }, streamURL);

    it('fetch streams info from inactive stream', () => {
        return streamsInfo.fetch()
            .then(assert.isNotDefined)
            .catch(err => {
                assert.instanceOf(err, StreamsInfoError);

                assert(_.includes(err.message, `RTMP_ReadPacket, failed to read RTMP packet header`));
            });
    });

    it('fetch streams info from active stream', done => {
        let command  = `ffmpeg -re -i ${testFile} -vcodec copy -acodec copy -f flv ${streamURL}`.split(' ');
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
'use strict';

const {assert} = require('chai');

const {StreamsInfoError} = require('Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./');

describe('StreamsInfo::_parseStreamsInfo', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    it('invalid, undefined input', () => {
        try {
            streamsInfo._parseStreamsInfo();
        } catch (error) {
            assert.instanceOf(error, StreamsInfoError);

            assert.equal(error.message, 'Unexpected token u in JSON at position 0');
            assert.equal(error.extra.url, correctUrl);

            assert.isDefined(error.extra.error);
        }
    });

    it('invalid, null input', () => {
        try {
            streamsInfo._parseStreamsInfo(null);
        } catch (error) {
            assert.instanceOf(error, StreamsInfoError);

            assert.equal(error.message, 'Cannot read property \'streams\' of null');
            assert.equal(error.extra.url, correctUrl);
        }
    });

    it('invalid, empty input', () => {
        assert.throws(() => {
            streamsInfo._parseStreamsInfo('{}')
        }, StreamsInfoError, `'streams' field should be an Array. Instead it has [object Undefined] type.`); // check extra
    });

    it('invalid, streams input object', () => {
        assert.throws(() => {
            streamsInfo._parseStreamsInfo('{ "streams": {} }')
        }, StreamsInfoError, `'streams' field should be an Array. Instead it has [object Object] type.`);
    });

    it('empty streams array', () => {
        const {videos, audios} = streamsInfo._parseStreamsInfo('{ "streams": [] }');

        assert.isArray(videos);
        assert.isArray(audios);

        assert.isEmpty(videos);
        assert.isEmpty(audios);
    });

    it('streams array with invalid codec_type', () => {
        const {videos, audios} = streamsInfo._parseStreamsInfo(
            `{ "streams": [
                 { "codec_type": "invalid" }
               ] 
            }`
        );

        assert.isArray(videos);
        assert.isArray(audios);

        assert.isEmpty(videos);
        assert.isEmpty(audios);
    });

    it('correct streams array with 1 audio and 1 video streams', () => {
        const {videos, audios} = streamsInfo._parseStreamsInfo(
            `{ "streams": [
                 { "codec_type": "video" },
                 { "codec_type": "audio" }
               ] 
            }`
        );

        assert.isArray(videos);
        assert.isArray(audios);

        assert.lengthOf(videos, 1);
        assert.lengthOf(audios, 1);
    });

    it('correct streams array with 2 audio and 2 video streams', () => {
        const {videos, audios} = streamsInfo._parseStreamsInfo(
            `{ "streams": [
                 { "codec_type": "video" },
                 { "codec_type": "video" },
                 { "codec_type": "audio" },
                 { "codec_type": "audio" }
               ] 
            }`
        );

        assert.isArray(videos);
        assert.isArray(audios);

        assert.lengthOf(videos, 2);
        assert.lengthOf(audios, 2);
    });

});

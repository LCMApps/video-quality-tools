'use strict';

const {assert} = require('chai');

const {
          correctPath,
          correctUrl,
          StreamsInfo
      } = require('./');

const {StreamsInfoError} = require('../../../Errors/');

describe('StreamsInfo::_parseStreamsInfo', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath:  correctPath,
        timeoutInSec: 1
    }, correctUrl);

    it('_parseStreamsInfo invalid, undefined input', () => {
        assert.throws(() => {
            streamsInfo._parseStreamsInfo();
        }, SyntaxError);
    });

    it('_parseStreamsInfo invalid, null input', () => {
        assert.throws(() => {
            streamsInfo._parseStreamsInfo(null);
        }, TypeError);
    });

    it('_parseStreamsInfo invalid, empty input', () => {
        assert.throws(() => {
            streamsInfo._parseStreamsInfo('{}')
        }, StreamsInfoError, `'streams' field should be an Array. Instead it has [object Undefined] type.`);
    });

    it('_parseStreamsInfo invalid, streams input object', () => {
        assert.throws(() => {
            streamsInfo._parseStreamsInfo('{ "streams": {} }')
        }, StreamsInfoError, `'streams' field should be an Array. Instead it has [object Object] type.`);
    });

    it('_parseStreamsInfo empty streams array', () => {
        const {videos, audios} = streamsInfo._parseStreamsInfo('{ "streams": [] }');

        assert.isArray(videos);
        assert.isArray(audios);

        assert.isEmpty(videos);
        assert.isEmpty(audios);
    });

    it('_parseStreamsInfo streams array with invalid codec_type', () => {
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

    it('_parseStreamsInfo correct streams array with 1 audio and 1 video streams', () => {
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

    it('_parseStreamsInfo correct streams array with 2 audio and 2 video streams', () => {
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
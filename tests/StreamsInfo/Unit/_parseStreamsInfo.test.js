'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {StreamsInfoError} = require('Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers');

describe('StreamsInfo::_parseStreamsInfo', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    it('method awaits for stringified json', () => {
        const expectedErrorMessage = 'Failed to parse ffprobe data';
        const expectedErrorClass   = StreamsInfoError;
        const rawStreamInfo        = '{lol {kek}}';

        try {
            streamsInfo._parseStreamsInfo(rawStreamInfo);
        } catch (error) {
            assert.instanceOf(error, expectedErrorClass);

            assert.equal(error.message, expectedErrorMessage);
            assert.equal(error.extra.url, correctUrl);
            assert.instanceOf(error.extra.error, Error);
        }
    });

    dataDriven(
        [
            {type: 'bool', rawData: 'true'},
            {type: 'array', rawData: '[]'},
            {type: 'null', rawData: 'null'},
            {type: 'number', rawData: '123'},
        ],
        function () {
            it('method awaits for json stringified object, but {type} received', (ctx) => {
                const expectedErrorMessage = 'Ffprobe streams data must be an object';
                const expectedErrorClass   = StreamsInfoError;
                const rawStreamInfo        = ctx.rawData;

                try {
                    streamsInfo._parseStreamsInfo(rawStreamInfo);
                } catch (error) {
                    assert.instanceOf(error, expectedErrorClass);

                    assert.equal(error.message, expectedErrorMessage);
                    assert.equal(error.extra.url, correctUrl);
                }
            });
        }
    );

    dataDriven(
        [
            {type: '[object Boolean]', rawData: true},
            {type: '[object Object]', rawData: {}},
            {type: '[object Null]', rawData: null},
            {type: '[object Number]', rawData: 123},
        ],
        function () {
            it("method awaits for 'streams' prop of array type, but {type} received", (ctx) => {
                const expectedErrorMessage = `'streams' field should be an Array. Instead it has ${ctx.type} type.`;
                const expectedErrorClass   = StreamsInfoError;
                const rawStreamInfo        = JSON.stringify({streams: ctx.rawData});

                try {
                    streamsInfo._parseStreamsInfo(rawStreamInfo);
                } catch (error) {
                    assert.instanceOf(error, expectedErrorClass);

                    assert.equal(error.message, expectedErrorMessage);
                    assert.equal(error.extra.url, correctUrl);
                }
            });
        }
    );

    it('empty streams array', () => {
        const rawStreamsData = JSON.stringify({streams: []});

        const {videos, audios} = streamsInfo._parseStreamsInfo(rawStreamsData);

        assert.isArray(videos);
        assert.isArray(audios);

        assert.isEmpty(videos);
        assert.isEmpty(audios);
    });

    it('streams array with invalid codec_type', () => {
        const rawStreamsData = JSON.stringify({streams: [{codec_type: 'invalid'}]});

        const {videos, audios} = streamsInfo._parseStreamsInfo(rawStreamsData);

        assert.isArray(videos);
        assert.isArray(audios);

        assert.isEmpty(videos);
        assert.isEmpty(audios);
    });

    it('correct streams array with 1 audio and 1 video streams', () => {

        const videoCodecData1 = {codec_type: 'video', width: 123, height: 456};
        const videoCodecData2 = {codec_type: 'video', width: 902, height: 723};
        const someCodecData1  = {codec_type: 'data'};
        const someCodecData2  = {codec_type: 'data'};
        const audioCodecData1 = {codec_type: 'audio', profile: 'LC'};
        const audioCodecData2 = {codec_type: 'audio', profile: 'HC'};

        const expectedVideos = [videoCodecData1, videoCodecData2];
        const expectedAudios = [audioCodecData1, audioCodecData2];

        const rawStreamsData = JSON.stringify({streams: [
            videoCodecData1, videoCodecData2,
            someCodecData1, someCodecData2,
            audioCodecData1, audioCodecData2
        ]});

        const {videos, audios} = streamsInfo._parseStreamsInfo(rawStreamsData);

        assert.isArray(videos);
        assert.isArray(audios);

        assert.lengthOf(videos, 2);
        assert.lengthOf(audios, 2);

        assert.deepEqual(videos, expectedVideos);
        assert.deepEqual(audios, expectedAudios);
    });
});

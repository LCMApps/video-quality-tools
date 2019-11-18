'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {StreamsInfoError} = require('src/Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers/');

function typeOf(obj) {
    return Object.prototype.toString.call(obj);
}

describe('StreamsInfo::_parseStreamsInfo', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath
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
        [null, true, [], 123, '123'].map(item => ({type: typeOf(item), data: item})),
        () => {
            it('method awaits for json stringified object, but {type} received', (ctx) => {
                const expectedErrorMessage = 'Ffprobe streams data must be an object';
                const expectedErrorClass   = StreamsInfoError;
                const rawStreamInfo        = JSON.stringify(ctx.data);

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
        [null, true, {}, 123, '123'].map(item => ({type: typeOf(item), data: item})),
        () => {
            it("method awaits for 'streams' prop of array type, but {type} received", (ctx) => {
                const expectedErrorMessage = `'streams' field should be an Array. Instead it has ${ctx.type} type.`;
                const expectedErrorClass   = StreamsInfoError;
                const rawStreamInfo        = JSON.stringify({streams: ctx.data});

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
        const expectedResult = {
            videos: [],
            audios: []
        };
        const rawStreamsData = JSON.stringify({streams: []});

        const result = streamsInfo._parseStreamsInfo(rawStreamsData);

        assert.deepEqual(result, expectedResult);
    });

    it('streams array with not relevant codec_type', () => {
        const expectedResult = {
            videos: [],
            audios: []
        };
        const rawStreamsData = JSON.stringify({streams: [{codec_type: 'data'}]});

        const result = streamsInfo._parseStreamsInfo(rawStreamsData);

        assert.deepEqual(result, expectedResult);
    });

    it('correct streams array with 2 audios, 2 videos and several data streams', () => {

        const expectedResult = {
            videos: [
                {codec_type: 'video', profile: 'Main', width: 100, height: 100},
                {codec_type: 'video', profile: 'Main', width: 101, height: 101}
            ],
            audios: [
                {codec_type: 'audio', profile: 'LC', codec_time_base: '1/44100'},
                {codec_type: 'audio', profile: 'HC', codec_time_base: '1/44101'}
            ]
        };

        const streamData = {
            streams: [
                ...expectedResult.videos,
                ...expectedResult.audios,
                {codec_type: 'data', profile: 'unknown'},
                {codec_type: 'data', profile: 'unknown'}
            ]
        };

        const rawStreamsData = JSON.stringify(streamData);

        const result = streamsInfo._parseStreamsInfo(rawStreamsData);

        assert.deepEqual(result, expectedResult);
    });
});

'use strict';

const sinon      = require('sinon');
const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {StreamsInfoError} = require('src/Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers/');

function typeOf(obj) {
    return Object.prototype.toString.call(obj);
}

describe('StreamsInfo::fetch', () => {

    let streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInMs: 1
    }, correctUrl);

    let stubRunShowStreamsProcess;
    let stubParseStreamsInfo;
    let stubAdjustAspectRatio;

    beforeEach(() => {
        stubParseStreamsInfo      = sinon.stub(streamsInfo, '_parseStreamsInfo').callThrough();
        stubAdjustAspectRatio     = sinon.stub(streamsInfo, '_adjustAspectRatio').callThrough();
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess');
    });

    afterEach(() => {
        stubParseStreamsInfo.restore();
        stubAdjustAspectRatio.restore();
        stubRunShowStreamsProcess.restore();
    });

    it('ffmpeg child process returns with error code right after the start, fs.exec throws err', async () => {
        const expectedWrappedErrorMessage = 'Ffprobe failed to fetch streams data';
        const expectedWrappedErrorClass   = StreamsInfoError;

        const spawnError = new Error('some exception');

        stubRunShowStreamsProcess.rejects(spawnError);

        try {
            await streamsInfo.fetch();
        } catch (err) {
            assert.instanceOf(err, expectedWrappedErrorClass);

            assert.strictEqual(err.message, expectedWrappedErrorMessage);
            assert.deepEqual(err.extra, {
                error: spawnError,
                url  : correctUrl
            });

            assert(stubRunShowStreamsProcess.calledOnce);
            assert.isTrue(stubRunShowStreamsProcess.firstCall.calledWithExactly());

            assert.isFalse(stubParseStreamsInfo.called);
            assert.isFalse(stubAdjustAspectRatio.called);
        }
    });

    it('ffmpeg child process wrote to stderr, fetch method must throw an exception', async () => {
        const error = 'some error';

        const expectedErrorMessage = `Ffprobe wrote to stderr: ${error}`;
        const expectedErrorClass   = StreamsInfoError;

        stubRunShowStreamsProcess.resolves({
            stderr: error,
            stdout: 'even stdout here, but nevermind'
        });

        try {
            await streamsInfo.fetch();
        } catch (err) {
            assert.instanceOf(err, expectedErrorClass);

            assert.strictEqual(err.message, expectedErrorMessage);
            assert.deepEqual(err.extra, {
                url: correctUrl
            });

            assert(stubRunShowStreamsProcess.calledOnce);
            assert.isTrue(stubRunShowStreamsProcess.firstCall.calledWithExactly());

            assert.isFalse(stubParseStreamsInfo.called);
            assert.isFalse(stubAdjustAspectRatio.called);
        }
    });

    dataDriven(
        [undefined, null, true, 123, Symbol(123), [], {}, () => {}].map(data => ({type: typeOf(data), stdout: data})),
        () => {
            it('ffmpeg child process processed correct, but stdout has invalid {type} type.', async (ctx) => {
                const expectedErrorMessage = 'Ffprobe stdout has invalid type. Must be a String.';
                const expectedErrorClass   = StreamsInfoError;

                stubRunShowStreamsProcess.resolves({stdout: ctx.stdout});

                try {
                    await streamsInfo.fetch();
                } catch (error) {
                    assert.instanceOf(error, expectedErrorClass);

                    assert.equal(error.message, expectedErrorMessage);
                    assert.deepEqual(error.extra, {
                        stdout: ctx.stdout,
                        url   : correctUrl,
                        type  : typeOf(ctx.stdout)
                    });
                }
            });
        }
    );

    it('ffmpeg child process processed correct, but stdout string is empty. fetch method must throw an exception', async () => { // eslint-disable-line
        const expectedErrorMessage = 'Ffprobe stdout is empty';
        const expectedErrorClass   = StreamsInfoError;

        stubRunShowStreamsProcess.resolves({stdout: ''});

        try {
            await streamsInfo.fetch();
        } catch (err) {
            assert.instanceOf(err, expectedErrorClass);

            assert.strictEqual(err.message, expectedErrorMessage);
            assert.deepEqual(err.extra, {
                url: correctUrl
            });

            assert(stubRunShowStreamsProcess.calledOnce);
            assert.isTrue(stubRunShowStreamsProcess.firstCall.calledWithExactly());

            assert.isFalse(stubParseStreamsInfo.called);
            assert.isFalse(stubAdjustAspectRatio.called);
        }
    });

    dataDriven(
        [undefined, null, true, 123, Symbol(123), {}, () => {}].map(data => ({type: typeOf(data), data})),
        () => {
            it("ffmpeg child process processed correct, but stdout must has 'streams' prop of array type, but {type} received", async (ctx) => { // eslint-disable-line
                const expectedErrorClass = StreamsInfoError;
                const rawStreamInfo      = JSON.stringify({streams: ctx.data});

                stubRunShowStreamsProcess.resolves({stdout: rawStreamInfo});

                try {
                    await streamsInfo.fetch();
                } catch (err) {
                    assert.instanceOf(err, expectedErrorClass);

                    assert(stubRunShowStreamsProcess.calledOnce);
                    assert.isTrue(stubRunShowStreamsProcess.firstCall.calledWithExactly());

                    assert(stubParseStreamsInfo.calledOnce);
                    assert.isTrue(stubParseStreamsInfo.firstCall.calledWithExactly(rawStreamInfo));

                    assert.isFalse(stubAdjustAspectRatio.called);
                }
            });
        }
    );


    it('child process stdout contains not empty streams array, 2 audios, 2 videos and several data streams', async () => { // eslint-disable-line
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

        const stdout = {
            streams: [
                ...expectedResult.videos,
                ...expectedResult.audios,
                {codec_type: 'data', profile: 'unknown'},
                {codec_type: 'data', profile: 'unknown'}
            ]
        };

        const input = JSON.stringify(stdout);

        stubRunShowStreamsProcess.resolves({stdout: input});

        try {
            const result = await streamsInfo.fetch();

            assert(stubRunShowStreamsProcess.calledOnce);
            assert.isTrue(stubRunShowStreamsProcess.firstCall.calledWithExactly());

            assert(stubParseStreamsInfo.calledOnce);
            assert.isTrue(stubParseStreamsInfo.firstCall.calledWithExactly(input));

            assert(stubAdjustAspectRatio.calledOnce);

            assert.deepEqual(result, expectedResult);
        } catch (err) {
            assert.ifError(err);
        }
    });

});

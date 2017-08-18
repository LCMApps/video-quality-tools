'use strict';

const sinon         = require('sinon');
const chai          = require('chai');
const chaiAsPromise = require('chai-as-promised');
const dataDriven    = require('data-driven');

const {StreamsInfoError} = require('Errors');

const assert = chai.assert;

chai.use(chaiAsPromise);
chai.should();

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers');

describe('StreamsInfo::fetch', () => {

    let streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
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
        [
            {stdout: undefined},
            {stdout: null},
            {stdout: 1},
            {stdout: []},
            {stdout: {}},
            {
                stdout: function () {
                }
            },
            {stdout: Symbol()}
        ], () => {
            it('ffmpeg child process processed correct, but stdout has invalid type.', async (ctx) => {
                const expectedErrorMessage = 'Ffprobe stdout has invalid type';
                const expectedErrorClass   = StreamsInfoError;

                stubRunShowStreamsProcess.resolves({stdout: ctx.stdout});

                try {
                    await streamsInfo.fetch()
                } catch (error) {
                    assert.instanceOf(error, expectedErrorClass);

                    assert.equal(error.message, expectedErrorMessage);
                    assert.deepEqual(error.extra, {
                        stdout: ctx.stdout,
                        url   : correctUrl,
                        type  : Object.prototype.toString.call(ctx.stdout)
                    });
                }
            });
        }
    );

    it('ffmpeg child process processed correct, but stdout is empty. fetch method must throw an exception', async () => {
        const expectedErrorMessage = 'Ffprobe stdout is empty';
        const expectedErrorClass   = StreamsInfoError;

        stubRunShowStreamsProcess.resolves({stdout: ''});

        try {
            await streamsInfo.fetch()
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
        [
            {type: '[object Boolean]', rawData: true},
            {type: '[object Object]', rawData: {}},
            {type: '[object Null]', rawData: null},
            {type: '[object Number]', rawData: 123},
        ],
        () => {
            it("ffmpeg child process processed correct, but stdout must for 'streams' prop of array type, but {type} received", async (ctx) => {
                const expectedErrorClass = StreamsInfoError;
                const rawStreamInfo      = JSON.stringify(ctx.rawData);

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


    it('child process stdout contains not empty streams array, 1 audio and 1 video streams', async () => {
        const stdout = '{ "streams": [ {"codec_type": "video"}, {"codec_type": "audio"} ] }';

        stubRunShowStreamsProcess.resolves({stdout});

        await streamsInfo.fetch().should.eventually.deep.equal({
            videos: [{codec_type: 'video'}],
            audios: [{codec_type: 'audio'}]
        });

        assert(stubRunShowStreamsProcess.calledOnce);
        assert.isEmpty(stubRunShowStreamsProcess.getCall(0).args);

        assert(stubParseStreamsInfo.calledOnce);
        assert.deepEqual(stubParseStreamsInfo.getCall(0).args, [stdout]);

        assert.isTrue(stubAdjustAspectRatio.called);
        assert.deepEqual(stubAdjustAspectRatio.getCall(0).args, [[{codec_type: 'video'}]]);
    });

});

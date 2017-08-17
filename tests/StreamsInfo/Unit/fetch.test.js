'use strict';

const _             = require('lodash');
const sinon         = require('sinon');
const chai          = require('chai');
const chaiAsPromise = require('chai-as-promised');

const {StreamsInfoError} = require('Errors');

const assert = chai.assert;

chai.use(chaiAsPromise);
chai.should();

const {correctPath, correctUrl, StreamsInfo} = require('./');

describe('StreamsInfo::fetch', () => {

    let streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    let stubRunShowStreamsProcess;
    let stubParseStreamsInfo;
    let stubAdjustAspectRatio;

    beforeEach(() => {
        stubParseStreamsInfo  = sinon.stub(streamsInfo, '_parseStreamsInfo').callThrough();
        stubAdjustAspectRatio = sinon.stub(streamsInfo, '_adjustAspectRatio').callThrough();
    });

    afterEach(() => {
        stubParseStreamsInfo.restore();
        stubAdjustAspectRatio.restore();

        stubRunShowStreamsProcess.restore();
    });

    it('child process returns with error code right after the start, fs.exec throws err', async () => {
        const error = new Error('some exception');

        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').rejects(error);

        const err = await streamsInfo.fetch().should.be.rejectedWith(StreamsInfoError);

        assert.strictEqual(err.message, error.message);
        assert.deepEqual(err.extra, {
            error: error,
            url  : correctUrl
        });

        assert(stubRunShowStreamsProcess.calledOnce);
        assert.isEmpty(stubRunShowStreamsProcess.getCall(0).args);

        assert.isFalse(stubParseStreamsInfo.called);
        assert.isFalse(stubAdjustAspectRatio.called);
    });

    it('child process returns { stdout: undefined, stderr: undefined}', async () => {
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').resolves({});

        const err = await streamsInfo.fetch().should.be.rejectedWith(StreamsInfoError);

        assert.containsAllKeys(err, ['extra']);
        assert.containsAllKeys(err.extra, ['error', 'url']);

        assert(stubRunShowStreamsProcess.calledOnce);
        assert.isEmpty(stubRunShowStreamsProcess.getCall(0).args);

        assert(stubParseStreamsInfo.calledOnce);
        assert.deepEqual(stubParseStreamsInfo.getCall(0).args, [undefined]);

        assert.isFalse(stubAdjustAspectRatio.called);
    });

    it('child process stderr output, even with stdout one', async () => {
        const error = 'some error';

        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').resolves({
            stderr: error,
            stdout: 'even stdout here'
        });

        const res = await streamsInfo.fetch().should.be.rejectedWith(StreamsInfoError);

        assert.strictEqual(res.message, `StreamsInfo::fetch stderr: ${error}`);
        assert.deepEqual(res.extra, {
            url: correctUrl
        });

        assert(stubRunShowStreamsProcess.calledOnce);
        assert.isEmpty(stubRunShowStreamsProcess.getCall(0).args);

        assert.isFalse(stubParseStreamsInfo.called);
        assert.isFalse(stubAdjustAspectRatio.called);
    });

    it('child process stdout is null', async () => {
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').resolves({
            stdout: null
        });

        const err = await streamsInfo.fetch().should.be.rejectedWith(StreamsInfoError);

        assert.containsAllKeys(err, ['extra']);
        assert.containsAllKeys(err.extra, ['url']);

        assert(stubRunShowStreamsProcess.calledOnce);
        assert.isEmpty(stubRunShowStreamsProcess.getCall(0).args);

        assert(stubParseStreamsInfo.calledOnce);
        assert.deepEqual(stubParseStreamsInfo.getCall(0).args, [null]);

        assert.isFalse(stubAdjustAspectRatio.called);
    });

    it('child process stdout is empty object', async () => {
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').resolves({
            stdout: "{}"
        });

        const err = await streamsInfo.fetch().should.be.rejectedWith(StreamsInfoError);

        assert.containsAllKeys(err, ['extra']);
        assert.containsAllKeys(err.extra, ['url']);

        assert(stubRunShowStreamsProcess.calledOnce);
        assert.isEmpty(stubRunShowStreamsProcess.getCall(0).args);

        assert(stubParseStreamsInfo.calledOnce);
        assert.deepEqual(stubParseStreamsInfo.getCall(0).args, ['{}']);

        assert.isFalse(stubAdjustAspectRatio.called);
    });

    it('child process stdout contains empty streams array', async () => {
        const stdout              = '{ "streams": [] }';
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').resolves({stdout});

        await streamsInfo.fetch().should.eventually.deep.equal({
            videos: [],
            audios: []
        });

        assert(stubRunShowStreamsProcess.calledOnce);
        assert.isEmpty(stubRunShowStreamsProcess.getCall(0).args);

        assert(stubParseStreamsInfo.calledOnce);
        assert.deepEqual(stubParseStreamsInfo.getCall(0).args, [stdout]);

        assert.isTrue(stubAdjustAspectRatio.called);
        assert.deepEqual(stubAdjustAspectRatio.getCall(0).args, [[]]);
    });

    it('child process stdout contains not empty streams array, 1 audio and 1 video streams', async () => {
        const stdout = '{ "streams": [ {"codec_type": "video"}, {"codec_type": "audio"} ] }';

        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').resolves({stdout});

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

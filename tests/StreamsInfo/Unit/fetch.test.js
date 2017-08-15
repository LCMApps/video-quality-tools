'use strict';

const _        = require('lodash');
const sinon    = require('sinon');
const {assert} = require('chai');

const {correctPath, correctUrl, StreamsInfo} = require('./');

const {StreamsInfoError} = require('../../../Errors/');

describe('StreamsInfo::fetch', () => {

    let streamsInfo = new StreamsInfo({
        ffprobePath:  correctPath,
        timeoutInSec: 1
    }, correctUrl);

    let stubRunShowStreamsProcess;

    afterEach(() => {
        stubRunShowStreamsProcess.restore();
    });

    it('can not process stdout that undefined', () => {
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').callsFake(async () => {
            return {};
        });

        return streamsInfo.fetch()
            .then(assert.isNotDefined)
            .catch(assert.isDefined);
    });

    it('child process returns with error code right after the start, fs.exec throws err', () => {
        const error = 'some exception';

        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').callsFake(async () => {
            throw new Error(error);
        });

        return streamsInfo.fetch()
            .then(assert.isNotDefined)
            .catch(err => {
                assert.instanceOf(err, StreamsInfoError);

                assert.equal(err.message, `${error}`);
            });

    });

    it('child process stderr output, even with stdout one', () => {
        const error = 'some error';

        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').callsFake(async () => {
            return {
                stderr: error,
                stdout: 'even stdout here'
            };
        });

        return streamsInfo.fetch()
            .then(assert.isNotDefined)
            .catch(err => {
                assert.instanceOf(err, StreamsInfoError);

                assert.equal(err.message, `StreamsInfo::fetch stderr: ${error}`);
            });

    });

    it('child process stdout is null', () => {
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').callsFake(async () => {
            return {
                stdout: null
            };
        });

        return streamsInfo.fetch()
            .then(assert.isNotDefined)
            .catch(assert.isDefined);

    });

    it('child process stdout is empty object', () => {
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').callsFake(async () => {
            return {
                stdout: "{}"
            };
        });

        return streamsInfo.fetch()
            .then(assert.isNotDefined)
            .catch(assert.isDefined);

    });

    it('child process stdout contains empty streams array', () => {
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').callsFake(async () => {
            return {
                stdout: '{ "streams": [] }'
            };
        });

        return streamsInfo.fetch()
            .then(assert.isDefined)
            .catch(assert.isNotDefined);

    });

    it('child process stdout contains not empty streams array, 1 audio and 1 video streams', () => {
        stubRunShowStreamsProcess = sinon.stub(streamsInfo, '_runShowStreamsProcess').callsFake(async () => {
            return {
                stdout: '{ "streams": [ {"codec_type": "video"}, {"codec_type": "audio"} ] }'
            };
        });

        return streamsInfo.fetch()
            .then(assert.isDefined)
            .catch(assert.isNotDefined);
    });

});
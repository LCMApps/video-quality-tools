'use strict';

const sinon       = require('sinon');
const {assert}    = require('chai');
const data_driven = require('data-driven');

const {StreamsInfoError} = require('Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./');

const {invalidParams} = require('./_calculateDisplayAspectRatio.data');

describe('StreamsInfo::_calculateDisplayAspectRatio', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    data_driven(invalidParams, function () {
        it('calculate display aspect ratio for {description}', function (ctx) {
            assert.throws(() => {
                streamsInfo._calculateDisplayAspectRatio(ctx.data.width, ctx.data.height);
            }, StreamsInfoError, ctx.errorMsg);
        });
    });

    it('calculate display aspect ratio for correct input', () => {
        const res = streamsInfo._calculateDisplayAspectRatio(10, 5);

        assert.equal(res, '2:1');
    });

});

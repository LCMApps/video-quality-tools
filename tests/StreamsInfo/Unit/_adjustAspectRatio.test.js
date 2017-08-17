'use strict';

const sinon       = require('sinon');
const {assert}    = require('chai');
const data_driven = require('data-driven');

const {StreamsInfoError} = require('Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./');

const {invalidParams, validParams} = require('./_adjustAspectRatio.data');

describe('StreamsInfo::_adjustAspectRatio', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    data_driven(invalidParams, function () {
        it('{description}', function (ctx) {
            assert.throws(() => {
                streamsInfo._adjustAspectRatio(ctx.data)
            }, StreamsInfoError, ctx.errorMsg);
        });
    });

    data_driven(validParams, function () {
        it('{description}', function (ctx) {
            const frames = streamsInfo._adjustAspectRatio(ctx.data);

            const {sample_aspect_ratio, display_aspect_ratio} = ctx.res;

            assert(frames[0].sample_aspect_ratio === sample_aspect_ratio);
            assert(frames[0].display_aspect_ratio === display_aspect_ratio);
        });
    });

    it('all params are good', () => {
        const frames = streamsInfo._adjustAspectRatio([
            {sample_aspect_ratio: '10:1', display_aspect_ratio: '10:1', width: 30, height: 10}
        ]);

        assert(frames[0].sample_aspect_ratio === '10:1');
        assert(frames[0].display_aspect_ratio === '10:1');
    });

});

'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {StreamsInfoError} = require('Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers');

const {invalidParams, validParams} = require('./_adjustAspectRatio.data');

describe('StreamsInfo::_adjustAspectRatio', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    dataDriven(invalidParams, function () {
        it('{description}', function (ctx) {
            assert.throws(() => {
                streamsInfo._adjustAspectRatio(ctx.data);
            }, StreamsInfoError, ctx.errorMsg);
        });
    });

    dataDriven(validParams, function () {
        it('{description}', function (ctx) {
            const frames = streamsInfo._adjustAspectRatio(ctx.data);

            const {sample_aspect_ratio, display_aspect_ratio} = ctx.res; // eslint-disable-line

            assert(frames[0].sample_aspect_ratio === sample_aspect_ratio); // eslint-disable-line
            assert(frames[0].display_aspect_ratio === display_aspect_ratio); // eslint-disable-line
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

'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');
const _          = require('lodash');

const {StreamsInfoError} = require('Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers');

const {invalidParams, validParams} = require('./_adjustAspectRatio.data');

describe('StreamsInfo::_adjustAspectRatio', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    dataDriven(invalidParams, function () {
        const expectedErrorMessage = 'Can not calculate aspect rate due to invalid video resolution';
        const expectedErrorClass   = StreamsInfoError;

        it('{description}', function (ctx) {
            assert.throws(() => {
                streamsInfo._adjustAspectRatio(ctx.data);
            }, expectedErrorClass, expectedErrorMessage);
        });
    });

    dataDriven(validParams, function () {
        it('{description}', function (ctx) {
            const expected = ctx.res;

            const frames = streamsInfo._adjustAspectRatio(ctx.data);

            assert.deepEqual(frames, expected);
        });
    });

    it('all params are good', () => {
        const inputData = [
            {sample_aspect_ratio: '10:1', display_aspect_ratio: '10:1', width: 30, height: 10}
        ];

        const expected = _.cloneDeep(inputData);

        const frames = streamsInfo._adjustAspectRatio(inputData);

        assert.deepEqual(frames, expected);
    });

});

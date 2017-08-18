'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {StreamsInfoError} = require('Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers');

const {invalidParams, validParams} = require('./_calculateDisplayAspectRatio.data');

describe('StreamsInfo::_calculateDisplayAspectRatio', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    dataDriven(invalidParams, function () {
        it('width or height must be a positive integers, but {description} was passed', function (ctx) {
            const expectedErrorMsg   = 'Can not calculate aspect rate due to invalid video resolution';
            const expectedErrorClass = StreamsInfoError;

            assert.throws(() => {
                streamsInfo._calculateDisplayAspectRatio(ctx.width, ctx.height);
            }, expectedErrorClass, expectedErrorMsg);
        });
    });

    dataDriven(validParams, function () {
        it('calculate display aspect ratio for correct input {aspectRate}', (ctx) => {
            const expected = ctx.aspectRate;

            const result = streamsInfo._calculateDisplayAspectRatio(ctx.width, ctx.height);

            assert.strictEqual(result, expected);
        });
    });
});

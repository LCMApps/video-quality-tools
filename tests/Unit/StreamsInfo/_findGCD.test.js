'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers/');

describe('StreamsInfo::_findGcd', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    const data = [
        {a: 0, b: 0, answer: 0},
        {a: 1, b: 0, answer: 1},
        {a: 0, b: 1, answer: 1},
        {a: 1, b: 1, answer: 1},
        {a: 13, b: 7, answer: 1},
        {a: 7, b: 13, answer: 1},
        {a: 56, b: 98, answer: 14},
        {a: 98, b: 56, answer: 14},
    ];

    dataDriven(data, function () {
        it('for ({a}, {b})', function (ctx) {
            const expectation = ctx.answer;

            const result = streamsInfo._findGcd(ctx.a, ctx.b);

            assert.strictEqual(result, expectation);
        });
    });

});

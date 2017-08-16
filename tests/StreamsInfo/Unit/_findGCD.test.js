'use strict';

const sinon       = require('sinon');
const {assert}    = require('chai');
const data_driven = require('data-driven');

const {correctPath, correctUrl, StreamsInfo} = require('./');

describe('StreamsInfo::_findGCD', () => {

    const streamsInfo = new StreamsInfo({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    const data = [
        {
            description: "zeros input values",
            data       : {a: 0, b: 0},
            answer     : 0
        },
        {
            description: "ones input values",
            data       : {a: 1, b: 1},
            answer     : 1
        },
        {
            description: "correct positive natural numbers",
            data       : {a: 98, b: 56},
            answer     : 14
        },
        {
            description: "correct positive natural numbers in reverse order",
            data       : {a: 56, b: 98},
            answer     : 14
        }
    ];

    data_driven(data, function () {
        it('{description}', function (ctx) {
            const answer = streamsInfo._findGCD(ctx.data.a, ctx.data.b);

            assert(answer === ctx.answer);
        });
    });

});

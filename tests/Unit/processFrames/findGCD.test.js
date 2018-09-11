'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

describe('findGcd', () => {
    const data = [
        {a: 0, b: 0, answer: 0},
        {a: 1, b: 0, answer: 1},
        {a: 0, b: 1, answer: 1},
        {a: 1, b: 1, answer: 1},
        {a: 13, b: 7, answer: 1},
        {a: 7, b: 13, answer: 1},
        {a: 56, b: 98, answer: 14},
        {a: 98, b: 56, answer: 14},
        {a: 1280, b: 720, answer: 80},
    ];

    dataDriven(data, function () {
        it('for ({a}, {b})', function (ctx) {
            const expectation = ctx.answer;

            const result = processFrames.findGcd(ctx.a, ctx.b);

            assert.strictEqual(result, expectation);
        });
    });

});

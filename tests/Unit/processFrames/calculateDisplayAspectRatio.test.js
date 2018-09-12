'use strict';

const {assert} = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');
const {invalidParams, validParams} = require('./calculateDisplayAspectRatio.data');

describe('processFrames.calculateDisplayAspectRatio', () => {

    dataDriven(invalidParams, function () {
        it('width and height must be a positive integers, but {description} was passed', function (ctx) {
            const expectedErrorMsg   = /must be a positive integer/;
            const expectedErrorClass = TypeError;

            assert.throws(() => {
                processFrames.calculateDisplayAspectRatio(ctx.width, ctx.height);
            }, expectedErrorClass, expectedErrorMsg);
        });
    });

    dataDriven(validParams, function () {
        it('calculate display aspect ratio for correct input {aspectRatio}', (ctx) => {
            const expected = ctx.aspectRatio;

            const result = processFrames.calculateDisplayAspectRatio(ctx.width, ctx.height);

            assert.strictEqual(result, expected);
        });
    });
});

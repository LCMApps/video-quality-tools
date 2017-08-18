'use strict';

const {assert}    = require('chai');
const dataDriven = require('data-driven');

const Errors = require('Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers');

const {incorrectInputData, incorrectConfig} = require('./constructor.data');

describe('StreamsInfo::constructor', () => {

    dataDriven(incorrectInputData, function () {
        it('{description}', function (ctx) {
            assert.throws(() => {
                new StreamsInfo(ctx.config, ctx.url);
            }, TypeError, ctx.errorMsg);
        });
    });

    dataDriven(incorrectConfig, function () {
        it('{description}', function (ctx) {
            assert.throws(() => {
                new StreamsInfo(ctx.config, ctx.url);
            }, Errors.ConfigError, ctx.errorMsg);
        });
    });

    it('config.ffprobePath points to incorrect path', () => {
        assert.throws(() => {
            new StreamsInfo({
                ffprobePath : '/bad/ffprobe/path',
                timeoutInSec: 1
            }, correctUrl);
        }, Errors.ExecutablePathError);
    });

    it('all params are good', () => {
        assert.doesNotThrow(() => {
            new StreamsInfo({
                ffprobePath : correctPath,
                timeoutInSec: 1
            }, correctUrl);
        });
    });

});

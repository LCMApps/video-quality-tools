'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const Errors = require('src/Errors');

const {correctPath, correctUrl, StreamsInfo} = require('./Helpers/');

const {incorrectConfigData, incorrectUrlData, incorrectConfig} = require('./constructor.data');

describe('StreamsInfo::constructor', () => {

    dataDriven(incorrectConfigData, function () {
        it('config param has invalid ({type}) type', function (ctx) {
            assert.throws(() => {
                new StreamsInfo(ctx.config, undefined);
            }, TypeError, 'Config param should be an object.');
        });
    });

    dataDriven(incorrectUrlData, function () {
        it('url param has invalid ({type}) type', function (ctx) {
            assert.throws(() => {
                new StreamsInfo({}, ctx.url);
            }, TypeError, 'You should provide a correct url.');
        });
    });

    dataDriven(incorrectConfig, function () {
        it('{description}', function (ctx) {
            assert.throws(() => {
                new StreamsInfo(ctx.config, correctUrl);
            }, Errors.ConfigError, ctx.errorMsg);
        });
    });

    it('config.ffprobePath points to incorrect path', () => {
        assert.throws(() => {
            new StreamsInfo({
                ffprobePath: `/incorrect/path/${correctUrl}`,
                timeoutInMs: 1
            }, correctUrl);
        }, Errors.ExecutablePathError);
    });

    it('all params are good', () => {
        assert.doesNotThrow(() => {
            new StreamsInfo({
                ffprobePath: correctPath,
                timeoutInMs: 1
            }, correctUrl);
        });
    });

});

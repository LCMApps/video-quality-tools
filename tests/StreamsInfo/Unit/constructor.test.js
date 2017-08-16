'use strict';

const sinon       = require('sinon');
const {assert}    = require('chai');
const proxyquire  = require('proxyquire');
const data_driven = require('data-driven');

const {correctPath, correctUrl, StreamsInfo} = require('./');

const Errors = require('../../../Errors');

const {incorrectInputData, incorrectConfig} = require('./constructor.data');

describe('StreamsInfo::constructor', () => {

    data_driven(incorrectInputData, function () {
        it('{description}', function (ctx) {
            assert.throws(() => {
                new StreamsInfo(ctx.config, ctx.url);
            }, TypeError, ctx.errorMsg);
        });
    });

    data_driven(incorrectConfig, function () {
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

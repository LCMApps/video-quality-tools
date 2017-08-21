'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const Errors = require('src/Errors/');

const {correctPath, correctUrl, FramesMonitor} = require('./Helpers/');

const {incorrectConfigData, incorrectUrlData, incorrectConfig} = require('./constructor.data');

describe('FramesMonitor::constructor', () => {

    dataDriven(incorrectConfigData, function () {
        it('config param has invalid ({type}) type', function (ctx) {
            assert.throws(() => {
                new FramesMonitor(ctx.config, undefined);
            }, TypeError, 'Config param should be an object, bastard.');
        });
    });

    dataDriven(incorrectUrlData, function () {
        it('url param has invalid ({type}) type', function (ctx) {
            assert.throws(() => {
                new FramesMonitor({}, ctx.url);
            }, TypeError, 'You should provide a correct url, bastard.');
        });
    });

    dataDriven(incorrectConfig, function () {
        it('{description}', function (ctx) {
            assert.throws(() => {
                new FramesMonitor(ctx.config, correctUrl);
            }, Errors.ConfigError, ctx.errorMsg);
        });
    });

    it('config.ffprobePath points to incorrect path', () => {
        assert.throws(() => {
            new FramesMonitor({
                ffprobePath : `/incorrect/path/${correctUrl}`,
                timeoutInSec: 1
            }, correctUrl);
        }, Errors.ExecutablePathError);
    });

    it('all params are good', () => {
        assert.doesNotThrow(() => {
            new FramesMonitor({
                ffprobePath : correctPath,
                timeoutInSec: 1
            }, correctUrl);
        });
    });

});

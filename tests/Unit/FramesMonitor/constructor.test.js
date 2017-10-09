'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const Errors = require('src/Errors/');

const {config, url, FramesMonitor} = require('./Helpers');

const testData = require('./constructor.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('FramesMonitor::constructor', () => {

    dataDriven(
        testData.incorrectConfig.map(item => ({type: typeOf(item), config: item})),
        () => {
            it('config param has invalid ({type}) type', ctx => {
                const url = undefined;

                assert.throws(() => {
                    new FramesMonitor(ctx.config, url);
                }, TypeError, 'Config param should be a plain object, bastard.');
            });
        }
    );

    dataDriven(
        testData.incorrectUrl.map(item => ({type: typeOf(item), url: item})),
        () => {
            it('url param has invalid ({type}) type', ctx => {
                const config = {};

                assert.throws(() => {
                    new FramesMonitor(config, ctx.url);
                }, TypeError, 'You should provide a correct url, bastard.');
            });
        }
    );

    dataDriven(testData.incorrectConfigObject, () => {
        it('{description}', ctx => {
            assert.throws(() => {
                new FramesMonitor(ctx.config, url);
            }, Errors.ConfigError, ctx.errorMsg);
        });
    });

    it('config.ffprobePath points to incorrect path', () => {
        assert.throws(() => {
            new FramesMonitor({
                ffprobePath           : `/incorrect/path/${config.ffprobePath}`,
                timeoutInSec          : config.timeoutInSec,
                bufferMaxLengthInBytes: config.bufferMaxLengthInBytes,
                errorLevel            : config.errorLevel
            }, url);
        }, Errors.ExecutablePathError);
    });

    it('all params are good', () => {
        assert.doesNotThrow(() => {
            new FramesMonitor(config, url);
        });
    });

});

'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const Errors = require('src/Errors/');

const {url, path, FramesMonitor, makeFramesReducer} = require('./Helpers');

const testData = require('./constructor.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('FramesMonitor::constructor', () => {

    dataDriven(
        testData.incorrectConfig.map(item => ({type: typeOf(item), config: item})),
        () => {
            it('config param has invalid ({type}) type', ctx => {
                const url           = undefined;
                const framesReducer = undefined;

                assert.throws(() => {
                    new FramesMonitor(ctx.config, url, framesReducer);
                }, TypeError, 'Config param should be a plain object, bastard.');
            });
        }
    );

    dataDriven(
        testData.incorrectUrl.map(item => ({type: typeOf(item), url: item})),
        () => {
            it('url param has invalid ({type}) type', ctx => {
                const config        = {};
                const framesReducer = undefined;

                assert.throws(() => {
                    new FramesMonitor(config, ctx.url, framesReducer);
                }, TypeError, 'You should provide a correct url, bastard.');
            });
        }
    );

    dataDriven(
        testData.incorrectFramesReducer.map(item => ({type: typeOf(item), framesReducer: item})),
        () => {
            it('framesReducer param has invalid ({type}) type', ctx => {
                const config = {};
                const url    = '';

                assert.throws(() => {
                    new FramesMonitor(config, url, ctx.framesReducer);
                }, TypeError, 'frames reducer should be an event emitter object, bastard.');
            });
        }
    );

    dataDriven(testData.incorrectConfigObject, () => {
        it('{description}', ctx => {
            const framesReducer = makeFramesReducer();

            assert.throws(() => {
                new FramesMonitor(ctx.config, url, framesReducer);
            }, Errors.ConfigError, ctx.errorMsg);
        });
    });

    it('config.ffprobePath points to incorrect path', () => {
        const framesReducer = makeFramesReducer();

        assert.throws(() => {
            new FramesMonitor({
                ffprobePath : `/incorrect/path/${path}`,
                timeoutInSec: 1,
            }, url, framesReducer);
        }, Errors.ExecutablePathError);
    });

    it('all params are good', () => {
        const framesReducer = makeFramesReducer();

        assert.doesNotThrow(() => {
            new FramesMonitor({
                ffprobePath : path,
                timeoutInSec: 1
            }, url, framesReducer);
        });
    });

});

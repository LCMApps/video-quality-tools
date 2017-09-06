'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const FramesReducer = require('src/FramesReducer');

const Errors = require('src/Errors');

const testData = require('./constructor.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('FramesReducer::constructor', () => {

    dataDriven(
        testData.incorrectConfig.map(item => ({type: typeOf(item), config: item})),
        () => {
            it('config param has invalid ({type}) type', ctx => {
                assert.throws(() => {
                    new FramesReducer(ctx.config);
                }, TypeError, 'Config param should be a plain object.');
            });
        }
    );

    dataDriven(
        testData.incorrectBufferMaxLengthInBytes.map(item => ({type: typeOf(item), value: item})),
        () => {
            it('config.bufferMaxLengthInBytes param has invalid value ({type})', ctx => {
                assert.throws(() => {
                    new FramesReducer({bufferMaxLengthInBytes: ctx.value});
                }, Errors.ConfigError, 'bufferMaxLengthInBytes param should be a positive integer.');
            });
        }
    );

    dataDriven(testData.incorrectConfigValue, () => {
        it('{description}', ctx => {
            assert.throws(() => {
                new FramesReducer(ctx.config);
            }, Errors.ConfigError, ctx.errorMsg);
        });
    });

    it('config param is good', () => {
        const correctConfig = {
            bufferMaxLengthInBytes: 1024
        };

        assert.doesNotThrow(() => {
            new FramesReducer(correctConfig);
        });
    });

});

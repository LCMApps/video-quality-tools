'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

const Errors = require('src/Errors');

const {invalidKeyFramesTypes, invalidKeyFramesValues, testData} = require('./identifyGops.data');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('processFrames.identifyGops', () => {

    dataDriven(
        invalidKeyFramesTypes.map(item => ({type: typeOf(item), key_frame: item})),
        () => {
            it('must throw an error if frame key_frame field has invalid {type} type', ctx => {
                const invalidFrame = {key_frame: ctx.key_frame};
                const invalidInput = [invalidFrame];

                try {
                    processFrames.identifyGops(invalidInput);
                    assert.isFalse(true, 'should not be here');
                } catch (error) {
                    assert.instanceOf(error, Errors.FrameInvalidData);

                    assert.strictEqual(error.message, `frame's key_frame field has invalid type: ${ctx.type}`);

                    assert.deepEqual(error.extra, {frame: invalidFrame});
                }
            });
        }
    );

    dataDriven(
        invalidKeyFramesValues.map(item => ({key_frame: item})),
        () => {
            it('must throw an error if frame key_frame field has invalid value: {key_frame}. Must be 0 or 1.', ctx => {
                const invalidFrame = {key_frame: ctx.key_frame};
                const invalidInput = [invalidFrame];

                try {
                    processFrames.identifyGops(invalidInput);
                    assert.isFalse(true, 'should not be here');
                } catch (error) {
                    assert.instanceOf(error, Errors.FrameInvalidData);

                    assert.strictEqual(
                        error.message,
                        `frame's key_frame field has invalid value: ${ctx.key_frame}. Must be 1 or 0.`
                    );

                    assert.deepEqual(error.extra, {frame: invalidFrame});
                }
            });
        }
    );

    dataDriven(testData, () => {
        it('{description}', ctx => {
            const expectedResult = ctx.res;

            const gops = processFrames.identifyGops(ctx.input);

            assert.deepEqual(gops, expectedResult);
        });
    });

});

'use strict';

const {assert}   = require('chai');
const dataDriven = require('data-driven');

const processFrames = require('src/processFrames');

const Errors = require('src/Errors');

function typeOf(item) {
    return Object.prototype.toString.call(item);
}

describe('processFrames.gopDurationInSec', () => {

    const invalidData = [
        undefined,
        null,
        true,
        '1',
        {},
        [],
        () => {}
    ];

    dataDriven(
        invalidData.map(item => ({type: typeOf(item), startTime: item})),
        () => {
            it('must throw an error if gop start time field has invalid {type} type', ctx => {
                const invalidStartTime = ctx.startTime;
                const validEndTime     = 2;

                const invalidInput = {
                    frames   : [],
                    startTime: invalidStartTime,
                    endTime  : validEndTime
                };

                try {
                    processFrames.gopDurationInSec(invalidInput);
                    assert.isFalse(true, 'should not be here');
                } catch (error) {
                    assert.instanceOf(error, Errors.GopInvalidData);

                    assert.strictEqual(
                        error.message,
                        `gops's start time has invalid type ${Object.prototype.toString.call(invalidInput.startTime)}`
                    );

                    assert.deepEqual(error.extra, {gop: invalidInput});
                }
            });
        }
    );

    dataDriven(
        invalidData.map(item => ({type: typeOf(item), endTime: item})),
        () => {
            it('must throw an error if gop end time field has invalid {type} type', ctx => {
                const validStartTime = 1;
                const invalidEndTime = ctx.endTime;

                const invalidInput = {
                    frames   : [],
                    startTime: validStartTime,
                    endTime  : invalidEndTime
                };

                try {
                    processFrames.gopDurationInSec(invalidInput);
                    assert.isFalse(true, 'should not be here');
                } catch (error) {
                    assert.instanceOf(error, Errors.GopInvalidData);

                    assert.strictEqual(
                        error.message,
                        `gops's end time has invalid type ${Object.prototype.toString.call(invalidInput.endTime)}`
                    );

                    assert.deepEqual(error.extra, {gop: invalidInput});
                }
            });
        }
    );

    it('must throw an error if gop start time field has invalid, negative value', () => {
        const invalidStartTime = -1;
        const validEndTime     = 2;

        const invalidInput = {
            frames   : [],
            startTime: invalidStartTime,
            endTime  : validEndTime
        };

        try {
            processFrames.gopDurationInSec(invalidInput);
            assert.isFalse(true, 'should not be here');
        } catch (error) {
            assert.instanceOf(error, Errors.GopInvalidData);

            assert.strictEqual(
                error.message,
                `gop's start time has invalid value ${invalidInput.startTime}`
            );

            assert.deepEqual(error.extra, {gop: invalidInput});
        }
    });

    it('must throw an error if gop end time field has invalid, negative value', () => {
        const validStartTime      = 1;
        const invalidValidEndTime = -1;

        const invalidInput = {
            frames   : [],
            startTime: validStartTime,
            endTime  : invalidValidEndTime
        };

        try {
            processFrames.gopDurationInSec(invalidInput);
            assert.isFalse(true, 'should not be here');
        } catch (error) {
            assert.instanceOf(error, Errors.GopInvalidData);

            assert.strictEqual(
                error.message,
                `gop's end time has invalid value ${invalidInput.endTime}`
            );

            assert.deepEqual(error.extra, {gop: invalidInput});
        }
    });

    it('must throw an error if gop end time has invalid, zero value', () => {
        const validStartTime = 0;
        const invalidEndTime = 0;

        const invalidInput = {
            frames   : [],
            startTime: validStartTime,
            endTime  : invalidEndTime
        };

        try {
            processFrames.gopDurationInSec(invalidInput);
            assert.isFalse(true, 'should not be here');
        } catch (error) {
            assert.instanceOf(error, Errors.GopInvalidData);

            assert.strictEqual(
                error.message,
                `gop's end time has invalid value ${invalidInput.endTime}`
            );

            assert.deepEqual(error.extra, {gop: invalidInput});
        }
    });

    it('must throw an error cuz the diff between gop start and end times equals to zero', () => {
        const validStartTime = 2;
        const invalidEndTime = 1;

        const invalidInput = {
            frames   : [],
            startTime: validStartTime,
            endTime  : invalidEndTime
        };

        try {
            processFrames.gopDurationInSec(invalidInput);
            assert.isFalse(true, 'should not be here');
        } catch (error) {
            assert.instanceOf(error, Errors.GopInvalidData);

            assert.strictEqual(
                error.message,
                `invalid difference between gop start and end time: ${invalidEndTime - validStartTime}`,
            );

            assert.deepEqual(error.extra, {gop: invalidInput});
        }
    });

});

'use strict';

const incorrectDurationInMs = [
    undefined,
    null,
    false,
    '1',
    [],
    {},
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('error')
];

const incorrectDurationInMsValues = [
    {
        description: 'durationInMs param must be a positive integer, float is passed',
        durationInMs: 1.1,
        errorMsg: 'Expected durationInMs to be a positive integer greater than 0.'
    },
    {
        description: 'durationInMs param must be a positive integer, negative is passed',
        durationInMs: -1,
        errorMsg: 'Expected durationInMs to be a positive integer greater than 0.'
    },
    {
        description: 'durationInMs param must be a positive integer, zero is passed',
        durationInMs: 0,
        errorMsg: 'Expected durationInMs to be a positive integer greater than 0.'
    }
];

module.exports = {
    incorrectDurationInMs,
    incorrectDurationInMsValues
};


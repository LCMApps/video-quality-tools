'use strict';

const incorrectConfig = [
    undefined,
    null,
    false,
    1,
    '1',
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('bastard')
];

const incorrectBufferMaxLengthInBytes = [
    undefined,
    null,
    false,
    '1',
    {},
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('bastard')
];

const incorrectConfigValue = [
    {
        description: 'config.timeout param must be a positive integer, float is passed',
        config     : {bufferMaxLengthInBytes: 1.1},
        errorMsg   : 'bufferMaxLengthInBytes param should be a positive integer.'
    },
    {
        description: 'config.timeout param must be a positive integer, negative is passed',
        config     : {bufferMaxLengthInBytes: -1},
        errorMsg   : 'bufferMaxLengthInBytes param should be a positive integer.'
    }
];

module.exports = {
    incorrectConfig,
    incorrectBufferMaxLengthInBytes,
    incorrectConfigValue
};

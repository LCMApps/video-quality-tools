'use strict';

const incorrectConfig = [
    undefined,
    null,
    false,
    1,
    [],
    '1',
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('bastard')
];

const incorrectUrl = [
    undefined,
    null,
    false,
    1,
    [],
    {},
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('bastard')
];

const incorrectFfprobePath = [
    undefined,
    null,
    false,
    1,
    [],
    {},
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('bastard')
];

const incorrectTimeoutInMs = [
    undefined,
    null,
    false,
    '1',
    [],
    {},
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
    [],
    {},
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('bastard')
];

const incorrectErrorLevel = [
    undefined,
    null,
    false,
    1,
    [],
    {},
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('bastard')
];

const incorrectExitProcessGuardTimeoutInMs = [
    undefined,
    null,
    false,
    '1',
    [],
    {},
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('bastard')
];

const incorrectConfigObject = [
    {
        description: 'config.timeoutInMs param must be a positive integer, float is passed',
        config     : {timeoutInMs: 1.1},
        errorMsg   : 'You should provide a correct timeout, bastard.'
    },
    {
        description: 'config.timeoutInMs param must be a positive integer, negative is passed',
        config     : {timeoutInMs: -1},
        errorMsg   : 'You should provide a correct timeout, bastard.'
    },
    {
        description: 'config.bufferMaxLengthInBytes param must be a positive integer, float is passed',
        config     : {bufferMaxLengthInBytes: 1.1},
        errorMsg   : 'bufferMaxLengthInBytes param should be a positive integer.'
    },
    {
        description: 'config.bufferMaxLengthInBytes param must be a positive integer, negative is passed',
        config     : {bufferMaxLengthInBytes: -1},
        errorMsg   : 'bufferMaxLengthInBytes param should be a positive integer.'
    },
    {
        description: 'config.errorLevel param must be a correct string',
        config     : {errorLevel: 'error' + 'incorrect-part'},
        errorMsg   : 'You should provide correct error level, bastard. Check ffprobe documentation.'
    },
    {
        description: 'config.exitProcessGuardTimeoutInMs param must be a positive integer, float is passed',
        config     : {exitProcessGuardTimeoutInMs: 1.1},
        errorMsg   : 'exitProcessGuardTimeoutInMs param should be a positive integer.'
    },
    {
        description: 'config.exitProcessGuardTimeoutInMs param must be a positive integer, negative is passed',
        config     : {exitProcessGuardTimeoutInMs: -1},
        errorMsg   : 'exitProcessGuardTimeoutInMs param should be a positive integer.'
    },
    {
        description: 'config.analyzeDurationInMs param must be a positive integer, float is passed',
        config     : {analyzeDurationInMs: 1.1},
        errorMsg   : 'You should provide a correct analyze duration, bastard.'
    },
    {
        description: 'config.analyzeDurationInMs param must be a positive integer, negative is passed',
        config     : {analyzeDurationInMs: -1},
        errorMsg   : 'You should provide a correct analyze duration, bastard.'
    },
    {
        description: 'config.analyzeDurationInMs param must be a positive integer, string is passed',
        config     : {analyzeDurationInMs: '10'},
        errorMsg   : 'You should provide a correct analyze duration, bastard.'
    },
];

module.exports = {
    incorrectConfig,
    incorrectUrl,
    incorrectFfprobePath,
    incorrectTimeoutInMs,
    incorrectBufferMaxLengthInBytes,
    incorrectErrorLevel,
    incorrectExitProcessGuardTimeoutInMs,
    incorrectConfigObject,
};

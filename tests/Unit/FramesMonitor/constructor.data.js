const {config} = require('./Helpers/');

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
    new Error('bastard'),
    'error' + 'incorrect part'
];

const incorrectConfigObject = [
    {
        'description': 'config object must not be empty',
        'config'     : {},
        'errorMsg'   : 'You should provide a correct path to ffprobe, bastard.'
    },
    {
        'description': 'config.timeout must be passed',
        'config'     : {ffprobePath: config.ffprobePath},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, float is passed',
        'config'     : {ffprobePath: config.ffprobePath, timeoutInSec: 1.1},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, negative is passed',
        'config'     : {ffprobePath: config.ffprobePath, timeoutInSec: -1},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, string is passed',
        'config'     : {ffprobePath: config.ffprobePath, timeoutInSec: '10'},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.bufferMaxLengthInBytes param must be a positive integer, float is passed',
        'config'     : {ffprobePath: config.ffprobePath, timeoutInSec: 1, bufferMaxLengthInBytes: 1.1},
        'errorMsg'   : 'bufferMaxLengthInBytes param should be a positive integer.'
    },
    {
        'description': 'config.bufferMaxLengthInBytes param must be a positive integer, negative is passed',
        'config'     : {ffprobePath: config.ffprobePath, timeoutInSec: 1, bufferMaxLengthInBytes: -1},
        'errorMsg'   : 'bufferMaxLengthInBytes param should be a positive integer.'
    },
    {
        'description': 'config.bufferMaxLengthInBytes param must be a positive integer, string is passed',
        'config'     : {ffprobePath: config.ffprobePath, timeoutInSec: 1, bufferMaxLengthInBytes: '10'},
        'errorMsg'   : 'bufferMaxLengthInBytes param should be a positive integer.'
    },
    {
        'description': 'config.errorLevel param must be a correct string',
        'config'     : {ffprobePath: config.ffprobePath, timeoutInSec: 1, bufferMaxLengthInBytes: 10},
        'errorMsg'   : 'You should provide correct error level, bastard. Check ffprobe documentation.'
    },
    {
        'description': 'config.errorLevel param must be a correct string',
        'config'     : {ffprobePath: config.ffprobePath, timeoutInSec: 1, bufferMaxLengthInBytes: 10, errorLevel: 1},
        'errorMsg'   : 'You should provide correct error level, bastard. Check ffprobe documentation.'
    }
];

module.exports = {
    incorrectConfig,
    incorrectUrl,
    incorrectErrorLevel,
    incorrectConfigObject,
};

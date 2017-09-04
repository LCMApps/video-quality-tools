const {path} = require('./Helpers/');

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

const incorrectFramesReducer = [
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

const incorrectConfigObject = [
    {
        'description': 'config object must not be empty',
        'config'     : {},
        'errorMsg'   : 'You should provide a correct path to ffprobe, bastard.'
    },
    {
        'description': 'config.timeout must be passed',
        'config'     : {ffprobePath: path},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, float is passed',
        'config'     : {ffprobePath: path, timeoutInSec: 1.1},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, negative is passed',
        'config'     : {ffprobePath: path, timeoutInSec: -1},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, string is passed',
        'config'     : {ffprobePath: path, timeoutInSec: '10'},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
];

module.exports = {
    incorrectConfig,
    incorrectUrl,
    incorrectFramesReducer,
    incorrectConfigObject,
};

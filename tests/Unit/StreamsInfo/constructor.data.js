const {correctPath} = require('./Helpers/');

const incorrectConfigData = [
    {
        'type'  : 'Boolean',
        'config': false,
    },
    {
        'type'  : 'Null',
        'config': null,
    },
    {
        'type'  : 'Undefined',
        'config': undefined,
    },
    {
        'type'  : 'Number',
        'config': 111,
    },
    {
        'type'  : 'String',
        'config': '111',
    },
    {
        'type'  : 'Symbol',
        'config': Symbol(),
    },
    {
        'type'  : 'Function',
        'config': function () {
        },
    },
];

const incorrectUrlData = [
    {
        'type': 'Boolean',
        'url' : false,
    },
    {
        'type': 'Null',
        'url' : null,
    },
    {
        'type': 'Undefined',
        'url' : undefined,
    },
    {
        'type': 'Number',
        'url' : 111,
    },
    {
        'type': 'Object',
        'url' : {},
    },
    {
        'type': 'Symbol',
        'url' : Symbol(),
    },
    {
        'type': 'Function',
        'url' : function () {
        },
    },
];

const incorrectConfig = [
    {
        'description': 'config object must not be empty',
        'config'     : {},
        'errorMsg'   : 'You should provide a correct path to ffprobe, bastard.'
    },
    {
        'description': 'config.analyzeDurationMs param must be a positive integer, float is passed',
        'config'     : {ffprobePath: correctPath, analyzeDurationMs: 1.1},
        'errorMsg'   : 'You should provide a correct analyze duration, bastard.'
    },
    {
        'description': 'config.analyzeDurationMs param must be a positive integer, negative is passed',
        'config'     : {ffprobePath: correctPath, analyzeDurationMs: -1},
        'errorMsg'   : 'You should provide a correct analyze duration, bastard.'
    },
    {
        'description': 'config.analyzeDurationMs param must be a positive integer, string is passed',
        'config'     : {ffprobePath: correctPath, analyzeDurationMs: '10'},
        'errorMsg'   : 'You should provide a correct analyze duration, bastard.'
    },
];

module.exports = {
    incorrectConfigData,
    incorrectUrlData,
    incorrectConfig
};

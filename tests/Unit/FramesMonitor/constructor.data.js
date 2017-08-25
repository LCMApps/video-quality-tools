const {correctPath} = require('./Helpers/');

const incorrectConfigData = [undefined, null, false, 1, '1', Symbol(), () => {}, Buffer.alloc(1)];
const incorrectUrlData    = [undefined, null, false, 1, {}, Symbol(), () => {}, Buffer.alloc(1)];

const incorrectConfig = [
    {
        'description': 'config object must not be empty',
        'config'     : {},
        'errorMsg'   : 'You should provide a correct path to ffprobe, bastard.'
    },
    {
        'description': 'config.timeout must be passed',
        'config'     : {ffprobePath: correctPath},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, float is passed',
        'config'     : {ffprobePath: correctPath, timeoutInSec: 1.1},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, negative is passed',
        'config'     : {ffprobePath: correctPath, timeoutInSec: -1},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
    {
        'description': 'config.timeout param must be a positive integer, string is passed',
        'config'     : {ffprobePath: correctPath, timeoutInSec: '10'},
        'errorMsg'   : 'You should provide a correct timeout, bastard.'
    },
];

module.exports = {
    incorrectConfigData,
    incorrectUrlData,
    incorrectConfig
};

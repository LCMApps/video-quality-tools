const {correctPath, correctUrl} = require('./');

const incorrectInputData = [
    {
        "description": "config param has invalid (Boolean) type",
        "config"     : false,
        "errorMsg"   : "Config param should be an object, bastard."
    },
    {
        "description": "config param has invalid (Null) type",
        "config"     : null,
        "errorMsg"   : "Config param should be an object, bastard."
    },
    {
        "description": "cconfig param has invalid (Undefined) type",
        "config"     : undefined,
        "errorMsg"   : "Config param should be an object, bastard."
    },
    {
        "description": "config param has invalid (Number) type",
        "config"     : 111,
        "errorMsg"   : "Config param should be an object, bastard."
    },
    {
        "description": "config param has invalid (String) type",
        "config"     : '111',
        "errorMsg"   : "Config param should be an object, bastard."
    },
    {
        "description": "config param has invalid (Symbol) type",
        "config"     : Symbol(),
        "errorMsg"   : "Config param should be an object, bastard."
    },
    {
        "description": "config param has invalid (Function) type",
        "config"     : function () {
        },
        "errorMsg"   : "Config param should be an object, bastard."
    },
    {
        "description": "url param has invalid (Boolean) type",
        "config"     : {},
        "url"        : false,
        "errorMsg"   : "You should provide a correct url, bastard."
    },
    {
        "description": "url param has invalid (Null) type",
        "config"     : {},
        "url"        : null,
        "errorMsg"   : "You should provide a correct url, bastard."
    },
    {
        "description": "url param has invalid (Undefined) type",
        "config"     : {},
        "url"        : undefined,
        "errorMsg"   : "You should provide a correct url, bastard."
    },
    {
        "description": "url param has invalid (Number) type",
        "config"     : {},
        "url"        : 111,
        "errorMsg"   : "You should provide a correct url, bastard."
    },
    {
        "description": "url param has invalid (Symbol) type",
        "config"     : {},
        "url"        : Symbol(),
        "errorMsg"   : "You should provide a correct url, bastard."
    },
    {
        "description": "url param has invalid (Function) type",
        "config"     : {},
        "url"        : function () {
        },
        "errorMsg"   : "You should provide a correct url, bastard."
    },
];

const incorrectConfig = [
    {
        "description": "config object is empty",
        "config"     : {},
        "url"        : correctUrl,
        "errorMsg"   : "You should provide a correct path to ffprobePath, bastard."
    },
    {
        "description": "config.timeout param was not passed",
        "config"     : {ffprobePath: correctPath},
        "url"        : correctUrl,
        "errorMsg"   : "You should provide a correct timeout, bastard."
    },
    {
        "description": "config.timeout param is decimal",
        "config"     : {ffprobePath: correctPath, timeoutInSec: 1.1},
        "url"        : correctUrl,
        "errorMsg"   : "You should provide a correct timeout, bastard."
    },
    {
        "description": "config.timeout param is negative",
        "config"     : {ffprobePath: correctPath, timeoutInSec: -1},
        "url"        : correctUrl,
        "errorMsg"   : "You should provide a correct timeout, bastard."
    }
];

module.exports = {
    incorrectInputData,
    incorrectConfig
};

const invalidParams = [
    {
        'description': 'undefined video width',
        'data'       : {},
        'errorMsg'   : 'width field has invalid value.'
    },
    {
        'description': 'undefined video height',
        'data'       : {width: 10},
        'errorMsg'   : 'height field has invalid value.'
    },
    {
        'description': 'invalid video width',
        'data'       : {width: 0},
        'errorMsg'   : 'width field has invalid value.'
    },
    {
        'description': 'invalid video height',
        'data'       : {width: 5, height: 0},
        'errorMsg'   : 'height field has invalid value.'
    },
    {
        'description': 'decimal video width',
        'data'       : {width: 11.5},
        'errorMsg'   : 'width field has invalid value.'
    },
    {
        'description': 'decimal video height',
        'data'       : {width: 10, height: 11.5},
        'errorMsg'   : 'height field has invalid value.'
    }
];

module.exports = {invalidParams};

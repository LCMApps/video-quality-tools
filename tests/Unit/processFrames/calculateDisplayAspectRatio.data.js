const invalidParams = [
    {
        description: 'undefined width',
        width      : undefined,
        height     : 123,
    },
    {
        description: 'undefined height',
        width      : 123,
        height     : undefined,
    },
    {
        description: 'not-int width',
        width      : 10,
        height     : '123',
    },
    {
        description: 'not-int height',
        width      : '123',
        height     : 10,
    },
    {
        description: 'float width',
        width      : 11.5,
        height     : 10,
    },
    {
        description: 'float height',
        width      : 10,
        height     : 11.5,
    },
    {
        description: 'zero width',
        width      : 0,
        height     : 10,
    },
    {
        description: 'zero height',
        width      : 10,
        height     : 0,
    },
];

const validParams = [
    {
        width     : 1,
        height    : 1,
        aspectRatio: '1:1'
    },
    {
        width     : 10,
        height    : 1,
        aspectRatio: '10:1'
    },
    {
        width     : 1,
        height    : 10,
        aspectRatio: '1:10'
    },
    {
        width     : 13,
        height    : 7,
        aspectRatio: '13:7'
    },
    {
        width     : 7,
        height    : 13,
        aspectRatio: '7:13'
    },
    {
        width     : 10,
        height    : 5,
        aspectRatio: '18:9'
    },
    {
        width     : 5,
        height    : 10,
        aspectRatio: '1:2'
    },
    {
        width     : 640,
        height    : 480,
        aspectRatio: '4:3'
    },
    {
        width     : 854,
        height    : 480,
        aspectRatio: '16:9'
    },
    {
        width     : 1280,
        height    : 720,
        aspectRatio: '16:9'
    },
    {
        width     : 1284,
        height    : 720,
        aspectRatio: '16:9'
    },
    {
        width     : 1275,
        height    : 720,
        aspectRatio: '16:9'
    },
    {
        width     : 1440,
        height    : 720,
        aspectRatio: '18:9'
    },
    {
        width     : 1680,
        height    : 720,
        aspectRatio: '21:9'
    },
    {
        width     : 1000,
        height    : 720,
        aspectRatio: '25:18'
    }
];

module.exports = {invalidParams, validParams};

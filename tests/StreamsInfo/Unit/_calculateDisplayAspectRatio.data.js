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
        aspectRate: '1:1'
    },
    {
        width     : 10,
        height    : 1,
        aspectRate: '10:1'
    },
    {
        width     : 1,
        height    : 10,
        aspectRate: '1:10'
    },
    {
        width     : 13,
        height    : 7,
        aspectRate: '13:7'
    },
    {
        width     : 7,
        height    : 13,
        aspectRate: '7:13'
    },
    {
        width     : 10,
        height    : 5,
        aspectRate: '2:1'
    },
    {
        width     : 5,
        height    : 10,
        aspectRate: '1:2'
    }
];

module.exports = {invalidParams, validParams};

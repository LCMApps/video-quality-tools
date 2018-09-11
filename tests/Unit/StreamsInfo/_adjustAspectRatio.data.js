const invalidParams = [
    {
        description: 'width param is invalid',
        data       : [{sample_aspect_ratio: '0:1', display_aspect_ratio: '10:1', width: 'N/A', height: 10}],
        errorMsg   : 'width field has invalid value.'
    },
    {
        description: 'height param is invalid',
        data       : [{sample_aspect_ratio: '0:1', display_aspect_ratio: '10:1', width: 10, height: 'N/A'}],
        errorMsg   : 'height field has invalid value.'
    },
    {
        description: 'height param is invalid',
        data       : [{sample_aspect_ratio: '10:1', display_aspect_ratio: '0:1', width: 'N/A', height: 10}],
        errorMsg   : 'height field has invalid value.'
    },
    {
        description: 'height param is invalid',
        data       : [{sample_aspect_ratio: '10:1', display_aspect_ratio: '0:1', width: 10, height: 'N/A'}],
        errorMsg   : 'height field has invalid value.'
    },
];

const validParams = [
    {
        description: 'sample_aspect_ratio param is invalid',
        data       : [],
        res        : []
    },
    {
        description: 'sample_aspect_ratio param is invalid',
        data       : [{sample_aspect_ratio: '0:1', display_aspect_ratio: '200:100', width: 10, height: 4}],
        res        : [{sample_aspect_ratio: '1:1', display_aspect_ratio: '5:2', width: 10, height: 4}]
    },
    {
        description: 'display_aspect_ratio param is invalid',
        data       : [{sample_aspect_ratio: '200:100', display_aspect_ratio: '0:1', width: 20, height: 10}],
        res        : [{sample_aspect_ratio: '1:1', display_aspect_ratio: '18:9', width: 20, height: 10}]
    },
    {
        description: 'sample_aspect_ratio param is invalid',
        data       : [{sample_aspect_ratio: 'N/A', display_aspect_ratio: '200:100', width: 10, height: 4}],
        res        : [{sample_aspect_ratio: '1:1', display_aspect_ratio: '5:2', width: 10, height: 4}]
    },
    {
        description: 'display_aspect_ratio param is invalid',
        data       : [{sample_aspect_ratio: '200:100', display_aspect_ratio: 'N/A', width: 20, height: 10}],
        res        : [{sample_aspect_ratio: '1:1', display_aspect_ratio: '18:9', width: 20, height: 10}]
    }
];

module.exports = {
    invalidParams,
    validParams
};

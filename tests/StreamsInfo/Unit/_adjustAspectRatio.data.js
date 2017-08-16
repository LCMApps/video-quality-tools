const invalidParams = [
    {
        description: "width param is invalid",
        data       : [{sample_aspect_ratio: '0:1', display_aspect_ratio: '10:1', width: 'N/A', height: 10}],
        errorMsg   : "width field has invalid value."
    },
    {
        description: "height param is invalid",
        data       : [{sample_aspect_ratio: '0:1', display_aspect_ratio: '10:1', width: 10, height: 'N/A'}],
        errorMsg   : "height field has invalid value."
    }
];

const validParams = [
    {
        description: "sample_aspect_ratio param is invalid",
        data       : [{sample_aspect_ratio: '0:1', display_aspect_ratio: '200:100', width: 10, height: 4}],
        res        : {sample_aspect_ratio: '1:1', display_aspect_ratio: '5:2'}
    },
    {
        description: "display_aspect_ratio param is invalid",
        data       : [{sample_aspect_ratio: '200:100', display_aspect_ratio: '0:1', width: 20, height: 10}],
        res        : {sample_aspect_ratio: '1:1', display_aspect_ratio: '2:1'}
    }
];

module.exports = {
    invalidParams,
    validParams
};

'use strict';

const createFramesReducer = require('src/FramesReducer');

const bufferMaxLengthInBytes = 1024;

function makeFramesReducer() {
    return createFramesReducer({bufferMaxLengthInBytes});
}

module.exports = {
    bufferMaxLengthInBytes,
    makeFramesReducer
};

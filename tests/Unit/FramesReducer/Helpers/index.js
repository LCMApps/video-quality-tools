'use strict';

const FramesReducer = require('src/FramesReducer');

const bufferMaxLengthInBytes = 1024;

function makeFramesReducer() {
    return new FramesReducer({bufferMaxLengthInBytes});
}

module.exports = {
    bufferMaxLengthInBytes,
    makeFramesReducer
};

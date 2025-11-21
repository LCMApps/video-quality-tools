'use strict';

const FrameEnvelope = require('src/FrameEnvelope');

const {
    createVideoFrameSchema1,
    createVideoFrameSchema2,
    createVideoFrameSchema3,
    createVideoFrameSchema4,
    createAudioFrameSchema1,
    createAudioFrameSchema2,
    createAudioFrameSchema3,
    createAudioFrameSchema4,
} = require('./Helpers');

const incorrectFrameEnvelope = [
    undefined,
    null,
    false,
    1,
    '1',
    [],
    {},
    Symbol(),
    () => {},
    Buffer.alloc(1),
    new Error('error')
];

module.exports = {
    incorrectFrameEnvelope,
};

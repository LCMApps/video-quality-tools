'use strict';

const DEFAULT_FFTOOL_VERSION_EXEC_TIMEOUT_IN_MSEC = 1000;
const DEFAULT_FFTOOL_VERSION_EXEC_MAX_BUFFER_BYTES = 10240;

const endOfLineTestData = [
    {endOfLine: '\n', humanReadable: '\\n'},
    {endOfLine: '\r\n', humanReadable: '\\r\\n'},
    {endOfLine: '!@#\n', humanReadable: '!@#\\n'},
];

const validExecOptionsTestData = [
    {
        execTimeoutInMsec: 2500,
        expectedExecTimeoutInMsec: 2500,
        execMaxBufferBytes: 1090,
        expectedExecMaxBufferBytes: 1090
    },
    {
        execTimeoutInMsec: 0,
        expectedExecTimeoutInMsec: 0,
        execMaxBufferBytes: 1090,
        expectedExecMaxBufferBytes: 1090
    },
    {
        execTimeoutInMsec: null,
        expectedExecTimeoutInMsec: DEFAULT_FFTOOL_VERSION_EXEC_TIMEOUT_IN_MSEC,
        execMaxBufferBytes: 1090,
        expectedExecMaxBufferBytes: 1090
    },
    {
        execTimeoutInMsec: 2500,
        expectedExecTimeoutInMsec: 2500,
        execMaxBufferBytes: null,
        expectedExecMaxBufferBytes: DEFAULT_FFTOOL_VERSION_EXEC_MAX_BUFFER_BYTES
    },
    {
        execTimeoutInMsec: null,
        expectedExecTimeoutInMsec: DEFAULT_FFTOOL_VERSION_EXEC_TIMEOUT_IN_MSEC,
        execMaxBufferBytes: null,
        expectedExecMaxBufferBytes: DEFAULT_FFTOOL_VERSION_EXEC_MAX_BUFFER_BYTES
    },
];

const optionsThatThrowErrorsTestData = [
    {
        description: 'fftoolPath must be a non-empty string, empty was passed',
        fftoolPath: '',
        options: {execTimeoutInMsec: 1001, execMaxBufferBytes: 1002, endOfLine: '\n'},
        errorMsg: 'fftoolPath must be a non-empty string'
    },
    {
        description: 'fftoolPath must be a non-empty string, whitespace was passed',
        fftoolPath: ' ',
        options: {execTimeoutInMsec: 1001, execMaxBufferBytes: 1002, endOfLine: '\n'},
        errorMsg: 'fftoolPath must be a non-empty string'
    },
    {
        description: 'options.endOfLine must be a non-empty string',
        fftoolPath: '/ffprobe',
        options: {execTimeoutInMsec: 1001, execMaxBufferBytes: 1002, endOfLine: ''},
        errorMsg: 'options.endOfLine must be a non-empty string'
    },
    {
        description: 'options.execTimeoutInMsec must be a non-negative integer, negative was passed',
        fftoolPath: '/ffprobe',
        options: {execTimeoutInMsec: -1, execMaxBufferBytes: 1002, endOfLine: '\n'},
        errorMsg: 'options.execTimeoutInMsec must be a non-negative integer'
    },
    {
        description: 'options.execTimeoutInMsec must be a non-negative integer, float was passed',
        fftoolPath: '/ffprobe',
        options: {execTimeoutInMsec: 1.5, execMaxBufferBytes: 1002, endOfLine: '\n'},
        errorMsg: 'options.execTimeoutInMsec must be a non-negative integer'
    },
    {
        description: 'options.execTimeoutInMsec must be a non-negative integer, null was passed',
        fftoolPath: '/ffprobe',
        options: {execTimeoutInMsec: null, execMaxBufferBytes: 1002, endOfLine: '\n'},
        errorMsg: 'options.execTimeoutInMsec must be a non-negative integer'
    },
    {
        description: 'options.execMaxBufferBytes must be a positive integer, negative was passed',
        fftoolPath: '/ffprobe',
        options: {execTimeoutInMsec: 1000, execMaxBufferBytes: -1, endOfLine: '\n'},
        errorMsg: 'options.execMaxBufferBytes must be a positive integer'
    },
    {
        description: 'options.execMaxBufferBytes must be a positive integer, float was passed',
        fftoolPath: '/ffprobe',
        options: {execTimeoutInMsec: 1000, execMaxBufferBytes: 1.5, endOfLine: '\n'},
        errorMsg: 'options.execMaxBufferBytes must be a positive integer'
    },
    {
        description: 'options.execMaxBufferBytes must be a positive integer, null was passed',
        fftoolPath: '/ffprobe',
        options: {execTimeoutInMsec: 1000, execMaxBufferBytes: null, endOfLine: '\n'},
        errorMsg: 'options.execMaxBufferBytes must be a positive integer'
    },
];

module.exports = {
    endOfLineTestData,
    validExecOptionsTestData,
    optionsThatThrowErrorsTestData,
};

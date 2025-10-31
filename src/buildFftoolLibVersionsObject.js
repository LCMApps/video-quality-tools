'use strict';

const {exec} = require('child_process');
const {promisify} = require('util');
const os = require('os');

const Errors = require('./Errors');
const FftoolLibVersions = require('./FftoolsLibVersions');

const execAsync = promisify(exec);

const FFPROBE_VERSION_EXEC_TIMEOUT_MSEC = 1000;
const FFPROBE_VERSION_EXEC_MAX_BUFFER_BYTES = 10240;

/**
 * @param {string} fftoolPath
 * @param {number} execTimeoutMsec
 * @param {number} execMaxBuffer
 * @returns {Promise<string>}
 */
async function execFftoolVersion(
    fftoolPath,
    execTimeoutMsec = FFPROBE_VERSION_EXEC_TIMEOUT_MSEC,
    execMaxBuffer = FFPROBE_VERSION_EXEC_MAX_BUFFER_BYTES
) {
    try {
        const { stdout } = await execAsync(
            `${fftoolPath} -version`,
            {
                timeout: execTimeoutMsec,
                maxBuffer: execMaxBuffer,
            }
        );

        return stdout;
    } catch (e) {
        throw new Errors.ExecutablePathError(e.message, {path: fftoolPath});
    }
}

/**
 * @param {string} fftoolOutput
 * @param {string} eol
 * @return {Map<string, string>}
 */
function detectFftoolLibVersions(fftoolOutput, eol = os.EOL) {
    const lines = fftoolOutput.split(eol);
    const libVersionsMap = new Map();

    lines.forEach(line => {
        const match = line.match(/(lib\w+)\s+(\d+)\.\s*(\d+)\.(\d+)/);
        if (match) {
            const libName = match[1];
            const libVersion = `${match[2]}.${match[3]}.${match[4]}`;
            libVersionsMap.set(libName, libVersion);
        }
    });

    return libVersionsMap;
}

/**
 * @param {string} fftoolPath
 * @param {object} [options]
 * @param {number} [options.execTimeoutInMsec] positive integer including 0
 * @param {number} [options.execMaxBufferBytes] positive integer, can not be 0
 * @param {string} [options.endOfLine]
 * @return {Promise<FftoolLibVersions>}
 */
async function buildFftoolLibVersionsObject(fftoolPath, options = {}) {

    if (typeof fftoolPath !== 'string' || fftoolPath.trim().length === 0) {
        throw new TypeError('fftoolPath must be a non-empty string');
    }

    // Validate and normalize options
    const {
        execTimeoutInMsec = FFPROBE_VERSION_EXEC_TIMEOUT_MSEC,
        execMaxBufferBytes = FFPROBE_VERSION_EXEC_MAX_BUFFER_BYTES,
        endOfLine = os.EOL,
    } = options;

    if (!Number.isInteger(execTimeoutInMsec) || execTimeoutInMsec < 0) {
        throw new TypeError('options.execTimeoutInMsec must be a non-negative integer');
    }

    if (!Number.isInteger(execMaxBufferBytes) || execMaxBufferBytes <= 0) {
        throw new TypeError('options.execMaxBufferBytes must be a positive integer');
    }

    if (typeof endOfLine !== 'string' || endOfLine.length === 0) {
        throw new TypeError('options.endOfLine must be a non-empty string');
    }

    const stdout = await execFftoolVersion(fftoolPath, execTimeoutInMsec, execMaxBufferBytes);
    const libVersionsMap = detectFftoolLibVersions(stdout, endOfLine);

    return new FftoolLibVersions(libVersionsMap);
}


module.exports = buildFftoolLibVersionsObject;

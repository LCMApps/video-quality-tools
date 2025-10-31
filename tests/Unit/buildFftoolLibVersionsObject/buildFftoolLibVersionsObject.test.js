'use strict';

const { assert } = require('chai');
const dataDriven = require('data-driven');
const proxyquire = require('proxyquire');
const FftoolLibVersions = require('src/FftoolsLibVersions');
const Errors = require('src/Errors');

const testData = require('./buildFftoolLibVersionsObject.data');

const DEFAULT_FFTOOL_VERSION_EXEC_TIMEOUT_IN_MSEC = 1000;
const DEFAULT_FFTOOL_VERSION_EXEC_MAX_BUFFER_BYTES = 10240;

/**
 * Creates stub for child_process.exec with isolated calls capturer.
 * resolveWith: stdout if successfully.
 * rejectWith: Error if error occurred.
 */
function makeChildProcessStub({ resolveWith, rejectWith }) {
    const callsCapturer = [];

    const stub = {
        exec: (cmd, opts, cb) => {
            callsCapturer.push({ cmd, opts: opts || {} });
            setImmediate(() => {
                if (rejectWith) {
                    cb(rejectWith);
                } else {
                    cb(null, { stdout: resolveWith || '', stderr: '' });
                }
            });
        }
    };

    return {stub, callsCapturer};
}

function loadModuleWithStubs(childProcessStub) {
    return proxyquire('src/buildFftoolLibVersionsObject', {
        'child_process': childProcessStub,
    });
}

describe('buildFftoolLibVersionsObject', () => {
    dataDriven(testData.endOfLineTestData, () => {
        it(`Parses lib versions with "{humanReadable}" eol`, async ctx => { // eslint-disable-line
            const expected = [
                'ffmpeg version 8.0 Copyright (c) 2000-2025 the FFmpeg developers',
                'built with Apple clang version 16.0.0 (clang-1600.0.26.6)',
                'configuration: --prefix=/opt/ffmpeg/8.0_1 --enable-shared --enable-pthreads --enable-version3 --cc=clang', // eslint-disable-line
                'libavutil      60.  8.100 / 60.  8.100',
                'libavcodec     62. 11.100 / 62. 11.100',
                'libavformat    62.  3.100 / 62.  3.100',
                'libavdevice    62.  1.100 / 62.  1.100',
                'libavfilter    11.  4.100 / 11.  4.100',
                'libswscale      9.  1.100 /  9.  1.100',
                'libswresample   6.  1.100 /  6.  1.100',
                '',
                'Exiting with exit code 0',
            ].join(ctx.endOfLine);

            const {stub: execStub, callsCapturer} = makeChildProcessStub({
                resolveWith: expected
            });
            const buildFftoolLibVersionsObjectStub = loadModuleWithStubs(execStub);

            const fftoolLibVersions = await buildFftoolLibVersionsObjectStub('/path/to/ffprobe',
                { endOfLine: ctx.endOfLine }
            );

            assert.instanceOf(fftoolLibVersions, FftoolLibVersions);

            assert.equal(fftoolLibVersions.getVersion(FftoolLibVersions.LIBAVUTIL), '60.8.100');
            assert.equal(fftoolLibVersions.getVersion(FftoolLibVersions.LIBAVCODEC), '62.11.100');
            assert.equal(fftoolLibVersions.getVersion(FftoolLibVersions.LIBAVFORMAT), '62.3.100');
            assert.equal(fftoolLibVersions.getVersion(FftoolLibVersions.LIBAVDEVICE), '62.1.100');
            assert.equal(fftoolLibVersions.getVersion(FftoolLibVersions.LIBSWSCALE), '9.1.100');
            assert.equal(fftoolLibVersions.getVersion(FftoolLibVersions.LIBSWRESAMPLE), '6.1.100');


            assert.lengthOf(callsCapturer, 1);
            assert.equal(callsCapturer[0].cmd, '/path/to/ffprobe -version');
            assert.equal(callsCapturer[0].opts.timeout, DEFAULT_FFTOOL_VERSION_EXEC_TIMEOUT_IN_MSEC);
            assert.equal(callsCapturer[0].opts.maxBuffer, DEFAULT_FFTOOL_VERSION_EXEC_MAX_BUFFER_BYTES);
        });
    });


    dataDriven(testData.validExecOptionsTestData, () => {
        it(`Accepts custom execTimeoutInMsec ({execTimeoutInMsec}) and execMaxBufferBytes ({execMaxBufferBytes})`, async ctx => { // eslint-disable-line
            const endOfLine = '\n';
            const stdout = [
                'ffmpeg version 8.0 Copyright (c) 2000-2025 the FFmpeg developers',
                'built with Apple clang version 16.0.0 (clang-1600.0.26.6)',
                'configuration: --prefix=/opt/ffmpeg/8.0_1 --enable-shared --enable-pthreads --enable-version3 --cc=clang', // eslint-disable-line
                'libavutil      60.  8.100 / 60.  8.100',
                '',
                'Exiting with exit code 0',
            ].join(endOfLine);

            const {stub: execStub, callsCapturer} = makeChildProcessStub({
                resolveWith: stdout
            });
            const buildFftoolLibVersionsObjectStub = loadModuleWithStubs(execStub);

            const {
                execTimeoutInMsec,
                expectedExecTimeoutInMsec,
                execMaxBufferBytes,
                expectedExecMaxBufferBytes,
            } = ctx;

            const options = {
                endOfLine: endOfLine,
            };

            if (execTimeoutInMsec !== null) {
                options.execTimeoutInMsec = execTimeoutInMsec;
            }

            if (execMaxBufferBytes !== null) {
                options.execMaxBufferBytes = execMaxBufferBytes;
            }

            const fftoolLibVersions = await buildFftoolLibVersionsObjectStub('/path/to/ffprobe', options);

            assert.instanceOf(fftoolLibVersions, FftoolLibVersions);

            assert.equal(fftoolLibVersions.getVersion(FftoolLibVersions.LIBAVUTIL), '60.8.100');

            assert.lengthOf(callsCapturer, 1);
            assert.equal(callsCapturer[0].cmd, '/path/to/ffprobe -version');
            assert.equal(callsCapturer[0].opts.timeout, expectedExecTimeoutInMsec);
            assert.equal(callsCapturer[0].opts.maxBuffer, expectedExecMaxBufferBytes);
        });
    });

    dataDriven(testData.optionsThatThrowErrorsTestData, () => {
        it('{description}', async ctx => {
            const {
                fftoolPath,
                options,
                errorMsg: expectedErrorMsg,
            } = ctx;

            const stdout = [
                'ffmpeg version 8.0 Copyright (c) 2000-2025 the FFmpeg developers',
                'built with Apple clang version 16.0.0 (clang-1600.0.26.6)',
                'configuration: --prefix=/opt/ffmpeg/8.0_1 --enable-shared --enable-pthreads --enable-version3 --cc=clang', // eslint-disable-line
                'libavutil      60.  8.100 / 60.  8.100',
                '',
                'Exiting with exit code 0',
            ].join(options.endOfLine);

            const {stub: execStub} = makeChildProcessStub({
                resolveWith: stdout
            });
            const buildFftoolLibVersionsObjectStub = loadModuleWithStubs(execStub);

            try {
                await buildFftoolLibVersionsObjectStub(fftoolPath, options);
                throw new TypeError('Expected TypeError was not thrown');
            } catch (err) {
                assert.instanceOf(err, TypeError);
                assert.include(err.message, expectedErrorMsg);
            }
        });
    });

    it('Wraps exec errors into ExecutablePathError', async () => {
        const execErr = new Error('spawned process failed');
        execErr.code = 2;

        const {stub: execStub} = makeChildProcessStub({
            rejectWith: execErr
        });
        const buildFftoolLibVersionsObjectStub = loadModuleWithStubs(execStub);

        try {
            await buildFftoolLibVersionsObjectStub('/bad/ffprobe', { endOfLine: '\n' });
            assert.fail('Expected ExecutablePathError not thrown');
        } catch (e) {
            assert.instanceOf(e, Errors.ExecutablePathError);
            assert.match(e.message, /spawned process failed/);
            assert.equal(e.extra.path, '/bad/ffprobe');
        }
    });
});

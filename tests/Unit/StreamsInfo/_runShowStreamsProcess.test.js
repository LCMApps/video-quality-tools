'use strict';

const {assert}   = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const {correctPath, correctUrl} = require('./Helpers/');

function getExecCommand(ffprobePath, timeout, analyzeDuration, url) {
    const commandArgs = [ffprobePath, '-hide_banner', '-v error'];

    if (analyzeDuration) {
        commandArgs.push('-analyzeduration', analyzeDuration);
    }

    commandArgs.push('-rw_timeout', timeout, '-show_streams', '-print_format json', '-i', url);

    return commandArgs.join(' ');
}

describe('StreamsInfo::_runShowStreamsProcess', () => {
    const timeoutInMs = 1000;

    it('must returns child process object just fine', () => {
        const analyzeDurationInMs    = undefined;
        const expectedFfprobeCommand = getExecCommand(
            correctPath, timeoutInMs * 1000, analyzeDurationInMs, correctUrl
        );

        const execOutput = {cp: true};
        const exec       = () => execOutput;
        const spyExec    = sinon.spy(exec);

        const stubPromisify = sinon.stub();
        stubPromisify.returns(spyExec);

        const StreamsInfo = proxyquire('src/StreamsInfo', {
            fs: {
                accessSync(filePath) {
                    if (filePath !== correctPath) {
                        throw new Error('no such file or directory');
                    }
                }
            },
            util: {
                promisify: stubPromisify
            },
            child_process: {
                exec: spyExec
            }
        });

        const streamsInfo = new StreamsInfo({
            ffprobePath: correctPath,
            timeoutInMs
        }, correctUrl);

        const result = streamsInfo._runShowStreamsProcess();

        assert.strictEqual(result, execOutput);

        assert.isTrue(spyExec.calledOnce);
        assert.isTrue(
            spyExec.calledWithExactly(expectedFfprobeCommand)
        );
    });

    it('must returns child process object just fine and ffprobe with analyzeduration argument', () => {
        const analyzeDurationInMs    = 5000;
        const expectedFfprobeCommand = getExecCommand(
            correctPath, timeoutInMs * 1000, analyzeDurationInMs * 1000, correctUrl
        );

        const execOutput = {cp: true};
        const exec       = () => execOutput;
        const spyExec    = sinon.spy(exec);

        const stubPromisify = sinon.stub();
        stubPromisify.returns(spyExec);

        const StreamsInfo = proxyquire('src/StreamsInfo', {
            fs: {
                accessSync(filePath) {
                    if (filePath !== correctPath) {
                        throw new Error('no such file or directory');
                    }
                }
            },
            util: {
                promisify: stubPromisify
            },
            child_process: {
                exec: spyExec
            }
        });

        const streamsInfo = new StreamsInfo({
            ffprobePath: correctPath,
            timeoutInMs,
            analyzeDurationInMs
        }, correctUrl);

        const result = streamsInfo._runShowStreamsProcess();

        assert.strictEqual(result, execOutput);

        assert.isTrue(spyExec.calledOnce);
        assert.isTrue(
            spyExec.calledWithExactly(expectedFfprobeCommand)
        );
    });

});

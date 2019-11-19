'use strict';

const {assert}   = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const {correctPath, correctUrl} = require('./Helpers/');

function getExecCommand(ffprobePath, analyzeDurationMs, url) {
    const commandArgs = [ffprobePath, '-hide_banner', '-v error'];

    if (analyzeDurationMs) {
        commandArgs.push('-analyzeduration', analyzeDurationMs);
    }

    commandArgs.push('-show_streams', '-print_format json', '-i', url);

    return commandArgs.join(' ');
}

describe('StreamsInfo::_runShowStreamsProcess', () => {
    it('must returns child process object just fine', () => {
        const analyzeDurationMs      = undefined;
        const expectedFfprobeCommand = getExecCommand(correctPath, analyzeDurationMs, correctUrl);

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
            ffprobePath : correctPath
        }, correctUrl);

        const result = streamsInfo._runShowStreamsProcess();

        assert.strictEqual(result, execOutput);

        assert.isTrue(spyExec.calledOnce);
        assert.isTrue(
            spyExec.calledWithExactly(expectedFfprobeCommand)
        );
    });

    it('must returns child process object just fine and ffprobe with analyzeduration argument', () => {
        const analyzeDurationMs      = 5000;
        const expectedFfprobeCommand = getExecCommand(correctPath, analyzeDurationMs, correctUrl);

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
            ffprobePath : correctPath,
            analyzeDurationMs
        }, correctUrl);

        const result = streamsInfo._runShowStreamsProcess();

        assert.strictEqual(result, execOutput);

        assert.isTrue(spyExec.calledOnce);
        assert.isTrue(
            spyExec.calledWithExactly(expectedFfprobeCommand)
        );
    });

});

'use strict';

const {assert}   = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const {correctPath, correctUrl} = require('./Helpers/');

function getExecCommand(ffprobePath, timeout, url) {
    return `\
            ${ffprobePath}\
            -hide_banner\
            -v error\
            -show_streams\
            -print_format json\
            -rw_timeout ${timeout}\
            ${url}\
        `;
}

describe('StreamsInfo::_runShowStreamsProcess', () => {
    const timeoutInMs = 1000;

    it('must returns child process object just fine', () => {
        const expectedFfprobeCommand = getExecCommand(correctPath, timeoutInMs * 1000, correctUrl);

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
});

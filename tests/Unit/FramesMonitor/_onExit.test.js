'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const ExitReasons = require('src/ExitReasons');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers');

describe('FramesMonitor::_onExit', () => {
    let framesMonitor;
    let childProcess;

    let stubRunShowFramesProcess;
    let spyOnRemoveAllListeners;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);

        framesMonitor.listen();

        spyOnRemoveAllListeners = sinon.spy(framesMonitor._cp, 'removeAllListeners');
    });

    afterEach(() => {
        stubRunShowFramesProcess.restore();
        spyOnRemoveAllListeners.restore();
    });

    const data = [
        {
            exitCode      : undefined,
            exitSignal    : 'SIGTERM',
            stderrOutput  : [],
            expectedReason: new ExitReasons.ExternalSignal({signal: 'SIGTERM'})
        },
        {
            exitCode      : 0,
            exitSignal    : undefined,
            stderrOutput  : [],
            expectedReason: new ExitReasons.NormalExit({code: 0})
        },
        {
            exitCode      : 1,
            exitSignal    : null,
            stderrOutput  : [],
            expectedReason: new ExitReasons.AbnormalExit({code: 1, stderrOutput: ''})
        },
        {
            exitCode      : 1,
            exitSignal    : null,
            stderrOutput  : [
                'error1',
                'error2',
                'error3'
            ],
            expectedReason: new ExitReasons.AbnormalExit({code: 1, stderrOutput: 'error1\nerror2\nerror3'})
        }
    ];

    data.forEach(testCase => {
        it('must emit exit event with correct reason type ExternalSignal', done => {
            const {exitCode, exitSignal} = testCase;

            framesMonitor.on('exit', reason => {
                assert.instanceOf(reason, testCase.expectedReason.constructor);
                assert.deepEqual(reason, testCase.expectedReason);

                assert.isTrue(spyOnRemoveAllListeners.calledOnce);
                assert.isTrue(spyOnRemoveAllListeners.calledWithExactly());

                assert.isNull(framesMonitor._cp);

                // done is used in order to check that exactly exit event has been emitted
                done();
            });

            framesMonitor._stderrOutputs = testCase.stderrOutput;

            framesMonitor._onExit(exitCode, exitSignal);
        });
    });
});

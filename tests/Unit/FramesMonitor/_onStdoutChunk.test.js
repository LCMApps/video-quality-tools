'use strict';

const sinon    = require('sinon');
const {assert} = require('chai');

const {correctPath, correctUrl, FramesMonitor} = require('./Helpers/');

describe('FramesMonitor::_onStdoutChunk must skip invalid type, only Buffer type is accepted', () => {

    const framesMonitor = new FramesMonitor({
        ffprobePath : correctPath,
        timeoutInSec: 1
    }, correctUrl);

    let spyReduceFramesFromStdoutBuffer;
    let spyFrameToJson;

    beforeEach(() => {
        spyReduceFramesFromStdoutBuffer = sinon.spy(framesMonitor, '_reduceFramesFromStdoutBuffer');
        spyFrameToJson                  = sinon.spy(framesMonitor, '_frameToJson');
    });

    afterEach(() => {
        spyReduceFramesFromStdoutBuffer.restore();
        spyFrameToJson.restore();
    });

});

describe('FramesMonitor::_onStdoutChunk must process correct input', () => {

    let framesMonitor;
    let spyReduceFramesFromStdoutBuffer;
    let spyFrameToJson;
    let spyOnCompleteFrame;

    beforeEach(() => {
        framesMonitor = new FramesMonitor({
            ffprobePath : correctPath,
            timeoutInSec: 1
        }, correctUrl);

        spyReduceFramesFromStdoutBuffer = sinon.spy(framesMonitor, '_reduceFramesFromStdoutBuffer');
        spyFrameToJson                  = sinon.spy(framesMonitor, '_frameToJson');
        spyOnCompleteFrame              = sinon.spy();
    });

    afterEach(() => {
        spyReduceFramesFromStdoutBuffer.restore();
        spyFrameToJson.restore();
        spyOnCompleteFrame.reset();
    });

    it('must not emit empty frame', done => {
        const expectedResult = [];

        const input = Buffer.from('');

        framesMonitor.on('frame', spyOnCompleteFrame);

        framesMonitor._onStdoutChunk(input);

        setImmediate(() => {
            assert(spyReduceFramesFromStdoutBuffer.calledOnce);
            assert.isTrue(spyReduceFramesFromStdoutBuffer.firstCall.calledWithExactly(''));
            assert.isTrue(spyReduceFramesFromStdoutBuffer.firstCall.returned(expectedResult));

            assert(spyFrameToJson.notCalled);

            assert(spyOnCompleteFrame.notCalled);

            done();
        });
    });

    it('must not emit uncomplete frame', done => {
        const expectedResult = [];

        const input = Buffer.from('[FRAME]\na=b\n');

        framesMonitor.on('frame', spyOnCompleteFrame);

        framesMonitor._onStdoutChunk(input);

        setImmediate(() => {
            assert(spyReduceFramesFromStdoutBuffer.calledOnce);
            assert.isTrue(spyReduceFramesFromStdoutBuffer.firstCall.calledWithExactly('[FRAME]\na=b\n'));
            assert.isTrue(spyReduceFramesFromStdoutBuffer.firstCall.returned(expectedResult));

            assert(spyFrameToJson.notCalled);

            assert(spyOnCompleteFrame.notCalled);

            done();
        });
    });

    it('must emit valid frame in js object format', done => {
        const expectedResult = {
            a: 1,
            b: 'b'
        };

        const input = Buffer.from('[FRAME]\na=1\nb=b\n[/FRAME]');

        framesMonitor._onStdoutChunk(input);

        framesMonitor.on('frame', spyOnCompleteFrame);

        setImmediate(() => {
            assert(spyReduceFramesFromStdoutBuffer.calledOnce);
            assert.isTrue(spyReduceFramesFromStdoutBuffer.firstCall.calledWithExactly('[FRAME]\na=1\nb=b\n[/FRAME]'));
            assert.isTrue(spyReduceFramesFromStdoutBuffer.firstCall.returned(['[FRAME]\na=1\nb=b']));

            assert(spyFrameToJson.calledOnce);
            assert.isTrue(spyFrameToJson.firstCall.calledWithExactly('[FRAME]\na=1\nb=b'));
            assert.isTrue(spyFrameToJson.firstCall.returned(expectedResult));

            assert(spyOnCompleteFrame.calledOnce);

            assert.isTrue(spyOnCompleteFrame.firstCall.calledWithExactly(expectedResult));

            done();
        });
    });

    it('must emit complete raw frames in json format, which has been accumulated by several chunks', done => {
        const tests = [
            {input: Buffer.from('[FRAME]\na=b\nc=d\n'), result: []},
            {input: Buffer.from('a2=b2\nc2=d2\n'), result: []},
            {input: Buffer.from('e2=f2\n[/FRAME]\n'), result: ['[FRAME]\na=b\nc=d\na2=b2\nc2=d2\ne2=f2']},
            {input: Buffer.from('[FRAME]\na=b\n[/FRAME]\n'), result: ['[FRAME]\na=b']},
            {input: Buffer.from('[FRAME]\na=b\nc=d\n'), result: []}
        ];

        const expectedResult1 = {
            a : 'b',
            c : 'd',
            a2: 'b2',
            c2: 'd2',
            e2: 'f2'
        };

        const expectedResult2 = {a: 'b'};

        tests.forEach(item => {
            framesMonitor._onStdoutChunk(item.input);
        });

        framesMonitor.on('frame', spyOnCompleteFrame);

        setImmediate(() => {
            assert(spyOnCompleteFrame.calledTwice);

            assert.isTrue(spyOnCompleteFrame.firstCall.calledWithExactly(expectedResult1));
            assert.isTrue(spyOnCompleteFrame.secondCall.calledWithExactly(expectedResult2));

            assert(spyReduceFramesFromStdoutBuffer.callCount, tests.length);

            tests.forEach((item, index) => {
                assert.isTrue(spyReduceFramesFromStdoutBuffer.getCall(index).calledWithExactly(tests[index].input.toString())); // eslint-disable-line
                assert.isTrue(spyReduceFramesFromStdoutBuffer.getCall(index).returned(tests[index].result));
            });

            assert(spyFrameToJson.calledTwice);

            assert.isTrue(spyFrameToJson.firstCall.calledWithExactly('[FRAME]\na=b\nc=d\na2=b2\nc2=d2\ne2=f2'));
            assert.isTrue(spyFrameToJson.firstCall.returned(expectedResult1));

            assert.isTrue(spyFrameToJson.secondCall.calledWithExactly('[FRAME]\na=b'));
            assert.isTrue(spyFrameToJson.secondCall.returned(expectedResult2));

            done();
        });
    });

});

'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const Errors = require('src/Errors');

const {bufferMaxLengthInBytes, makeFramesReducer} = require('./Helpers');

describe('FramesReducer::process', () => {

    let framesReducer;

    beforeEach(() => {
        framesReducer = makeFramesReducer();
    });

    it('must emit complete raw frames which has been accumulated by several chunks', () => {
        const tests = [
            '[FRAME]\na=b\nc=d\n',
            'a2=b2\nc2=d2\n',
            'e2=f2\n[/FRAME]\n',
            '[FRAME]\na=b\n[/FRAME]\n',
            '[FRAME]\na=b\nc=d\n',
        ];

        const expectedResult1 = {a: 'b', c: 'd', a2: 'b2', c2: 'd2', e2: 'f2'};
        const expectedResult2 = {a: 'b'};

        const spy = sinon.spy();

        framesReducer.on('frame', spy);

        tests.forEach(test => framesReducer.process(test));

        assert.isTrue(spy.calledTwice);
        assert.isTrue(spy.firstCall.calledWithExactly(expectedResult1));
        assert.isTrue(spy.secondCall.calledWithExactly(expectedResult2));

        spy.reset();
    });

    it('must emit error, invalid data input (too big frame, probably infinite)', () => {
        const smallInput = '\na=b\n'.repeat(10);
        const largeInput = '\na=b\n'.repeat(bufferMaxLengthInBytes - 10);

        framesReducer.on('error', error => {
            assert.instanceOf(error, Errors.InvalidFrameError);

            assert.strictEqual(
                error.message,
                'Too long (probably infinite) frame.' +
                `The frame length is ${smallInput.length + largeInput.length}.` +
                `The max frame length must be ${bufferMaxLengthInBytes}`
            );
        });

        framesReducer.process(smallInput);
        framesReducer.process(largeInput);
    });

});

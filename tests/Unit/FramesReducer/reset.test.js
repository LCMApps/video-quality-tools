'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');

const Errors = require('src/Errors');

const {bufferMaxLengthInBytes, makeFramesReducer} = require('./Helpers');

describe('FramesReducer::reset', () => {

    let framesReducer;

    beforeEach(() => {
        framesReducer = makeFramesReducer();
    });

    it("must emit an error on the second process call, the cache buffer is exhausted and reset wasn't called", done => {
        const data = 'b'.repeat(bufferMaxLengthInBytes / 2);

        const input1 = `[FRAME]\na=${data}`;
        const input2 = data;

        framesReducer.process(input1);
        framesReducer.process(input2);

        framesReducer.on('error', error => {
            assert.instanceOf(error, Errors.InvalidFrameError);

            assert.strictEqual(
                error.message,
                'Too long (probably infinite) frame.' +
                `The frame length is ${input1.length + input2.length}.` +
                `The max frame length must be ${bufferMaxLengthInBytes}`
            );

            done();
        });
    });

    it('must not emit an error on the second process call, the reset method was called', done => {
        const spy = sinon.spy();

        const input = 'b'.repeat(bufferMaxLengthInBytes / 2);

        framesReducer.process(`[FRAME]\na=${input}`);

        framesReducer.reset();

        framesReducer.process(input);

        framesReducer.on('error', spy);

        setTimeout(() => {
            // check that error event on nextTick was not emitted
            assert.isFalse(spy.called);

            spy.reset();

            done();
        }, 0);
    });

});

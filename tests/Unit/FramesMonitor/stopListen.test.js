'use strict';

const {assert} = require('chai');
const sinon    = require('sinon');
const Errors   = require('src/Errors');

const {config, url, FramesMonitor, makeChildProcess} = require('./Helpers/');

describe('FramesMonitor::stopListen', () => {

    let framesMonitor;
    let childProcess;

    let spyOnKill;
    let stubRunShowFramesProcess;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);

        childProcess = makeChildProcess();

        spyOnKill                = sinon.spy(childProcess, 'kill');
        stubRunShowFramesProcess = sinon.stub(framesMonitor, '_runShowFramesProcess').returns(childProcess);
    });

    afterEach(() => {
        spyOnKill.reset();
        stubRunShowFramesProcess.restore();
    });

    it('must throw an exception when try to stop listen before start listening', () => {
        const expectedIsListening  = false;
        const expectedErrorType    = Errors.AlreadyStoppedListenError;
        const expectedErrorMessage = 'This service is already stopped.';

        try {
            framesMonitor.stopListen();
            assert.isTrue(false, 'Should not be here');
        } catch (err) {
            assert.instanceOf(err, expectedErrorType);

            assert.strictEqual(err.message, expectedErrorMessage);

            assert.isFalse(spyOnKill.called);

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());
        }
    });

    it('must stop listen just fine', done => {
        const expectedSignal      = 'SIGTERM';
        const expectedIsListening = false;

        framesMonitor.listen();
        framesMonitor.stopListen();

        framesMonitor.on('exit', () => {
            assert.isTrue(spyOnKill.calledOnce);
            assert.isTrue(spyOnKill.alwaysCalledWithExactly(expectedSignal));

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());

            done();
        });
    });

    it('must stop listen with custom signal just fine', done => {
        const expectedSignal      = 'SIGKILL';
        const expectedIsListening = false;

        framesMonitor.listen();
        framesMonitor.stopListen(expectedSignal);

        framesMonitor.on('exit', () => {
            assert.isTrue(spyOnKill.calledOnce);
            assert.isTrue(spyOnKill.alwaysCalledWithExactly(expectedSignal));

            assert.strictEqual(expectedIsListening, framesMonitor.isListening());

            done();
        });
    });

    it('must throw an exception when try to stop listen several times in a row', done => {
        const expectedIsListening  = false;
        const expectedErrorType    = Errors.AlreadyStoppedListenError;
        const expectedErrorMessage = 'This service is already stopped.';

        framesMonitor.listen();
        framesMonitor.stopListen();

        framesMonitor.on('exit', () => {
            try {
                framesMonitor.stopListen();
                assert.isTrue(false, 'Should not be here');
            } catch (err) {
                assert.instanceOf(err, expectedErrorType);

                assert.strictEqual(err.message, expectedErrorMessage);

                assert.isTrue(spyOnKill.calledOnce);

                assert.strictEqual(expectedIsListening, framesMonitor.isListening());

                done();
            }
        });
    });

});

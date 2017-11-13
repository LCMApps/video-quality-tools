'use strict';

const fs         = require('fs');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');
const {assert}   = require('chai');

const Errors = require('src/Errors');

const {config} = require('./Helpers');

describe('FramesMonitor::_assertExecutable', () => {
    it('do nothing if path points to executable file', () => {
        const stubAccessSync = sinon.stub();

        const FramesMonitor = proxyquire('src/FramesMonitor', {
            fs: {
                accessSync: stubAccessSync
            }
        });

        FramesMonitor._assertExecutable(config.ffprobePath);

        assert.isTrue(stubAccessSync.calledOnce);
        assert.isTrue(stubAccessSync.calledWithExactly(config.ffprobePath, fs.constants.X_OK));
    });

    it('throw an exception if accessSync throws an error', () => {
        const expectedError  = new Error('1');
        const stubAccessSync = sinon.stub().throws(expectedError);

        const FramesMonitor = proxyquire('src/FramesMonitor', {
            fs: {
                accessSync: stubAccessSync
            }
        });

        try {
            FramesMonitor._assertExecutable(config.ffprobePath);
            assert.isTrue(false, '_assertExecutable should throw an error, and you should not be here');
        } catch (err) {
            assert.isTrue(stubAccessSync.calledOnce);
            assert.isTrue(stubAccessSync.calledWithExactly(config.ffprobePath, fs.constants.X_OK));

            assert.instanceOf(err, Errors.ExecutablePathError);
            assert.strictEqual(err.message, expectedError.message);
            assert.deepEqual(err.extra, {
                path: config.ffprobePath
            });
        }
    });
});

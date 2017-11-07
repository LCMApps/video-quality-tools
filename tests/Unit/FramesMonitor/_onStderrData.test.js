'use strict';

const {assert} = require('chai');

const {config, url, FramesMonitor} = require('./Helpers');

describe('FramesMonitor::_onStderrData', () => {
    let framesMonitor;

    beforeEach(() => {
        framesMonitor = new FramesMonitor(config, url);
    });

    it('must store last N data from process stderr output', () => {
        const expectedMessage = `got stderr output from a ${config.ffprobePath} process`;

        const STDERR_OBJECTS_LIMIT = 5;
        const overflowOffset       = 2;

        const numberOfItems = STDERR_OBJECTS_LIMIT + overflowOffset;

        const stderr = 'some error with id: ';

        for (let i = 0; i < numberOfItems; i++) {
            framesMonitor._onStderrData(Buffer.from(stderr + i));
        }

        assert.lengthOf(framesMonitor._stderrOutputs, STDERR_OBJECTS_LIMIT);

        framesMonitor._stderrOutputs.forEach((errObject, index) => {
            const currentErrorIndex = index + overflowOffset;
            const expectedString    = stderr + currentErrorIndex.toString();

            assert.strictEqual(errObject.message, expectedMessage);

            assert.deepEqual(errObject.extra, {
                data: expectedString,
                url : url
            });
        });
    });
});

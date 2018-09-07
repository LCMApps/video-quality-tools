'use strict';

const {assert} = require('chai');

const processFrames = require('src/processFrames');

describe('processFrames.calculateGopDuration', () => {

    it('must correct calculate min, max and average gopDuration for gops', () => {
        const expectedGopDuration = {
            min : 1,
            max : 6,
            mean: 3.5
        };

        const gops = [
            {
                startTime: 1,
                endTime  : 2
            },
            {
                startTime: 3,
                endTime  : 9
            }
        ];

        const gopDuration = processFrames.calculateGopDuration(gops);

        assert.deepEqual(gopDuration, expectedGopDuration);
    });

});

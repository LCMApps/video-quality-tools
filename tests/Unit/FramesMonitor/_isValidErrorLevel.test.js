'use strict';

const {assert} = require('chai');

const FramesMonitor = require('src/FramesMonitor');
const {config}      = require('./Helpers');

describe('FramesMonitor::_isValidErrorLevel', () => {
    it('must return true for correct error level', () => {
        const expectedResult = true;

        const result = FramesMonitor._isValidErrorLevel(config.errorLevel);

        assert.strictEqual(result, expectedResult);
    });

    it('must return false for in-correct error level', () => {
        const incorrectPath  = 'incorrect-part';
        const expectedResult = false;

        const result = FramesMonitor._isValidErrorLevel(config.errorLevel + incorrectPath);

        assert.strictEqual(result, expectedResult);
    });
});
